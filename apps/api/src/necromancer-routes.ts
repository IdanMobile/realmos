import type { FastifyInstance } from "fastify";
import type { RealmOSDatabase } from "./db/types";
import {
  createCreationProposal,
  pauseAgent,
  prepareAgentCreationFromProposal,
  retireAgent
} from "@realmos/agents";

export function registerNecromancerRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
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
      return reply.code(201).send(result);
    }

    return reply.code(result.status === "ready" ? 200 : 409).send(result);
  });

  app.post("/api/agents/:id/pause", async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = await db.getAgent(id);
    if (!agent) return reply.code(404).send({ error: "Agent not found" });

    const updated = await db.updateAgent(id, pauseAgent(agent));
    return updated;
  });

  app.post("/api/agents/:id/retire", async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = await db.getAgent(id);
    if (!agent) return reply.code(404).send({ error: "Agent not found" });

    const updated = await db.updateAgent(id, retireAgent(agent));
    return updated;
  });
}
