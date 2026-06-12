import type { FastifyInstance } from "fastify";
import type { MemoryScope } from "@realmos/contracts";
import {
  buildMemorySummaries,
  deleteMemory,
  editMemory,
  listAgentMemories,
  listBusinessMemories,
  listGlobalMemories,
  listTaskMemories,
  retrieveMemories,
  retrieveMemoriesForAgent,
  writeAgentMemory,
  writeBusinessMemory,
  writeGlobalMemory,
  writeMemory,
  writeTaskMemory,
  type WriteMemoryInput
} from "@realmos/memory";
import { createMemoryStore } from "./lib/memory-store";
import type { RealmOSDatabase } from "./db/types";

async function recordMemoryAudit(
  db: RealmOSDatabase,
  summary: string,
  payload: Record<string, unknown>
): Promise<void> {
  await db.appendAuditEvent({
    id: `audit_memory_${Date.now().toString(36)}`,
    actorType: "system",
    eventType: "memory_written",
    summary,
    payload,
    createdAt: new Date().toISOString()
  });
}

export function registerMemoryRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  const store = createMemoryStore(db);

  app.get("/api/memory/summaries", async () => ({
    items: buildMemorySummaries(await db.listMemories())
  }));

  app.get("/api/memory/scoped/:scope", async (request) => {
    const { scope } = request.params as { scope: MemoryScope };
    const query = request.query as { scopeId?: string };

    switch (scope) {
      case "global":
        return { items: await listGlobalMemories(store) };
      case "business":
        if (!query.scopeId) return { items: [], error: "scopeId is required for business memory." };
        return { items: await listBusinessMemories(store, query.scopeId) };
      case "agent":
        if (!query.scopeId) return { items: [], error: "scopeId is required for agent memory." };
        return { items: await listAgentMemories(store, query.scopeId) };
      case "task":
        if (!query.scopeId) return { items: [], error: "scopeId is required for task memory." };
        return { items: await listTaskMemories(store, query.scopeId) };
      default:
        return { items: await retrieveMemories(store, { scope, scopeId: query.scopeId }) };
    }
  });

  app.get("/api/memory/agent/:agentId", async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const query = request.query as {
      businessMemoryScopeId?: string;
      includeSensitive?: string;
    };

    const agent = await db.getAgent(agentId);
    if (!agent) return reply.code(404).send({ error: "Agent not found" });

    const items = await retrieveMemoriesForAgent(
      store,
      { agent, businessMemoryScopeId: query.businessMemoryScopeId },
      { includeSensitive: query.includeSensitive === "true" }
    );

    return { items };
  });

  app.post("/api/memory/global", async (request, reply) => {
    const body = request.body as Omit<WriteMemoryInput, "scope" | "scopeId">;
    const created = await writeGlobalMemory(store, body);
    await recordMemoryAudit(db, `Wrote global memory ${created.title}`, {
      memoryId: created.id,
      scope: created.scope
    });
    return reply.code(201).send(created);
  });

  app.post("/api/memory/business/:memoryScopeId", async (request, reply) => {
    const { memoryScopeId } = request.params as { memoryScopeId: string };
    const body = request.body as Omit<WriteMemoryInput, "scope" | "scopeId">;
    const created = await writeBusinessMemory(store, memoryScopeId, body);
    await recordMemoryAudit(db, `Wrote business memory ${created.title}`, {
      memoryId: created.id,
      scope: created.scope,
      scopeId: memoryScopeId
    });
    return reply.code(201).send(created);
  });

  app.post("/api/memory/agent/:agentId", async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const body = request.body as Omit<WriteMemoryInput, "scope" | "scopeId">;
    const created = await writeAgentMemory(store, agentId, body);
    await recordMemoryAudit(db, `Wrote agent memory ${created.title}`, {
      memoryId: created.id,
      scope: created.scope,
      scopeId: agentId
    });
    return reply.code(201).send(created);
  });

  app.post("/api/memory/task/:taskId", async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    const body = request.body as Omit<WriteMemoryInput, "scope" | "scopeId">;
    const created = await writeTaskMemory(store, taskId, body);
    await recordMemoryAudit(db, `Wrote task memory ${created.title}`, {
      memoryId: created.id,
      scope: created.scope,
      scopeId: taskId
    });
    return reply.code(201).send(created);
  });

  app.post("/api/memory/write", async (request, reply) => {
    const body = request.body as WriteMemoryInput;
    try {
      const created = await writeMemory(store, body);
      await recordMemoryAudit(db, `Wrote memory ${created.title}`, {
        memoryId: created.id,
        scope: created.scope
      });
      return reply.code(201).send(created);
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : "Invalid memory" });
    }
  });

  app.patch("/api/memory/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const patch = request.body as Parameters<typeof editMemory>[2];

    try {
      const updated = await editMemory(store, id, patch);
      if (!updated) return reply.code(404).send({ error: "Memory not found" });
      await recordMemoryAudit(db, `Updated memory ${updated.title}`, { memoryId: updated.id, patch });
      return updated;
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : "Invalid memory patch" });
    }
  });

  app.delete("/api/memory/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await db.getMemory(id);
    if (!existing) return reply.code(404).send({ error: "Memory not found" });

    const deleted = await deleteMemory(store, id);
    if (!deleted) return reply.code(404).send({ error: "Memory not found" });

    await recordMemoryAudit(db, `Deleted memory ${existing.title}`, { memoryId: id });
    return reply.code(204).send();
  });
}
