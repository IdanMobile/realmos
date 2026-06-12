import type { FastifyInstance } from "fastify";
import { generateWorldMap, WORLD_MAP_VISUAL_AGENT } from "@realmos/core";
import type { RealmOSDatabase } from "./db/types";

export function registerWorldRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.post("/api/world/rebuild", async () => {
    const [businesses, agents, tasks, existing] = await Promise.all([
      db.listBusinesses(),
      db.listAgents(),
      db.listTasks(),
      db.getWorldMap()
    ]);

    const worldMap = generateWorldMap({ existing, businesses, agents, tasks });
    const saved = await db.saveWorldMap(worldMap);
    return { worldMap: saved, visualAgent: WORLD_MAP_VISUAL_AGENT };
  });

  app.get("/api/world/visual-agent", async () => WORLD_MAP_VISUAL_AGENT);
}
