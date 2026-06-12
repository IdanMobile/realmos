import type { FastifyInstance } from "fastify";
import type { RealmOSDatabase } from "./db/types";
import { buildExportBundle } from "./lib/health-export";
import { recordAudit } from "./lib/audit";

export function registerExportRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/export/bundle", async (_request, reply) => {
    const bundle = await buildExportBundle(db);
    await recordAudit(db, {
      actorType: "user",
      eventType: "run_completed",
      summary: "Exported RealmOS data bundle",
      payload: { counts: bundle.counts }
    });
    reply.header("content-disposition", 'attachment; filename="realmos-export.json"');
    return bundle;
  });
}
