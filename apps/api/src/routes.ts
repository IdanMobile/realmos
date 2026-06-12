import type { FastifyInstance } from "fastify";
import { canAssignTaskToAgent } from "@realmos/agents";
import { buildCommunicationAnalytics } from "@realmos/core";
import { runSystemOptimizer, scoutModelForUseCase } from "@realmos/intelligence";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { buildHealthReport } from "./lib/health-export";
import { dedupeArtifacts } from "./lib/artifacts";
import { buildWorkLoopConsole } from "./work-loop-routes";
import { buildFleetConsole, fleetStore } from "./lib/fleet-store";
import { realmStore } from "./lib/realm-store";
import { platformInfraStore } from "./lib/platform-infra-store";

export function registerApiRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/health", async () => buildHealthReport(db));

  app.get("/api/businesses", async () => ({ items: await db.listBusinesses() }));
  app.get("/api/businesses/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const business = await db.getBusiness(id);
    if (!business) return reply.code(404).send({ error: "Business not found" });
    return business;
  });
  app.post("/api/businesses", async (request, reply) => {
    const business = request.body as Parameters<RealmOSDatabase["createBusiness"]>[0];
    const created = await db.createBusiness(business);
    await recordAudit(db, {
      actorType: "system",
      businessId: created.id,
      eventType: "business_created",
      summary: `Created business ${created.name}`,
      payload: { businessId: created.id }
    });
    return reply.code(201).send(created);
  });
  app.patch("/api/businesses/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = request.body as Record<string, unknown>;
    const updated = await db.updateBusiness(id, patch);
    if (!updated) return reply.code(404).send({ error: "Business not found" });
    await recordAudit(db, {
      actorType: "system",
      businessId: updated.id,
      eventType: "business_created",
      summary: `Updated business ${updated.name}`,
      payload: { businessId: updated.id, patch }
    });
    return updated;
  });

  app.get("/api/agents", async () => ({ items: await db.listAgents() }));
  app.get("/api/agents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = await db.getAgent(id);
    if (!agent) return reply.code(404).send({ error: "Agent not found" });
    return agent;
  });
  app.post("/api/agents", async (request, reply) => {
    const agent = request.body as Parameters<RealmOSDatabase["createAgent"]>[0];
    const created = await db.createAgent(agent);
    await recordAudit(db, {
      actorType: "system",
      eventType: "agent_created",
      summary: `Created agent ${created.name}`,
      payload: { agentId: created.id }
    });
    return reply.code(201).send(created);
  });
  app.patch("/api/agents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = request.body as Record<string, unknown>;
    const updated = await db.updateAgent(id, patch);
    if (!updated) return reply.code(404).send({ error: "Agent not found" });
    await recordAudit(db, {
      actorType: "system",
      eventType: "agent_created",
      summary: `Updated agent ${updated.name}`,
      payload: { agentId: updated.id, patch }
    });
    return updated;
  });

  app.get("/api/tasks", async () => ({ items: await db.listTasks() }));
  app.get("/api/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const task = await db.getTask(id);
    if (!task) return reply.code(404).send({ error: "Task not found" });
    return task;
  });
  app.post("/api/tasks", async (request, reply) => {
    const task = request.body as Parameters<RealmOSDatabase["createTask"]>[0];

    if (task.assignedAgentId) {
      const agent = await db.getAgent(task.assignedAgentId);
      if (!agent) {
        return reply.code(404).send({ error: "Assigned agent not found" });
      }
      if (!canAssignTaskToAgent(agent)) {
        return reply.code(409).send({
          error: `Agent ${agent.id} cannot receive tasks while status is ${agent.status}.`
        });
      }
    }

    const created = await db.createTask(task);
    await recordAudit(db, {
      actorType: "system",
      businessId: created.businessId,
      taskId: created.id,
      eventType: "task_created",
      summary: `Created task ${created.title}`,
      payload: { taskId: created.id }
    });
    return reply.code(201).send(created);
  });
  app.patch("/api/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = request.body as Record<string, unknown>;
    const updated = await db.updateTask(id, patch);
    if (!updated) return reply.code(404).send({ error: "Task not found" });
    await recordAudit(db, {
      actorType: "system",
      businessId: updated.businessId,
      taskId: updated.id,
      eventType: "task_created",
      summary: `Updated task ${updated.title}`,
      payload: { taskId: updated.id, patch }
    });
    return updated;
  });

  app.get("/api/memories", async () => ({ items: await db.listMemories() }));
  app.get("/api/memories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const memory = await db.getMemory(id);
    if (!memory) return reply.code(404).send({ error: "Memory not found" });
    return memory;
  });
  app.post("/api/memories", async (request, reply) => {
    const memory = request.body as Parameters<RealmOSDatabase["createMemory"]>[0];
    const created = await db.createMemory(memory);
    await recordAudit(db, {
      actorType: "system",
      eventType: "memory_written",
      summary: `Wrote memory ${created.title}`,
      payload: { memoryId: created.id, scope: created.scope }
    });
    return reply.code(201).send(created);
  });
  app.patch("/api/memories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = request.body as Record<string, unknown>;
    const updated = await db.updateMemory(id, patch);
    if (!updated) return reply.code(404).send({ error: "Memory not found" });
    await recordAudit(db, {
      actorType: "system",
      eventType: "memory_written",
      summary: `Updated memory ${updated.title}`,
      payload: { memoryId: updated.id, patch }
    });
    return updated;
  });

  app.get("/api/approvals", async () => ({ items: await db.listApprovals() }));
  app.post("/api/approvals/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const updated = await db.updateApproval(id, { status: "approved" });
    if (!updated) return reply.code(404).send({ error: "Approval not found" });
    await recordAudit(db, {
      actorType: "user",
      businessId: updated.businessId,
      eventType: "approval_approved",
      summary: `Approved ${updated.title}`,
      payload: { approvalId: updated.id }
    });

    const payload = updated.payload as Record<string, unknown> | undefined;
    const requestId = typeof payload?.requestId === "string" ? payload.requestId : undefined;
    if (requestId) {
      const { attemptApprovedToolRun } = await import("@realmos/tool-runner");
      const { createToolRunnerStore } = await import("./lib/tool-runner-store");
      const toolRequest = await db.getToolRunRequest(requestId);
      if (toolRequest) {
        const outcome = await attemptApprovedToolRun(createToolRunnerStore(db), toolRequest, updated);
        return { approval: updated, toolOutcome: outcome };
      }
    }

    return updated;
  });
  app.post("/api/approvals/:id/reject", async (request, reply) => {
    const { id } = request.params as { id: string };
    const updated = await db.updateApproval(id, { status: "rejected" });
    if (!updated) return reply.code(404).send({ error: "Approval not found" });
    await recordAudit(db, {
      actorType: "user",
      businessId: updated.businessId,
      eventType: "approval_rejected",
      summary: `Rejected ${updated.title}`,
      payload: { approvalId: updated.id }
    });
    return updated;
  });

  app.get("/api/audit-events", async () => ({ items: await db.listAuditEvents() }));
  app.get("/api/costs", async () => ({
    budgets: await db.listBudgets(),
    entries: await db.listCostEntries()
  }));
  app.get("/api/world", async () => await db.getWorldMap());

  app.get("/api/dashboard", async () => {
    const [
      businesses,
      agents,
      tasks,
      approvals,
      budgets,
      costEntries,
      memories,
      auditEvents,
      worldMap,
      capabilityReports,
      communicationThreads,
      communicationMessages,
      communicationDecisions,
      artifacts,
      toolRunRequests,
      toolRunResults
    ] = await Promise.all([
      db.listBusinesses(),
      db.listAgents(),
      db.listTasks(),
      db.listApprovals(),
      db.listBudgets(),
      db.listCostEntries(),
      db.listMemories(),
      db.listAuditEvents(),
      db.getWorldMap(),
      db.listCapabilityReports(),
      db.listCommunicationThreads(),
      db.listCommunicationMessages(),
      db.listCommunicationDecisions(),
      db.listArtifacts(),
      db.listToolRunRequests(),
      db.listToolRunResults()
    ]);

    const pendingApprovals = approvals.filter((item) => item.status === "pending").length;
    const onlineCostUsd = costEntries
      .filter((entry) => entry.provider !== "ollama")
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      businesses,
      agents,
      tasks,
      approvals,
      budgets,
      costEntries,
      memories,
      auditEvents,
      worldMap,
      capabilityReports,
      communicationThreads,
      communicationMessages,
      communicationDecisions,
      communicationAnalytics: buildCommunicationAnalytics({
        threads: communicationThreads,
        messages: communicationMessages,
        decisionCount: communicationDecisions.length
      }),
      artifacts: dedupeArtifacts(artifacts),
      toolRunRequests: toolRunRequests ?? [],
      toolRunResults: toolRunResults ?? [],
      optimizationReport: runSystemOptimizer({
        scope: "global",
        onlineCostUsd,
        tokenBaseline: 2400,
        tokenPackEstimate: 800
      }),
      modelRoutingDecision: scoutModelForUseCase({
        useCase: "complex_reasoning",
        allowPaid: process.env.REALMOS_ALLOW_ONLINE_MODELS === "true"
      }).decision,
      knowledgeVaultNotes: [
        "Obsidian integration is optional and disabled by default.",
        "Database-only vault is active for MVP memory storage."
      ],
      workLoop: await buildWorkLoopConsole(db),
      fleet: await buildFleetConsole({
        getFleet: () => fleetStore.getFleet(),
        getCapacityPolicy: () => fleetStore.getCapacityPolicy(),
        listSquads: () => fleetStore.listSquads(),
        listFleetRuns: () => fleetStore.listFleetRuns(),
        listParallelWorkPlans: () => fleetStore.listParallelWorkPlans(),
        listWorkConflicts: () => fleetStore.listWorkConflicts()
      }),
      realm: await realmStore.getRealmConsole(),
      platformInfra: await platformInfraStore.getPlatformInfraConsole(),
      briefing: {
        greeting: "Good afternoon, Idan.",
        items: [
          {
            id: "brief_api",
            label: "Command Center connected to API",
            detail: "Dashboard data loaded from RealmOS API storage.",
            tone: "success"
          },
          {
            id: "brief_approvals",
            label: `${pendingApprovals} approvals waiting`,
            detail: "Review the approval queue before enabling risky capabilities.",
            tone: pendingApprovals > 0 ? "warning" : "info"
          }
        ],
        quickActions: [
          { id: "qa_brief", label: "Daily briefing" },
          { id: "qa_approvals", label: "Review approvals" }
        ]
      }
    };
  });

  app.post("/api/seed", async (_request, reply) => {
    const { loadSeedBundleFromRepo } = await import("./seed/load-seed");
    const bundle = await loadSeedBundleFromRepo();
    await db.loadSeed(bundle);
    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: "Loaded seed bundle into API storage",
      payload: { source: "mock-data/seed.json" }
    });
    return reply.code(200).send({ ok: true, counts: {
      businesses: bundle.businesses.length,
      agents: bundle.agents.length,
      tasks: bundle.tasks.length
    }});
  });
}
