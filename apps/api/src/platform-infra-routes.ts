import type { FastifyInstance } from "fastify";
import type { ProjectInfrastructurePlan } from "@realmos/contracts";
import {
  createTemporaryPrototypeApproval,
  detectInfrastructureIsolationViolations,
  enrichCursorWorkPacketWithInfrastructureBoundary,
  hasBlockingInfrastructureViolations,
  validatePrototypeApprovalInput,
  type PrototypeApprovalInput
} from "@realmos/platform-infra";
import { generateCursorWorkPacket } from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { platformInfraStore } from "./lib/platform-infra-store";

export function registerPlatformInfraRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/platform/decision", async () => ({
    decision: await platformInfraStore.getPlatformDecision()
  }));

  app.get("/api/platform/infra/console", async () => platformInfraStore.getPlatformInfraConsole());

  app.get("/api/project-infrastructure/plans", async () => ({
    items: await platformInfraStore.listProjectInfrastructurePlans()
  }));

  app.get("/api/project-infrastructure/plans/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = await platformInfraStore.getProjectInfrastructurePlan(id);
    if (!plan) return reply.code(404).send({ error: "Infrastructure plan not found" });
    return plan;
  });

  app.post("/api/project-infrastructure/isolation/check", async (request, reply) => {
    const body = request.body as { planId?: string; plan?: ProjectInfrastructurePlan };
    const plan =
      body.plan ??
      (body.planId ? await platformInfraStore.getProjectInfrastructurePlan(body.planId) : null);

    if (!plan) {
      return reply.code(400).send({ error: "planId or plan is required" });
    }

    const approvals = await platformInfraStore.listPrototypeApprovals();
    const violations = detectInfrastructureIsolationViolations(plan, approvals);
    await platformInfraStore.setIsolationViolations(violations);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Infrastructure isolation check: ${violations.length} violation(s)`,
      payload: { planId: plan.id, violationCount: violations.length }
    });

    return {
      violations,
      blocked: hasBlockingInfrastructureViolations(violations, approvals)
    };
  });

  app.post("/api/project-infrastructure/prototype-approvals", async (request, reply) => {
    const body = request.body as PrototypeApprovalInput;
    const errors = validatePrototypeApprovalInput(body);
    if (errors.length) {
      return reply.code(400).send({ error: errors.join("; ") });
    }

    const approval = createTemporaryPrototypeApproval(body);
    await platformInfraStore.appendPrototypeApproval(approval);

    await recordAudit(db, {
      actorType: "user",
      eventType: "approval_approved",
      summary: `Temporary prototype infrastructure approved for ${body.realmId}`,
      payload: { approvalId: approval.id, resourceIds: body.resourceIds }
    });

    return reply.code(201).send(approval);
  });

  app.post("/api/project-infrastructure/work-packets/enrich", async (request, reply) => {
    const body = request.body as { workItemId?: string; planId?: string };
    if (!body.workItemId || !body.planId) {
      return reply.code(400).send({ error: "workItemId and planId are required" });
    }

    const workItem = await db.getWorkItem(body.workItemId);
    if (!workItem) return reply.code(404).send({ error: "Work item not found" });

    const plan = await platformInfraStore.getProjectInfrastructurePlan(body.planId);
    if (!plan) return reply.code(404).send({ error: "Infrastructure plan not found" });

    const approvals = await platformInfraStore.listPrototypeApprovals();
    const basePacket = generateCursorWorkPacket({ workItem });
    const enriched = enrichCursorWorkPacketWithInfrastructureBoundary({
      packet: basePacket,
      plan,
      approvals
    });

    return reply.code(201).send(enriched);
  });
}
