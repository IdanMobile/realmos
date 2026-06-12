import type { FastifyInstance } from "fastify";
import {
  appendAgentMessage,
  archiveCommunicationThread,
  buildCommunicationAnalytics,
  buildSystemOptimizerCommunicationHooks,
  createCommunicationThread,
  extractDecisionsFromMessages,
  getThreadWithMessages,
  persistExtractedDecisions
} from "@realmos/core";
import { createCommunicationLedgerStore } from "./lib/communication-store";
import type { RealmOSDatabase } from "./db/types";

export function registerCommunicationRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  const store = createCommunicationLedgerStore(db);

  app.get("/api/communications/threads", async () => ({
    items: await db.listCommunicationThreads()
  }));

  app.get("/api/communications/threads/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const detail = await getThreadWithMessages(store, id);
    if (!detail) return reply.code(404).send({ error: "Thread not found" });

    const decisions = await db.listCommunicationDecisionsByThread(id);
    return { ...detail, decisions };
  });

  app.post("/api/communications/threads", async (request, reply) => {
    const body = request.body as Parameters<typeof createCommunicationThread>[1];
    const thread = await createCommunicationThread(store, body);
    return reply.code(201).send(thread);
  });

  app.post("/api/communications/threads/:id/messages", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Omit<Parameters<typeof appendAgentMessage>[1], "threadId">;
    try {
      const message = await appendAgentMessage(store, { ...body, threadId: id });
      return reply.code(201).send(message);
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : "Invalid message" });
    }
  });

  app.post("/api/communications/threads/:id/extract-decisions", async (request, reply) => {
    const { id } = request.params as { id: string };
    const detail = await getThreadWithMessages(store, id);
    if (!detail) return reply.code(404).send({ error: "Thread not found" });

    const extracted = extractDecisionsFromMessages(
      id,
      detail.messages,
      detail.thread.businessId,
      detail.thread.taskId
    );
    const decisions = await persistExtractedDecisions(store, extracted);
    return reply.code(201).send({ items: decisions });
  });

  app.post("/api/communications/threads/:id/archive", async (request, reply) => {
    const { id } = request.params as { id: string };
    const archived = await archiveCommunicationThread(store, id);
    if (!archived) return reply.code(404).send({ error: "Thread not found" });
    return reply.code(201).send(archived);
  });

  app.get("/api/communications/analytics", async () => {
    const [threads, messages, decisions] = await Promise.all([
      db.listCommunicationThreads(),
      db.listCommunicationMessages(),
      db.listCommunicationDecisions()
    ]);

    const analytics = buildCommunicationAnalytics({
      threads,
      messages,
      decisionCount: decisions.length
    });

    return {
      analytics,
      optimizerHooks: buildSystemOptimizerCommunicationHooks(analytics)
    };
  });
}
