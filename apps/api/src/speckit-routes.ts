import type { FastifyInstance } from "fastify";
import { generateSpecKitArtifacts } from "@realmos/core";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";

export function registerSpecKitRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/artifacts", async (request) => {
    const { businessId } = request.query as { businessId?: string };
    if (businessId) {
      return { items: await db.listArtifactsByBusiness(businessId) };
    }
    return { items: await db.listArtifacts() };
  });

  app.post("/api/businesses/:id/speckit/generate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { ideaText?: string };

    const business = await db.getBusiness(id);
    if (!business) return reply.code(404).send({ error: "Business not found" });

    const [agents, tasks] = await Promise.all([db.listAgents(), db.listTasks()]);
    const businessAgents = agents.filter((agent) => agent.businessId === id);
    const businessTasks = tasks.filter((task) => task.businessId === id);

    const bundle = generateSpecKitArtifacts({
      business,
      ideaText: body.ideaText ?? business.mission,
      agents: businessAgents,
      tasks: businessTasks
    });

    for (const artifact of bundle.artifacts) {
      await db.createArtifact(artifact);
      await recordAudit(db, {
        actorType: "system",
        businessId: id,
        eventType: "artifact_created",
        summary: `Generated artifact ${artifact.title}`,
        payload: { artifactId: artifact.id, path: artifact.path }
      });
    }

    return reply.code(201).send({
      businessId: id,
      artifactIds: bundle.artifacts.map((artifact) => artifact.id),
      paths: bundle.files.map((file) => file.path)
    });
  });
}
