import type { FastifyInstance } from "fastify";
import type { Agent, Task } from "@realmos/contracts";
import {
  createCreationProposal,
  detectNecromancerCandidates,
  findNecromancerCandidate,
  isBlockedNecromancerActionText,
  pauseAgent,
  prepareAgentCreationFromProposal,
  prepareNecromancerRecommendation,
  retireAgent,
  validateNecromancerOperatorAction
} from "@realmos/agents";
import { closeWorkPacketLifecycle } from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { necromancerStore } from "./lib/necromancer-store";
import { workPacketLifecycleStore } from "./lib/work-packet-lifecycle-store";

type OperatorBody = {
  approved?: boolean;
  operatorId?: string;
  reason?: string;
};

function parseApproval(body: OperatorBody | undefined): { approved: boolean; operatorId?: string; reason?: string } {
  return {
    approved: body?.approved === true,
    operatorId: body?.operatorId,
    reason: body?.reason
  };
}

async function loadCandidates(db: RealmOSDatabase) {
  const [agents, tasks, workPackets] = await Promise.all([
    db.listAgents(),
    db.listTasks(),
    workPacketLifecycleStore.listWorkPacketLifecycleRecords()
  ]);

  return detectNecromancerCandidates({
    agents,
    tasks,
    workPackets,
    protectedIds: necromancerStore.listProtectedIds()
  });
}

async function applyCandidatePause(
  db: RealmOSDatabase,
  candidate: ReturnType<typeof findNecromancerCandidate>
): Promise<{ entity: Agent | Task | unknown }> {
  if (!candidate) throw new Error("Candidate not found");

  if (candidate.kind === "agent") {
    const agent = await db.getAgent(candidate.entityId);
    if (!agent) throw new Error("Agent not found");
    const updated = await db.updateAgent(candidate.entityId, pauseAgent(agent));
    return { entity: updated };
  }

  if (candidate.kind === "task") {
    const task = await db.getTask(candidate.entityId);
    if (!task) throw new Error("Task not found");
    const updated = await db.updateTask(candidate.entityId, {
      status: "blocked",
      updatedAt: new Date().toISOString()
    });
    return { entity: updated };
  }

  const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(candidate.entityId);
  if (!packet) throw new Error("Work packet not found");
  const closed = closeWorkPacketLifecycle(packet, {
    status: "blocked",
    reason: "Paused by Necromancer operator action"
  });
  if (closed.errors.length) {
    throw new Error(closed.errors.map((item) => item.message).join("; "));
  }
  await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(candidate.entityId, closed.packet);
  return { entity: closed.packet };
}

async function applyCandidateRetire(
  db: RealmOSDatabase,
  candidate: ReturnType<typeof findNecromancerCandidate>
): Promise<{ entity: Agent | Task | unknown }> {
  if (!candidate) throw new Error("Candidate not found");

  if (candidate.kind === "agent") {
    const agent = await db.getAgent(candidate.entityId);
    if (!agent) throw new Error("Agent not found");
    const updated = await db.updateAgent(candidate.entityId, retireAgent(agent));
    return { entity: updated };
  }

  if (candidate.kind === "task") {
    const task = await db.getTask(candidate.entityId);
    if (!task) throw new Error("Task not found");
    const updated = await db.updateTask(candidate.entityId, {
      status: "cancelled",
      updatedAt: new Date().toISOString()
    });
    return { entity: updated };
  }

  const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(candidate.entityId);
  if (!packet) throw new Error("Work packet not found");
  const closed = closeWorkPacketLifecycle(packet, {
    status: "cancelled",
    reason: "Retired by Necromancer operator action"
  });
  if (closed.errors.length) {
    throw new Error(closed.errors.map((item) => item.message).join("; "));
  }
  await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(candidate.entityId, closed.packet);
  return { entity: closed.packet };
}

