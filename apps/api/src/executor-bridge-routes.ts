import type { FastifyInstance } from "fastify";
import type { LocalExecutorDispatchInput } from "@realmos/contracts";
import {
  applyExecutorApproval,
  applyExecutorResult,
  buildLocalExecutorDispatch,
  buildLocalExecutorDispatchFromWorkPacket,
  canDispatchLocalExecutor,
  getExecutorQueueRoot,
  isExecutorBridgeEnabled,
  markExecutorDispatched,
  summarizeExecutorBridge,
  validateLocalExecutorDispatchInput,
  writeExecutorQueueArtifacts
} from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { executorStore } from "./lib/executor-store";

export async function buildExecutorBridgeStatus() {
  const dispatches = await executorStore.listExecutorDispatches();
  return summarizeExecutorBridge(dispatches, getExecutorQueueRoot());
}

export function registerExecutorBridgeRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/executor/status", async () => buildExecutorBridgeStatus());

  app.get("/api/executor/dispatches", async () => ({
    items: await executorStore.listExecutorDispatches()
  }));

  app.get("/api/executor/dispatches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const dispatch = await executorStore.getExecutorDispatch(id);
    if (!dispatch) return reply.code(404).send({ error: "Executor dispatch not found" });
    return dispatch;
  });

  app.post("/api/executor/dispatches", async (request, reply) => {
    if (!isExecutorBridgeEnabled()) {
      return reply.code(503).send({ error: "Executor bridge is disabled" });
    }

    const body = request.body as LocalExecutorDispatchInput;
    const errors = validateLocalExecutorDispatchInput(body);
    if (errors.length) {
      return reply.code(400).send({ error: "Validation failed", details: errors });
    }

    const dispatch = buildLocalExecutorDispatch(body);
    await executorStore.createExecutorDispatch(dispatch);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Executor dispatch queued: ${dispatch.id}`,
      payload: { dispatchId: dispatch.id, workPacketId: dispatch.workPacketId }
    });

    return reply.code(201).send(dispatch);
  });

  app.post("/api/executor/dispatches/from-packet", async (request, reply) => {
    if (!isExecutorBridgeEnabled()) {
      return reply.code(503).send({ error: "Executor bridge is disabled" });
    }

    const body = request.body as {
      workPacketId?: string;
      realmId?: string;
      repositoryId?: string;
      branchTarget?: string;
      worktreeTarget?: string;
      executorId?: string;
    };

    if (!body.workPacketId || !body.realmId || !body.repositoryId) {
      return reply
        .code(400)
        .send({ error: "workPacketId, realmId, and repositoryId are required" });
    }

    const packet = await db.getCursorWorkPacket(body.workPacketId);
    if (!packet) return reply.code(404).send({ error: "Work packet not found" });

    const input = buildLocalExecutorDispatchFromWorkPacket(packet, {
      realmId: body.realmId,
      repositoryId: body.repositoryId,
      branchTarget: body.branchTarget,
      worktreeTarget: body.worktreeTarget,
      executorId: body.executorId
    });

    const errors = validateLocalExecutorDispatchInput(input);
    if (errors.length) {
      return reply.code(400).send({ error: "Validation failed", details: errors });
    }

    const dispatch = buildLocalExecutorDispatch(input);
    await executorStore.createExecutorDispatch(dispatch);

    return reply.code(201).send(dispatch);
  });

  app.post("/api/executor/dispatches/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const dispatch = await executorStore.getExecutorDispatch(id);
    if (!dispatch) return reply.code(404).send({ error: "Executor dispatch not found" });

    const approved = applyExecutorApproval(dispatch);
    await executorStore.updateExecutorDispatch(id, approved);

    return approved;
  });

  app.post("/api/executor/dispatches/:id/dispatch", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { approved?: boolean; cwd?: string };

    const dispatch = await executorStore.getExecutorDispatch(id);
    if (!dispatch) return reply.code(404).send({ error: "Executor dispatch not found" });

    const gate = canDispatchLocalExecutor(dispatch, { approved: body.approved === true });
    if (!gate.allowed) {
      const blocked = { ...dispatch, status: "blocked" as const, errorMessage: gate.reason };
      await executorStore.updateExecutorDispatch(id, blocked);
      return reply.code(409).send({ error: gate.reason, dispatch: blocked });
    }

    const artifacts = await writeExecutorQueueArtifacts(dispatch, body.cwd ?? process.cwd());
    const dispatched = markExecutorDispatched(dispatch, artifacts.packetDir);
    await executorStore.updateExecutorDispatch(id, dispatched);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Executor dispatch written to queue: ${dispatch.id}`,
      payload: { dispatchId: dispatch.id, queueArtifactPath: artifacts.packetDir }
    });

    return { dispatch: dispatched, artifacts };
  });

  app.post("/api/executor/dispatches/:id/result", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: "completed" | "failed" | "running" | "blocked";
      resultSummary?: string;
      errorMessage?: string;
    };

    if (!body.status) {
      return reply.code(400).send({ error: "status is required" });
    }

    const dispatch = await executorStore.getExecutorDispatch(id);
    if (!dispatch) return reply.code(404).send({ error: "Executor dispatch not found" });

    const updated = applyExecutorResult(dispatch, {
      status: body.status,
      resultSummary: body.resultSummary,
      errorMessage: body.errorMessage
    });
    await executorStore.updateExecutorDispatch(id, updated);

    return updated;
  });
}
