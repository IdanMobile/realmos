import type { FastifyInstance } from "fastify";
import { finalizeCapabilitySearchReport } from "@realmos/tools";
import type { RealmOSDatabase } from "./db/types";

export function registerCapabilityScoutRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/capability-scout/reports", async () => ({
    items: await db.listCapabilityReports()
  }));

  app.post("/api/capability-scout/search", async (request, reply) => {
    const body = request.body as {
      needSummary?: string;
      creationProposalId?: string;
    };

    if (!body.needSummary?.trim()) {
      return reply.code(400).send({ error: "needSummary is required" });
    }

    const report = finalizeCapabilitySearchReport({
      needSummary: body.needSummary,
      creationProposalId: body.creationProposalId
    });

    await db.appendCapabilityReport(report);
    return reply.code(201).send(report);
  });
}