export function registerNecromancerRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/necromancer/candidates", async () => {
    const candidates = await loadCandidates(db);
    return {
      items: candidates,
      totalCount: candidates.length,
      protectedCount: candidates.filter((item) => item.protected).length,
      safetyNotice: "No autonomous destructive actions. Approval required for pause/retire/protect."
    };
  });

  app.get("/api/necromancer/candidates/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const candidates = await loadCandidates(db);
    const candidate = findNecromancerCandidate(candidates, id);
    if (!candidate) return reply.code(404).send({ error: "Candidate not found" });

    return {
      candidate,
      recommendation: prepareNecromancerRecommendation(candidate)
    };
  });

  app.post("/api/necromancer/candidates/:id/prepare", async (request, reply) => {
    const { id } = request.params as { id: string };
    const candidates = await loadCandidates(db);
    const candidate = findNecromancerCandidate(candidates, id);
    if (!candidate) return reply.code(404).send({ error: "Candidate not found" });

    const recommendation = prepareNecromancerRecommendation(candidate);
    const record = necromancerStore.appendAction({
      candidateId: id,
      action: "prepare",
      operatorId: "operator_preview",
      approved: true,
      outcome: "applied",
      summary: recommendation.summary
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: "operator_preview",
      eventType: "risk_detected",
      summary: `Necromancer prepared recommendation for ${id}`,
      payload: { candidateId: id, recommendation, actionRecordId: record.id }
    });

    return reply.send({ candidate, recommendation, actionRecord: record });
  });

  app.post("/api/necromancer/candidates/:id/pause", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = parseApproval(request.body as OperatorBody);
    const candidates = await loadCandidates(db);
    const candidate = findNecromancerCandidate(candidates, id);
    if (!candidate) return reply.code(404).send({ error: "Candidate not found" });

    const validation = validateNecromancerOperatorAction({
      candidate,
      action: "pause",
      approved: body.approved,
      operatorId: body.operatorId
    });

    if (!validation.allowed) {
      const record = necromancerStore.appendAction({
        candidateId: id,
        action: "pause",
        operatorId: body.operatorId ?? "unknown",
        approved: body.approved,
        outcome: "blocked",
        summary: validation.reason ?? "Blocked"
      });
      await recordAudit(db, {
        actorType: "user",
        actorId: body.operatorId,
        eventType: "policy_blocked",
        summary: `Necromancer pause blocked for ${id}`,
        payload: { candidateId: id, reason: validation.reason, actionRecordId: record.id }
      });
      return reply.code(409).send({ error: validation.reason, actionRecord: record });
    }

    const result = await applyCandidatePause(db, candidate);
    const record = necromancerStore.appendAction({
      candidateId: id,
      action: "pause",
      operatorId: body.operatorId!,
      approved: true,
      outcome: "applied",
      summary: `Paused ${candidate.kind} ${candidate.entityId}`,
      payload: { reason: body.reason }
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Necromancer paused ${id}`,
      payload: { candidateId: id, actionRecordId: record.id, result }
    });

    return reply.send({ candidate, result, actionRecord: record });
  });

  app.post("/api/necromancer/candidates/:id/retire", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = parseApproval(request.body as OperatorBody);
    const candidates = await loadCandidates(db);
    const candidate = findNecromancerCandidate(candidates, id);
    if (!candidate) return reply.code(404).send({ error: "Candidate not found" });

    const validation = validateNecromancerOperatorAction({
      candidate,
      action: "retire",
      approved: body.approved,
      operatorId: body.operatorId
    });

    if (!validation.allowed) {
      const record = necromancerStore.appendAction({
        candidateId: id,
        action: "retire",
        operatorId: body.operatorId ?? "unknown",
        approved: body.approved,
        outcome: "blocked",
        summary: validation.reason ?? "Blocked"
      });
      await recordAudit(db, {
        actorType: "user",
        actorId: body.operatorId,
        eventType: "policy_blocked",
        summary: `Necromancer retire blocked for ${id}`,
        payload: { candidateId: id, reason: validation.reason, actionRecordId: record.id }
      });
      return reply.code(409).send({ error: validation.reason, actionRecord: record });
    }

    const result = await applyCandidateRetire(db, candidate);
    const record = necromancerStore.appendAction({
      candidateId: id,
      action: "retire",
      operatorId: body.operatorId!,
      approved: true,
      outcome: "applied",
      summary: `Retired ${candidate.kind} ${candidate.entityId}`,
      payload: { reason: body.reason }
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Necromancer retired ${id}`,
      payload: { candidateId: id, actionRecordId: record.id, result }
    });

    return reply.send({ candidate, result, actionRecord: record });
  });

  app.post("/api/necromancer/candidates/:id/protect", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = parseApproval(request.body as OperatorBody);
    const candidates = await loadCandidates(db);
    const candidate = findNecromancerCandidate(candidates, id);
    if (!candidate) return reply.code(404).send({ error: "Candidate not found" });

    const validation = validateNecromancerOperatorAction({
      candidate,
      action: "protect",
      approved: body.approved,
      operatorId: body.operatorId
    });

    if (!validation.allowed) {
      return reply.code(409).send({ error: validation.reason });
    }

    necromancerStore.markProtected(id);
    const record = necromancerStore.appendAction({
      candidateId: id,
      action: "protect",
      operatorId: body.operatorId!,
      approved: true,
      outcome: "applied",
      summary: `Protected ${id}`
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Necromancer protected ${id}`,
      payload: { candidateId: id, actionRecordId: record.id }
    });

    const refreshed = findNecromancerCandidate(await loadCandidates(db), id);
    return reply.send({ candidate: refreshed, actionRecord: record });
  });

  app.get("/api/necromancer/actions", async () => ({
    items: necromancerStore.listActions()
  }));

  app.post("/api/necromancer/proposals/classify", async (request) => {
    const body = request.body as {
      needSummary?: string;
      requestedBy?: string;
      businessId?: string;
    };

    return createCreationProposal({
      requestedBy: body.requestedBy ?? "agent_necromancer",
      needSummary: body.needSummary ?? "",
      businessId: body.businessId
    });
  });

  app.post("/api/necromancer/agents/prepare", async (request, reply) => {
    const body = request.body as {
      proposal?: Parameters<typeof prepareAgentCreationFromProposal>[0]["proposal"];
      blueprint?: Parameters<typeof prepareAgentCreationFromProposal>[0]["blueprint"];
      businessId?: string;
      persist?: boolean;
    };

    const existingAgents = await db.listAgents();
    const result = prepareAgentCreationFromProposal({
      proposal: body.proposal as NonNullable<typeof body.proposal>,
      blueprint: body.blueprint as NonNullable<typeof body.blueprint>,
      businessId: body.businessId ?? "",
      existingAgents
    });

    if (result.status === "ready" && body.persist) {
      await db.createAgent(result.agent);
      await db.createTask(result.testTask);
      await recordAudit(db, {
        actorType: "agent",
        actorId: "agent_necromancer",
        businessId: body.businessId,
        eventType: "agent_created",
        summary: `Necromancer persisted agent ${result.agent.name}`,
        payload: { agentId: result.agent.id, proposal: body.proposal }
      });
      return reply.code(201).send(result);
    }

    return reply.code(result.status === "ready" ? 200 : 409).send(result);
  });

  app.post("/api/agents/:id/pause", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = parseApproval(request.body as OperatorBody);
    const agent = await db.getAgent(id);
    if (!agent) return reply.code(404).send({ error: "Agent not found" });

    if (!body.approved || !body.operatorId?.trim()) {
      return reply.code(409).send({
        error: "Operator approval required. Send { approved: true, operatorId }."
      });
    }

    const updated = await db.updateAgent(id, pauseAgent(agent));
    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Agent paused via Necromancer route: ${id}`,
      payload: { agentId: id }
    });
    return updated;
  });

  app.post("/api/agents/:id/retire", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = parseApproval(request.body as OperatorBody);
    const agent = await db.getAgent(id);
    if (!agent) return reply.code(404).send({ error: "Agent not found" });

    if (!body.approved || !body.operatorId?.trim()) {
      return reply.code(409).send({
        error: "Operator approval required. Send { approved: true, operatorId }."
      });
    }

    if (isBlockedNecromancerActionText(body.reason ?? "")) {
      return reply.code(409).send({ error: "Destructive action language is blocked." });
    }

    const updated = await db.updateAgent(id, retireAgent(agent));
    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Agent retired via Necromancer route: ${id}`,
      payload: { agentId: id }
    });
    return updated;
  });
}
