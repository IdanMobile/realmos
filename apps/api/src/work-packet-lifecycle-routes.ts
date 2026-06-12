import type { FastifyInstance } from "fastify";
import type { WorkPacketLifecycleInput } from "@realmos/contracts";
import {
  applyExecutorApproval,
  applyExecutorResult,
  approveWorkPacketLifecycle,
  attachWorkPacketVerification,
  buildExecutorDispatchInputFromLifecycle,
  buildLocalExecutorDispatch,
  buildWorkPacketLifecycle,
  canDispatchLocalExecutor,
  closeWorkPacketLifecycle,
  isExecutorBridgeEnabled,
  markExecutorDispatched,
  markWorkPacketDispatched,
  markWorkPacketReadyForApproval,
  recordWorkPacketExecutorResult,
  summarizeWorkPacketLifecycle,
  validateLocalExecutorDispatchInput,
  validateWorkPacketLifecycleInput,
  writeExecutorQueueArtifacts
} from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { executorStore } from "./lib/executor-store";
import { workPacketLifecycleStore } from "./lib/work-packet-lifecycle-store";
import { syncRunStateForPacket } from "./run-state-handoff-routes";

export async function buildWorkPacketLifecycleStatus() {
  const packets = await workPacketLifecycleStore.listWorkPacketLifecycleRecords();
  return summarizeWorkPacketLifecycle(packets);
}

export function registerWorkPacketLifecycleRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/lifecycle/status", async () => buildWorkPacketLifecycleStatus());

  app.get("/api/lifecycle/packets", async () => ({
    items: await workPacketLifecycleStore.listWorkPacketLifecycleRecords()
  }));

  app.get("/api/lifecycle/packets/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });
    return packet;
  });

  app.post("/api/lifecycle/packets", async (request, reply) => {
    const body = request.body as WorkPacketLifecycleInput;
    const errors = validateWorkPacketLifecycleInput(body);
    if (errors.length) {
      return reply.code(400).send({ error: "Validation failed", details: errors });
    }

    const packet = buildWorkPacketLifecycle(body);
    await workPacketLifecycleStore.createWorkPacketLifecycleRecord(packet);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Work packet lifecycle draft created: ${packet.id}`,
      payload: { packetId: packet.id, realmId: packet.realmId }
    });

    return reply.code(201).send(packet);
  });

  app.post("/api/lifecycle/packets/:id/ready", async (request, reply) => {
    const { id } = request.params as { id: string };
    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    const { packet: updated, errors } = markWorkPacketReadyForApproval(packet);
    if (errors.length) {
      return reply.code(400).send({ error: "Readiness validation failed", details: errors });
    }

    await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(id, updated);
    return updated;
  });

  app.post("/api/lifecycle/packets/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { approvedBy?: string };
    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    const { packet: updated, errors } = approveWorkPacketLifecycle(packet, body.approvedBy);
    if (errors.length) {
      return reply.code(409).send({ error: "Approval failed", details: errors });
    }

    await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(id, updated);
    return updated;
  });

  app.post("/api/lifecycle/packets/:id/dispatch", async (request, reply) => {
    if (!isExecutorBridgeEnabled()) {
      return reply.code(503).send({ error: "Executor bridge is disabled" });
    }

    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { cwd?: string };
    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    if (packet.status !== "approved") {
      return reply.code(409).send({
        error: "Only approved packets can be dispatched.",
        status: packet.status
      });
    }

    const dispatchInput = buildExecutorDispatchInputFromLifecycle(packet);
    const validationErrors = validateLocalExecutorDispatchInput(dispatchInput);
    if (validationErrors.length) {
      return reply.code(400).send({ error: "Dispatch validation failed", details: validationErrors });
    }

    let dispatch = buildLocalExecutorDispatch(dispatchInput);
    dispatch = applyExecutorApproval(dispatch);
    await executorStore.createExecutorDispatch(dispatch);

    const gate = canDispatchLocalExecutor(dispatch, { approved: true });
    if (!gate.allowed) {
      return reply.code(409).send({ error: gate.reason, dispatch });
    }

    const artifacts = await writeExecutorQueueArtifacts(dispatch, body.cwd ?? process.cwd());
    const dispatched = markExecutorDispatched(dispatch, artifacts.packetDir);
    await executorStore.updateExecutorDispatch(dispatch.id, dispatched);

    const lifecycleUpdated = markWorkPacketDispatched(packet, dispatch.id);
    await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(id, lifecycleUpdated);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Work packet lifecycle dispatched: ${id} → ${dispatch.id}`,
      payload: { packetId: id, dispatchId: dispatch.id, queueArtifactPath: artifacts.packetDir }
    });

    return { packet: lifecycleUpdated, dispatch: dispatched, artifacts };
  });

  app.post("/api/lifecycle/packets/:id/result", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: "completed" | "failed" | "running" | "blocked";
      resultSummary?: string;
      errorMessage?: string;
    };

    if (!body.status) {
      return reply.code(400).send({ error: "status is required" });
    }

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    const { packet: updated, errors } = recordWorkPacketExecutorResult(packet, {
      status: body.status,
      resultSummary: body.resultSummary,
      errorMessage: body.errorMessage
    });
    if (errors.length) {
      return reply.code(409).send({ error: "Result recording failed", details: errors });
    }

    await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(id, updated);

    if (packet.dispatchId) {
      const dispatch = await executorStore.getExecutorDispatch(packet.dispatchId);
      if (dispatch) {
        const dispatchUpdated = applyExecutorResult(dispatch, {
          status: body.status,
          resultSummary: body.resultSummary,
          errorMessage: body.errorMessage
        });
        await executorStore.updateExecutorDispatch(packet.dispatchId, dispatchUpdated);
      }
    }

    await syncRunStateForPacket(updated);

    return updated;
  });

  app.post("/api/lifecycle/packets/:id/verification", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      reportedStatus?: "pass" | "fail" | "blocked";
      outputSummary?: string;
      artifactsSummary?: string;
      blockReason?: string;
    };

    if (!body.reportedStatus || !body.outputSummary?.trim() || !body.artifactsSummary?.trim()) {
      return reply.code(400).send({
        error: "reportedStatus, outputSummary, and artifactsSummary are required"
      });
    }

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    const { packet: updated, errors } = attachWorkPacketVerification(packet, {
      reportedStatus: body.reportedStatus,
      outputSummary: body.outputSummary,
      artifactsSummary: body.artifactsSummary,
      blockReason: body.blockReason
    });
    if (errors.length) {
      return reply.code(409).send({ error: "Verification attachment failed", details: errors });
    }

    await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(id, updated);
    await syncRunStateForPacket(updated);
    return updated;
  });

  app.post("/api/lifecycle/packets/:id/close", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: "completed" | "failed" | "blocked" | "cancelled";
      reason?: string;
      handoffUpdated?: boolean;
    };

    if (!body.status) {
      return reply.code(400).send({ error: "status is required" });
    }

    const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(id);
    if (!packet) return reply.code(404).send({ error: "Work packet lifecycle record not found" });

    const { packet: updated, errors } = closeWorkPacketLifecycle(packet, {
      status: body.status,
      reason: body.reason,
      handoffUpdated: body.handoffUpdated
    });
    if (errors.length) {
      return reply.code(409).send({ error: "Close failed", details: errors });
    }

    await workPacketLifecycleStore.updateWorkPacketLifecycleRecord(id, updated);
    await syncRunStateForPacket(updated);
    return updated;
  });
}
