import Fastify from "fastify";
import { createMemoryDatabase } from "./db/memory-database";
import { createPgPool, runMigrations } from "./db/postgres";
import { createPostgresDatabase } from "./db/postgres-database";
import type { RealmOSDatabase } from "./db/types";
import {
  configureOperationalPersistence,
  seedOperationalStoresIfEmpty
} from "./lib/persistence/configure-operational-stores";
import { createMemoryOperationalAdapter } from "./lib/persistence/memory-operational-adapter";
import { createPostgresOperationalAdapter } from "./lib/persistence/postgres-operational-adapter";
import { workLoopStore } from "./lib/work-loop-store";
import { registerApiRoutes } from "./routes";
import { loadSeedBundleFromRepo } from "./seed/load-seed";

export type AppOptions = {
  database?: RealmOSDatabase;
};

export async function createDatabaseFromEnv(): Promise<RealmOSDatabase> {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString && process.env.REALMOS_USE_MEMORY_DB !== "true") {
    await runMigrations(connectionString);
    const pool = createPgPool(connectionString);
    configureOperationalPersistence(createPostgresOperationalAdapter(pool));
    await seedOperationalStoresIfEmpty();
    const db = createPostgresDatabase(pool);
    const businesses = await db.listBusinesses();
    if (businesses.length === 0) {
      await db.loadSeed(await loadSeedBundleFromRepo());
    }
    return db;
  }

  configureOperationalPersistence(createMemoryOperationalAdapter());
  const bundle = await loadSeedBundleFromRepo();
  await seedOperationalStoresIfEmpty();
  await workLoopStore.resetFromSeed(bundle);
  const db = createMemoryDatabase(bundle);
  return db;
}

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({ logger: false });

  app.setErrorHandler((error: unknown, _request, reply) => {
    const err = error as { statusCode?: number; message?: string };
    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
    reply.code(statusCode).send({
      error: err.message ?? "Internal server error",
      statusCode
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: "Not found", statusCode: 404 });
  });

  if (options.database) {
    configureOperationalPersistence(createMemoryOperationalAdapter());
    await seedOperationalStoresIfEmpty();
  }
  const db = options.database ?? (await createDatabaseFromEnv());
  registerApiRoutes(app, db);
  const { registerJarvisRoutes } = await import("./jarvis-routes");
  registerJarvisRoutes(app, db);
  const { registerNecromancerRoutes } = await import("./necromancer-routes");
  registerNecromancerRoutes(app, db);
  const { registerCapabilityScoutRoutes } = await import("./capability-scout-routes");
  registerCapabilityScoutRoutes(app, db);
  const { registerCommunicationRoutes } = await import("./communication-routes");
  registerCommunicationRoutes(app, db);
  const { registerSpecKitRoutes } = await import("./speckit-routes");
  registerSpecKitRoutes(app, db);
  const { registerMemoryRoutes } = await import("./memory-routes");
  registerMemoryRoutes(app, db);
  const { registerModelRouterRoutes } = await import("./model-router-routes");
  registerModelRouterRoutes(app, db);
  const { registerIntelligenceRoutes } = await import("./intelligence-routes");
  registerIntelligenceRoutes(app, db);
  const { registerWorldRoutes } = await import("./world-routes");
  registerWorldRoutes(app, db);
  const { registerToolRunnerRoutes } = await import("./tool-runner-routes");
  registerToolRunnerRoutes(app, db);
  const { registerExportRoutes } = await import("./export-routes");
  registerExportRoutes(app, db);
  const { registerWorkLoopRoutes } = await import("./work-loop-routes");
  registerWorkLoopRoutes(app, db);
  const { registerFleetRoutes } = await import("./fleet-routes");
  registerFleetRoutes(app, db);
  const { registerRealmRoutes } = await import("./realm-routes");
  registerRealmRoutes(app, db);
  const { registerPlatformInfraRoutes } = await import("./platform-infra-routes");
  registerPlatformInfraRoutes(app, db);
  const { registerExecutorBridgeRoutes } = await import("./executor-bridge-routes");
  registerExecutorBridgeRoutes(app, db);
  const { registerWorkPacketLifecycleRoutes } = await import("./work-packet-lifecycle-routes");
  registerWorkPacketLifecycleRoutes(app, db);
  const { registerRunStateHandoffRoutes } = await import("./run-state-handoff-routes");
  registerRunStateHandoffRoutes(app, db);
  return { app, db };
}
