import type { FastifyInstance } from "fastify";
import type {
  NecromancerCandidateSnapshot,
  NecromancerEvidenceLinkStatus,
  NecromancerOperatorActionRecord,
  NecromancerRecommendationSnapshot
} from "@realmos/contracts";
import {
  createCreationProposal,
  detectNecromancerCandidates,
  findNecromancerCandidate,
  isBlockedNecromancerActionText,
  pauseAgent,
  prepareAgentCreationFromProposal,
  prepareNecromancerRecommendation,
  retireAgent,
  validateNecromancerOperatorAction,
  type NecromancerCandidate
} from "@realmos/agents";
import { closeWorkPacketLifecycle } from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { necromancerStore } from "./lib/necromancer-store";
import { getOperationalPersistenceAdapter } from "./lib/persistence/configure-operational-stores";
import { verificationEvidenceStore } from "./lib/verification-evidence-store";
import { workPacketLifecycleStore } from "./lib/work-packet-lifecycle-store";

type OperatorBody = {
  approved?: boolean;
  operatorId?: string;
  reason?: string;
  evidenceId?: string;
};

function parseApproval(body: OperatorBody | undefined): {
  approved: boolean;
  operatorId?: string;
  reason?: string;
  evidenceId?: string;
} {
  return {
    approved: body?.approved === true,
    operatorId: body?.operatorId,
    reason: body?.reason,
    evidenceId: body?.evidenceId?.trim() || undefined
  };
}

function buildCandidateSnapshot(candidate: NecromancerCandidate): NecromancerCandidateSnapshot {
  return {
    id: candidate.id,
    kind: candidate.kind,
    entityId: candidate.entityId,
    classification: candidate.classification,
    riskLevel: candidate.riskLevel,
    title: candidate.title,
    currentStatus: candidate.currentStatus,
    realmId: candidate.realmId,
    repositoryId: candidate.repositoryId,
    reason: candidate.reason
  };
}

function buildRecommendationSnapshot(
  candidate: NecromancerCandidate
): NecromancerRecommendationSnapshot {
  const recommendation = prepareNecromancerRecommendation(candidate);
  return {
    summary: recommendation.summary,
    recommendation: recommendation.recommendation,
    requiresApproval: recommendation.requiresApproval
  };
}

async function resolveEvidenceReference(evidenceId?: string): Promise<{
  evidenceId?: string;
  evidenceStatus?: NecromancerEvidenceLinkStatus;
}> {
  if (!evidenceId) return {};

  const record = await verificationEvidenceStore.getVerificationEvidenceRecord(evidenceId);
  if (!record) {
    return { evidenceId, evidenceStatus: "invalid" };
  }

  return { evidenceId: record.id, evidenceStatus: "linked" };
}

async function loadCandidates(db: RealmOSDatabase) {
  const [agents, tasks, workPackets, protectedIds] = await Promise.all([
    db.listAgents(),
    db.listTasks(),
    workPacketLifecycleStore.listWorkPacketLifecycleRecords(),
    necromancerStore.listProtectedCandidateIds()
  ]);

  return detectNecromancerCandidates({
    agents,
    tasks,
    workPackets,
    protectedIds
  });
}

function persistenceMeta() {
  const adapter = getOperationalPersistenceAdapter();
  return {
    persistenceMode: adapter.mode,
    durable: adapter.mode === "postgres",
    safetyNotice: "No autonomous destructive actions. Approval required for pause/retire/protect."
  };
}

async function recordOperatorAction(input: {
  candidate: NecromancerCandidate;
  action: NecromancerOperatorActionRecord["action"];
  operatorId: string;
  approved: boolean;
  outcome: NecromancerOperatorActionRecord["outcome"];
  summary: string;
  blockReason?: string;
  reason?: string;
  evidenceId?: string;
  includeRecommendation?: boolean;
}): Promise<NecromancerOperatorActionRecord> {
  const evidence = await resolveEvidenceReference(input.evidenceId);

  return necromancerStore.appendAction({
    candidateId: input.candidate.id,
    action: input.action,
    operatorId: input.operatorId,
    approved: input.approved,
    outcome: input.outcome,
    summary: input.summary,
    realmId: input.candidate.realmId,
    blockReason: input.blockReason,
    candidateSnapshot: buildCandidateSnapshot(input.candidate),
    recommendationSnapshot: input.includeRecommendation
      ? buildRecommendationSnapshot(input.candidate)
      : undefined,
    evidenceId: evidence.evidenceId,
    evidenceStatus: evidence.evidenceStatus,
    approvalMetadata: input.reason ? { reason: input.reason } : undefined,
    payload: input.reason ? { reason: input.reason } : undefined
  });
}

