import type { FastifyInstance } from "fastify";
import type { ToolRunKind } from "@realmos/contracts";
import {
  attemptApprovedToolRun,
  isTerminalExecutionEnabled,
  listEnabledMvpTools,
  submitToolRun
} from "@realmos/tool-runner";
import { createToolRunnerStore } from "./lib/tool-runner-store";
import type { RealmOSDatabase } from "./db/types";

export function registerToolRunnerRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  const store = createToolRunnerStore(db);

  app.get("/api/tools/registry", async () => ({
    items: listEnabledMvpTools(),
    terminalExecutionEnabled: isTerminalExecutionEnabled()
  }));

  app.get("/api/tools/runs", async () => {
    const [requests, results] = await Promise.all([db.listToolRunRequests(), db.listToolRunResults()]);
    return { requests, results };
  });

  app.post("/api/tools/runs", async (request, reply) => {
    const body = request.body as {
      kind: ToolRunKind;
      tool: "filesystem" | "terminal";
      title: string;
      payload: Record<string, unknown>;
      agentId?: string;
      businessId?: string;
    };

    try {
      const outcome = await submitToolRun(store, body);
      return reply.code(201).send(outcome);
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : "Invalid tool run" });
    }
  });

  app.post("/api/tools/runs/:id/attempt-approved", async (request, reply) => {
    const { id } = request.params as { id: string };
    const toolRequest = await db.getToolRunRequest(id);
    if (!toolRequest) return reply.code(404).send({ error: "Tool run not found" });
    if (!toolRequest.approvalId) {
      return reply.code(400).send({ error: "Tool run has no linked approval." });
    }

    const approval = await db.getApproval(toolRequest.approvalId);
    if (!approval) return reply.code(404).send({ error: "Approval not found" });

    const outcome = await attemptApprovedToolRun(store, toolRequest, approval);
    return reply.code(200).send(outcome);
  });
}
