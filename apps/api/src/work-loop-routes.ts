import type { FastifyInstance } from "fastify";
import type { WorkItem } from "@realmos/contracts";
import {
  generateCursorWorkPacket,
  importCursorCompletionReport,
  makeWorkLoopId,
  selectNextBestWork
} from "@realmos/work-loop";
import { enrichCursorWorkPacketWithRepositoryBoundary } from "@realmos/realm-scope";
import { enrichCursorWorkPacketWithInfrastructureBoundary } from "@realmos/platform-infra";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { realmStore } from "./lib/realm-store";
import { platformInfraStore } from "./lib/platform-infra-store";

export async function buildWorkLoopConsole(db: RealmOSDatabase) {
  const [policy, workItems, packets, reports, decisions] = await Promise.all([
    db.getContinuousWorkPolicy(),
    db.listWorkItems(),
    db.listCursorWorkPackets(),
    db.listCursorCompletionReports(),
    db.listNextBestWorkDecisions()
  ]);

  return {
    policy,
    workItems,
    cursorWorkPackets: packets,
    cursorCompletionReports: reports,
    latestDecision: decisions.at(-1) ?? null,
    pendingHumanItems: workItems.filter(
      (item) => item.status === "waiting_for_user" || item.status === "waiting_for_approval"
    )
  };
}

export function registerWorkLoopRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/work-loop/policy", async () => ({
    policy: await db.getContinuousWorkPolicy()
  }));

  app.get("/api/work-items", async () => ({ items: await db.listWorkItems() }));

  app.post("/api/work-items", async (request, reply) => {
    const body = request.body as WorkItem;
    const created = await db.createWorkItem(body);
    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Work item created: ${created.title}`,
      payload: { workItemId: created.id }
    });
    return reply.code(201).send(created);
  });

  app.post("/api/work-loop/next-best", async () => {
    const [policy, items] = await Promise.all([db.getContinuousWorkPolicy(), db.listWorkItems()]);
    const decision = selectNextBestWork(items, policy);
    await db.appendNextBestWorkDecision(decision);
    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Next best work: ${decision.decision}`,
      payload: { decisionId: decision.id, selectedWorkItemId: decision.selectedWorkItemId }
    });
    return { decision, policy };
  });

  app.get("/api/work-loop/decisions", async () => ({
    items: await db.listNextBestWorkDecisions()
  }));

  app.get("/api/work-loop/packets", async () => ({
    items: await db.listCursorWorkPackets()
  }));

  app.post("/api/work-loop/packets/generate", async (request, reply) => {
    const body = request.body as {
      workItemId?: string;
      createdByAgentId?: string;
      realmId?: string;
      repositoryBindingId?: string;
      scope?: "global" | "realm";
      infrastructurePlanId?: string;
    };
    if (!body.workItemId) {
      return reply.code(400).send({ error: "workItemId is required" });
    }

    const workItem = await db.getWorkItem(body.workItemId);
    if (!workItem) return reply.code(404).send({ error: "Work item not found" });

    let packet = generateCursorWorkPacket({
      workItem,
      createdByAgentId: body.createdByAgentId
    });

    if (body.realmId && body.repositoryBindingId) {
      const binding = await realmStore.getRepositoryBinding(body.repositoryBindingId);
      if (!binding) return reply.code(404).send({ error: "Repository binding not found" });

      packet = enrichCursorWorkPacketWithRepositoryBoundary({
        packet,
        realmId: body.realmId,
        scope: body.scope ?? (body.realmId === "realm_realmos" ? "global" : "realm"),
        repositoryBinding: binding
      });
    }

    if (body.infrastructurePlanId) {
      const plan = await platformInfraStore.getProjectInfrastructurePlan(body.infrastructurePlanId);
      if (!plan) return reply.code(404).send({ error: "Infrastructure plan not found" });

      const approvals = await platformInfraStore.listPrototypeApprovals();
      packet = enrichCursorWorkPacketWithInfrastructureBoundary({ packet, plan, approvals });
    }

    await db.createCursorWorkPacket(packet);
    await db.updateWorkItem(workItem.id, { status: "waiting_for_report" });

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Cursor work packet generated: ${packet.title}`,
      payload: { packetId: packet.id, workItemId: workItem.id }
    });

    return reply.code(201).send(packet);
  });

  app.post("/api/work-loop/reports/import", async (request, reply) => {
    const body = request.body as {
      packetId?: string;
      rawReport?: string;
      summary?: string;
      changedFiles?: string[];
      testsRun?: string[];
      testStatus?: "not_run" | "passed" | "failed";
      blockers?: string[];
      risks?: string[];
      nextRecommendation?: string;
    };

    if (!body.packetId || !body.rawReport) {
      return reply.code(400).send({ error: "packetId and rawReport are required" });
    }

    const packet = await db.getCursorWorkPacket(body.packetId);
    if (!packet) return reply.code(404).send({ error: "Work packet not found" });

    const imported = importCursorCompletionReport({
      packet,
      rawReport: body.rawReport,
      summary: body.summary,
      changedFiles: body.changedFiles,
      testsRun: body.testsRun,
      testStatus: body.testStatus,
      blockers: body.blockers,
      risks: body.risks,
      nextRecommendation: body.nextRecommendation
    });

    await db.updateCursorWorkPacket(packet.id, imported.packet);
    await db.createCursorCompletionReport(imported.report);

    const workItem = await db.getWorkItem(packet.workItemId);
    if (workItem) {
      await db.updateWorkItem(workItem.id, {
        status: imported.report.testStatus === "failed" ? "failed" : "done"
      });
    }

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Cursor completion report imported for ${packet.id}`,
      payload: { reportId: imported.report.id, packetId: packet.id }
    });

    return reply.code(201).send(imported);
  });

  app.get("/api/work-loop/console", async () => buildWorkLoopConsole(db));

  app.post("/api/work-loop/bootstrap", async () => {
    const timestamp = new Date().toISOString();
    const sample: WorkItem = {
      id: makeWorkLoopId("work"),
      title: "Review Self-Build Console output",
      businessId: "realm_os",
      status: "ready",
      priority: "normal",
      riskLevel: "low",
      executionMode: "cursor",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await db.createWorkItem(sample);
    return { workItem: sample };
  });
}
