import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { makeWorkLoopId } from "@realmos/work-loop";
import type { WorkItem } from "@realmos/contracts";
import { MIGRATION_FILES, createPgPool, runMigrations } from "../src/db/postgres";
import { OperationalTables } from "../src/lib/persistence/operational-tables";
import { createPostgresOperationalAdapter } from "../src/lib/persistence/postgres-operational-adapter";
import { createWorkLoopStore } from "../src/lib/persistence/create-work-loop-store";
import { createFleetStore } from "../src/lib/persistence/create-fleet-store";
import { createRealmStore } from "../src/lib/persistence/create-realm-store";
import { createPlatformInfraStore } from "../src/lib/persistence/create-platform-infra-store";
import { buildFleetConsole } from "../src/lib/fleet-store";
import { resolvePostgresSmokeConnectionString } from "./helpers/postgres-smoke-env";

const connectionString = resolvePostgresSmokeConnectionString();
const SMOKE_PREFIX = "pg_smoke_v020";

describe("operational persistence (live Postgres smoke)", () => {
  if (!connectionString) {
    it.skip(
      "skipped — DATABASE_URL is not set. Export DATABASE_URL or add it to repo root `.env`, then run: pnpm test:postgres",
      () => undefined
    );
    return;
  }

  let pool: pg.Pool;
  let connectError: Error | undefined;

  function formatConnectError(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    if (error instanceof AggregateError) {
      return error.errors
        .map((entry) => (entry instanceof Error ? entry.message : String(entry)))
        .filter(Boolean)
        .join("; ");
    }
    return String(error);
  }

  beforeAll(async () => {
    try {
      await runMigrations(connectionString);
      pool = createPgPool(connectionString);
      await pool.query("SELECT 1");
    } catch (error) {
      connectError = error instanceof Error ? error : new Error(formatConnectError(error));
      if (!connectError.message) {
        connectError = new Error(formatConnectError(error));
      }
    }
  });

  afterAll(async () => {
    if (!pool) return;
    const tables = [
      OperationalTables.workItems,
      OperationalTables.cursorWorkPackets,
      OperationalTables.parallelWorkPlans,
      OperationalTables.workConflicts,
      OperationalTables.realms,
      OperationalTables.repositoryBindings,
      OperationalTables.isolationViolations
    ];
    for (const table of tables) {
      await pool.query(`DELETE FROM ${table} WHERE id LIKE $1`, [`${SMOKE_PREFIX}%`]);
    }
    await pool.end();
  });

  it("registers migration 006 in the migration runner", () => {
    expect(MIGRATION_FILES).toContain("006_operational_state.sql");
    expect(MIGRATION_FILES).toContain("008_work_packet_lifecycle.sql");
  });

  it("connects, applies migrations, and exposes operational tables from migration 006", async () => {
    if (connectError) {
      throw new Error(
        `Postgres smoke could not connect using DATABASE_URL: ${formatConnectError(connectError)}. ` +
          "Start Postgres locally or fix DATABASE_URL, then re-run: pnpm test:postgres"
      );
    }

    const checks = [
      OperationalTables.workItems,
      OperationalTables.cursorWorkPackets,
      OperationalTables.parallelWorkPlans,
      OperationalTables.workConflicts,
      OperationalTables.realms,
      OperationalTables.repositoryBindings,
      OperationalTables.projectInfrastructurePlans,
      OperationalTables.isolationViolations
    ];

    for (const table of checks) {
      const result = await pool.query<{ regclass: string | null }>(
        "SELECT to_regclass($1) AS regclass",
        [table]
      );
      expect(result.rows[0]?.regclass, `missing table ${table}`).toBeTruthy();
    }
  });

  it("persists work-loop, fleet, realm, and platform-infra records through the Postgres adapter", async () => {
    if (connectError) {
      throw new Error(
        `Postgres smoke could not connect using DATABASE_URL: ${formatConnectError(connectError)}. ` +
          "Start Postgres locally or fix DATABASE_URL, then re-run: pnpm test:postgres"
      );
    }

    const adapter = createPostgresOperationalAdapter(pool);
    const workLoop = createWorkLoopStore(adapter);
    const fleet = createFleetStore(adapter);
    const realm = createRealmStore(adapter);
    const platformInfra = createPlatformInfraStore(adapter);

    const timestamp = new Date().toISOString();
    const workItemId = `${SMOKE_PREFIX}_work_item`;
    const packetId = `${SMOKE_PREFIX}_packet`;
    const planId = `${SMOKE_PREFIX}_plan`;
    const conflictId = `${SMOKE_PREFIX}_conflict`;
    const realmId = `${SMOKE_PREFIX}_realm`;
    const bindingId = `${SMOKE_PREFIX}_binding`;
    const violationId = `${SMOKE_PREFIX}_violation`;

    const workItem: WorkItem = {
      id: workItemId,
      title: "Postgres smoke work item",
      businessId: "realm_os",
      status: "ready",
      priority: "normal",
      riskLevel: "low",
      executionMode: "cursor",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await workLoop.createWorkItem(workItem);

    await workLoop.createCursorWorkPacket({
      id: packetId,
      workItemId,
      title: "Postgres smoke packet",
      status: "ready_for_cursor",
      goal: "Verify durable persistence.",
      filesToRead: ["PROJECT_STATE.md"],
      filesToModify: [],
      rules: ["Do not enable real tool execution."],
      expectedOutput: ["Persistence verified"],
      stopAfter: "Report PASS/FAIL",
      createdByAgentId: "agent_jarvis",
      createdAt: timestamp
    });

    const fleetMeta = await fleet.getFleet();
    await fleet.createParallelWorkPlan({
      id: planId,
      title: "Postgres smoke parallel plan",
      fleetId: fleetMeta.id,
      coordinationMode: "parallel",
      workItemIds: [workItemId],
      dependencyEdges: [],
      conflictIds: [conflictId],
      approvalRequired: true,
      rationale: "Live Postgres smoke coverage",
      createdAt: timestamp
    });

    await fleet.appendWorkConflicts([
      {
        id: conflictId,
        workItemIds: [workItemId],
        conflictType: "same_task",
        severity: "medium",
        resolution: "supervisor_review",
        rationale: "Postgres smoke conflict record",
        createdAt: timestamp
      }
    ]);

    await realm.resetFromSeed({});
    const existingRealms = await realm.listRealms();
    expect(existingRealms.length).toBeGreaterThan(0);

    await adapter.upsertOne(OperationalTables.realms, {
      id: realmId,
      name: "Postgres Smoke Realm",
      type: "software_project",
      status: "active",
      mission: "Live Postgres smoke coverage",
      ownerUserId: "user_idan",
      memoryScopeId: `${SMOKE_PREFIX}_memory`,
      repositoryBindingIds: [bindingId],
      createdAt: timestamp,
      updatedAt: timestamp
    });

    await adapter.upsertOne(OperationalTables.repositoryBindings, {
      id: bindingId,
      realmId,
      provider: "github",
      repoName: "realmos-smoke",
      repoUrl: "https://github.com/example/realmos-smoke",
      defaultBranch: "main",
      allowedBranches: ["main"],
      packagePaths: ["apps/"],
      protectedPaths: [".env"],
      ownershipRules: [],
      createdAt: timestamp,
      updatedAt: timestamp
    });

    await platformInfra.resetFromSeed({});
    const plans = await platformInfra.listProjectInfrastructurePlans();
    expect(plans.length).toBeGreaterThan(0);

    await platformInfra.setIsolationViolations([
      {
        id: violationId,
        realmId: existingRealms.find((r) => r.id.startsWith("realm_"))?.id ?? realmId,
        violationType: "project_uses_realmos_database",
        severity: "high",
        resourceId: plans[0]?.id ?? `${SMOKE_PREFIX}_plan_ref`,
        rationale: "Postgres smoke isolation violation",
        allowedOnlyIfTemporaryPrototype: true,
        requiresUserApproval: true,
        createdAt: timestamp
      }
    ]);

    const reloadedWorkLoop = createWorkLoopStore(createPostgresOperationalAdapter(pool));
    const reloadedFleet = createFleetStore(createPostgresOperationalAdapter(pool));
    const reloadedRealm = createRealmStore(createPostgresOperationalAdapter(pool));
    const reloadedPlatform = createPlatformInfraStore(createPostgresOperationalAdapter(pool));

    expect(await reloadedWorkLoop.getWorkItem(workItemId)).toMatchObject({ title: workItem.title });
    expect(await reloadedWorkLoop.getCursorWorkPacket(packetId)).toMatchObject({ workItemId });
    expect((await reloadedFleet.listParallelWorkPlans()).some((plan) => plan.id === planId)).toBe(true);
    expect((await reloadedFleet.listWorkConflicts()).some((conflict) => conflict.id === conflictId)).toBe(
      true
    );
    expect(await reloadedRealm.getRealm(realmId)).toMatchObject({ name: "Postgres Smoke Realm" });
    expect(await reloadedRealm.getRepositoryBinding(bindingId)).toMatchObject({
      repoName: "realmos-smoke"
    });
    expect((await reloadedPlatform.listIsolationViolations()).some((v) => v.id === violationId)).toBe(
      true
    );

    const fleetConsole = await buildFleetConsole(reloadedFleet);
    expect(fleetConsole.executionEnabled).toBe(false);

    const policy = await reloadedWorkLoop.getContinuousWorkPolicy();
    expect(policy.requireApprovalForCost).toBe(true);
  });
});