async function applyCandidatePause(
  db: RealmOSDatabase,
  candidate: ReturnType<typeof findNecromancerCandidate>
): Promise<{ entity: unknown }> {
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
): Promise<{ entity: unknown }> {
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
  app.get("/api/necromancer/status", async () => ({
    ...persistenceMeta(),
    noDeleteEndpoint: true,
    noAutomaticCleanup: true
  }));

  app.get("/api/necromancer/candidates", async () => {
    const candidates = await loadCandidates(db);
    return {
      items: candidates,
      totalCount: candidates.length,
      protectedCount: candidates.filter((item) => item.protected).length,
      ...persistenceMeta()
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
    const body = parseApproval((request.body ?? {}) as OperatorBody);
    const candidates = await loadCandidates(db);
    const candidate = findNecromancerCandidate(candidates, id);
    if (!candidate) return reply.code(404).send({ error: "Candidate not found" });

    const recommendation = prepareNecromancerRecommendation(candidate);
    const record = await recordOperatorAction({
      candidate,
      action: "prepare",
      operatorId: body.operatorId?.trim() || "operator_preview",
      approved: true,
      outcome: "applied",
      summary: recommendation.summary,
      evidenceId: body.evidenceId,
      includeRecommendation: true
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId ?? "operator_preview",
      eventType: "risk_detected",
      summary: `Necromancer prepared recommendation for ${id}`,
      payload: { candidateId: id, recommendation, actionRecordId: record.id, evidenceId: record.evidenceId }
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
      const record = await recordOperatorAction({
        candidate,
        action: "pause",
        operatorId: body.operatorId ?? "unknown",
        approved: body.approved,
        outcome: "blocked",
        summary: validation.reason ?? "Blocked",
        blockReason: validation.reason,
        reason: body.reason,
        evidenceId: body.evidenceId
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
    const record = await recordOperatorAction({
      candidate,
      action: "pause",
      operatorId: body.operatorId!,
      approved: true,
      outcome: "applied",
      summary: `Paused ${candidate.kind} ${candidate.entityId}`,
      reason: body.reason,
      evidenceId: body.evidenceId
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Necromancer paused ${id}`,
      payload: { candidateId: id, actionRecordId: record.id, result, evidenceId: record.evidenceId }
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
      const record = await recordOperatorAction({
        candidate,
        action: "retire",
        operatorId: body.operatorId ?? "unknown",
        approved: body.approved,
        outcome: "blocked",
        summary: validation.reason ?? "Blocked",
        blockReason: validation.reason,
        reason: body.reason,
        evidenceId: body.evidenceId
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
    const record = await recordOperatorAction({
      candidate,
      action: "retire",
      operatorId: body.operatorId!,
      approved: true,
      outcome: "applied",
      summary: `Retired ${candidate.kind} ${candidate.entityId}`,
      reason: body.reason,
      evidenceId: body.evidenceId
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Necromancer retired ${id}`,
      payload: { candidateId: id, actionRecordId: record.id, result, evidenceId: record.evidenceId }
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
      const record = await recordOperatorAction({
        candidate,
        action: "protect",
        operatorId: body.operatorId ?? "unknown",
        approved: body.approved,
        outcome: "blocked",
        summary: validation.reason ?? "Blocked",
        blockReason: validation.reason,
        reason: body.reason,
        evidenceId: body.evidenceId
      });
      await recordAudit(db, {
        actorType: "user",
        actorId: body.operatorId,
        eventType: "policy_blocked",
        summary: `Necromancer protect blocked for ${id}`,
        payload: { candidateId: id, reason: validation.reason, actionRecordId: record.id }
      });
      return reply.code(409).send({ error: validation.reason, actionRecord: record });
    }

    const evidence = await resolveEvidenceReference(body.evidenceId);
    await necromancerStore.markProtected({
      candidateId: id,
      realmId: candidate.realmId,
      operatorId: body.operatorId!,
      reason: body.reason,
      evidenceId: evidence.evidenceId
    });

    const record = await recordOperatorAction({
      candidate,
      action: "protect",
      operatorId: body.operatorId!,
      approved: true,
      outcome: "applied",
      summary: `Protected ${id}`,
      reason: body.reason,
      evidenceId: body.evidenceId
    });

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Necromancer protected ${id}`,
      payload: { candidateId: id, actionRecordId: record.id, evidenceId: record.evidenceId }
    });

    const refreshed = findNecromancerCandidate(await loadCandidates(db), id);
    return reply.send({ candidate: refreshed, actionRecord: record });
  });

  app.get("/api/necromancer/actions", async (request) => {
    const query = request.query as {
      candidateId?: string;
      action?: NecromancerOperatorActionRecord["action"];
      operatorId?: string;
      outcome?: NecromancerOperatorActionRecord["outcome"];
      limit?: string;
    };

    const items = await necromancerStore.listActions({
      candidateId: query.candidateId,
      action: query.action,
      operatorId: query.operatorId,
      outcome: query.outcome,
      limit: query.limit ? Number(query.limit) : undefined
    });

    return {
      items,
      ...persistenceMeta()
    };
  });

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
