import type { FastifyInstance } from "fastify";
import { createBusinessFromIdea, generateSpecKitArtifacts, handleJarvisChat } from "@realmos/core";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";

async function persistSpecKitForBusiness(
  db: RealmOSDatabase,
  input: Parameters<typeof generateSpecKitArtifacts>[0]
): Promise<string[]> {
  const bundle = generateSpecKitArtifacts(input);
  for (const artifact of bundle.artifacts) {
    await db.createArtifact(artifact);
    await recordAudit(db, {
      actorType: "system",
      businessId: input.business.id,
      eventType: "artifact_created",
      summary: `Generated artifact ${artifact.title}`,
      payload: { artifactId: artifact.id, path: artifact.path }
    });
  }
  return bundle.artifacts.map((artifact) => artifact.id);
}

export function registerJarvisRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.post("/api/jarvis/chat", async (request) => {
    const body = request.body as {
      message?: string;
      userId?: string;
      execute?: boolean;
    };

    const response = await handleJarvisChat(db, {
      message: body.message ?? "",
      userId: body.userId,
      execute: body.execute
    });

    if (response.result?.businessId && body.execute !== false) {
      const business = await db.getBusiness(response.result.businessId);
      if (business) {
        const [agents, tasks] = await Promise.all([db.listAgents(), db.listTasks()]);
        const artifactIds = await persistSpecKitForBusiness(db, {
          business,
          ideaText: body.message ?? business.mission,
          agents: agents.filter((agent) => agent.businessId === business.id),
          tasks: tasks.filter((task) => task.businessId === business.id)
        });
        return { ...response, result: { ...response.result, createdArtifactIds: artifactIds } };
      }
    }

    return response;
  });

  app.post("/api/jarvis/commands/create-business-from-idea", async (request, reply) => {
    const body = request.body as {
      ideaText?: string;
      businessName?: string;
      userId?: string;
      businessType?: Parameters<typeof createBusinessFromIdea>[1]["businessType"];
    };

    const result = await createBusinessFromIdea(db, {
      userId: body.userId ?? "user_idan",
      ideaText: body.ideaText ?? "",
      proposedName: body.businessName,
      businessType: body.businessType
    });

    const artifactIds = await persistSpecKitForBusiness(db, {
      business: result.business,
      ideaText: body.ideaText ?? result.business.mission,
      agents: result.agents,
      tasks: result.tasks
    });

    return reply.code(201).send({
      businessId: result.business.id,
      businessName: result.business.name,
      createdAgentIds: result.agents.map((agent) => agent.id),
      createdTaskIds: result.tasks.map((task) => task.id),
      createdMemoryIds: result.memories.map((memory) => memory.id),
      createdArtifactIds: artifactIds,
      worldMapNodeIds: result.worldMap.nodes
        .filter((node) => node.refId === result.business.id || result.agents.some((agent) => agent.id === node.refId))
        .map((node) => node.id)
    });
  });
}
