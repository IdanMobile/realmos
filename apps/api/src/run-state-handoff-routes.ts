import type { FastifyInstance } from "fastify";
import type { RunStateHandoffInput, WorkPacketLifecycle } from "@realmos/contracts";
import {
  buildHandoffSummaryObject,
  buildNextChatPromptObject,
  buildRunStateFromWorkPacket,
  markRunStateHandoffRequired,
  markRunStateHandoffUpdated,
  summarizeRunStates,
  updateRunStateFromExecutorResult,
  updateRunStateFromVerification,
  updateRunStateFromWorkPacket
} from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { runStateHandoffStore } from "./lib/run-state-handoff-store";
import { workPacketLifecycleStore } from "./lib/work-packet-lifecycle-store";

export async function buildRunStateHandoffStatus() {
  const states = await runStateHandoffStore.listRunStates();
  return summarizeRunStates(states);
}

export async function syncRunStateForPacket(packet: WorkPacketLifecycle): Promise<void> {
  const existing = await runStateHandoffStore.getRunStateByPacketId(packet.id);
  if (!existing) return;

  let result = updateRunStateFromWorkPacket(existing, packet);
  if (packet.verification) {
    result = updateRunStateFromVerification(result.state, packet);
  } else if (packet.executorResult) {
    result = updateRunStateFromExecutorResult(result.state, packet);
  }

  if (result.errors.length) return;
  await runStateHandoffStore.updateRunState(existing.id, result.state);
}

export function registerRunStateHandoffRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/run-state/status", async () => buildRunStateHandoffStatus());

  app.get("/api/run-state/records", async () => ({
    items: await runStateHandoffStore.listRunStates()
  }));

  app.get("/api/run-state/records/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const state = await runStateHandoffStore.getRunState(id);
    if (!state) return reply.code(404).send({ error: "Run state record not found" });
    return state;
  });

  app.post("/api/run-state/records/from-packet/:packetId", async (request, reply) => {
    const { packetId } = request.params as { packetId: string };
    const body = (request.body ?? {}) as RunStateHandoffInput;

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(packetId);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    const existing = await runStateHandoffStore.getRunStateByPacketId(packetId);
    if (existing) {
      return reply.code(409).send({ error: "Run state already exists for packet", runStateId: existing.id });
    }

    const { state, errors } = buildRunStateFromWorkPacket(packet, body);
    if (errors.length) {
      return reply.code(400).send({ error: "Validation failed", details: errors });
    }

    await runStateHandoffStore.createRunState(state);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Run state created: ${state.id} for packet ${packetId}`,
      payload: { runStateId: state.id, packetId }
    });

    return reply.code(201).send(state);
  });

  app.post("/api/run-state/records/:id/sync-from-packet", async (request, reply) => {
    const { id } = request.params as { id: string };
    const state = await runStateHandoffStore.getRunState(id);
    if (!state) return reply.code(404).send({ error: "Run state record not found" });

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(state.sourcePacketId);
    if (!packet) return reply.code(404).send({ error: "Source packet not found" });

    const { state: updated, errors } = updateRunStateFromWorkPacket(state, packet);
    if (errors.length) {
      return reply.code(400).send({ error: "Sync failed", details: errors });
    }

    await runStateHandoffStore.updateRunState(id, updated);
    return updated;
  });

  app.post("/api/run-state/records/:id/sync-from-result", async (request, reply) => {
    const { id } = request.params as { id: string };
    const state = await runStateHandoffStore.getRunState(id);
    if (!state) return reply.code(404).send({ error: "Run state record not found" });

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(state.sourcePacketId);
    if (!packet) return reply.code(404).send({ error: "Source packet not found" });

    const { state: updated, errors } = updateRunStateFromExecutorResult(state, packet);
    if (errors.length) {
      return reply.code(400).send({ error: "Result sync failed", details: errors });
    }

    await runStateHandoffStore.updateRunState(id, updated);
    return updated;
  });

  app.post("/api/run-state/records/:id/sync-from-verification", async (request, reply) => {
    const { id } = request.params as { id: string };
    const state = await runStateHandoffStore.getRunState(id);
    if (!state) return reply.code(404).send({ error: "Run state record not found" });

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(state.sourcePacketId);
    if (!packet) return reply.code(404).send({ error: "Source packet not found" });

    const { state: updated, errors } = updateRunStateFromVerification(state, packet);
    if (errors.length) {
      return reply.code(400).send({ error: "Verification sync failed", details: errors });
    }

    await runStateHandoffStore.updateRunState(id, updated);
    return updated;
  });

  app.post("/api/run-state/records/:id/handoff-required", async (request, reply) => {
    const { id } = request.params as { id: string };
    const state = await runStateHandoffStore.getRunState(id);
    if (!state) return reply.code(404).send({ error: "Run state record not found" });

    const updated = markRunStateHandoffRequired(state);
    await runStateHandoffStore.updateRunState(id, updated);
    return updated;
  });

  app.post("/api/run-state/records/:id/handoff-updated", async (request, reply) => {
    const { id } = request.params as { id: string };
    const state = await runStateHandoffStore.getRunState(id);
    if (!state) return reply.code(404).send({ error: "Run state record not found" });

    const updated = markRunStateHandoffUpdated(state);
    await runStateHandoffStore.updateRunState(id, updated);
    return updated;
  });

  app.get("/api/run-state/handoff/latest", async (_request, reply) => {
    const summary = await buildRunStateHandoffStatus();
    if (!summary.latestHandoffSummary) {
      return reply.code(404).send({ error: "No run state handoff available" });
    }
    return summary.latestHandoffSummary;
  });

  app.get("/api/run-state/next-chat-prompt/latest", async (_request, reply) => {
    const summary = await buildRunStateHandoffStatus();
    if (!summary.latestRunState) {
      return reply.code(404).send({ error: "No run state available" });
    }
    return buildNextChatPromptObject(summary.latestRunState);
  });
}
