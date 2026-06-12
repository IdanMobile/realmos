import type { FastifyInstance } from "fastify";
import {
  detectRepositoryConflicts,
  enrichCursorWorkPacketWithRepositoryBoundary,
  type RepositoryWorkScope
} from "@realmos/realm-scope";
import { generateCursorWorkPacket } from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { realmStore } from "./lib/realm-store";

export function registerRealmRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/realms", async () => ({ items: await realmStore.listRealms() }));

  app.get("/api/realm/console", async () => realmStore.getRealmConsole());

  app.get("/api/repository/bindings", async () => ({
    items: await realmStore.listRepositoryBindings()
  }));

  app.post("/api/repository/conflicts/check", async (request, reply) => {
    const body = request.body as { scopes?: RepositoryWorkScope[] };
    if (!body.scopes?.length) {
      return reply.code(400).send({ error: "scopes array is required" });
    }

    const bindings = await realmStore.listRepositoryBindings();
    const conflicts = detectRepositoryConflicts(body.scopes, bindings);
    await realmStore.appendRepositoryConflicts(conflicts);

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Repository conflict check: ${conflicts.length} conflict(s)`,
      payload: { conflictCount: conflicts.length }
    });

    return {
      conflicts,
      blocked: conflicts.some((conflict) => conflict.resolution === "block")
    };
  });

  app.post("/api/repository/work-packets/enrich", async (request, reply) => {
    const body = request.body as {
      workItemId?: string;
      realmId?: string;
      repositoryBindingId?: string;
      scope?: "global" | "realm";
    };

    if (!body.workItemId || !body.realmId || !body.repositoryBindingId) {
      return reply.code(400).send({ error: "workItemId, realmId, repositoryBindingId required" });
    }

    const workItem = await db.getWorkItem(body.workItemId);
    if (!workItem) return reply.code(404).send({ error: "Work item not found" });

    const binding = await realmStore.getRepositoryBinding(body.repositoryBindingId);
    if (!binding) return reply.code(404).send({ error: "Repository binding not found" });

    const basePacket = generateCursorWorkPacket({ workItem });
    const enriched = enrichCursorWorkPacketWithRepositoryBoundary({
      packet: basePacket,
      realmId: body.realmId,
      scope: body.scope ?? (body.realmId === "realm_realmos" ? "global" : "realm"),
      repositoryBinding: binding
    });

    return reply.code(201).send(enriched);
  });
}
