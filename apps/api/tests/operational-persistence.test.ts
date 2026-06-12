import { describe, expect, it, beforeEach } from "vitest";
import { createMemoryOperationalAdapter } from "../src/lib/persistence/memory-operational-adapter";
import { configureOperationalPersistence } from "../src/lib/persistence/configure-operational-stores";
import { createWorkLoopStore } from "../src/lib/persistence/create-work-loop-store";
import { createFleetStore } from "../src/lib/persistence/create-fleet-store";
import { createRealmStore } from "../src/lib/persistence/create-realm-store";
import { createPlatformInfraStore } from "../src/lib/persistence/create-platform-infra-store";
import { createExecutorStore } from "../src/lib/persistence/create-executor-store";
import { buildLocalExecutorDispatch } from "@realmos/work-loop";
import { buildFleetConsole } from "../src/lib/fleet-store";
import { makeWorkLoopId } from "@realmos/work-loop";
import type { WorkItem } from "@realmos/contracts";

describe("operational persistence", () => {
  beforeEach(async () => {
    configureOperationalPersistence(createMemoryOperationalAdapter());
  });

  it("retains work-loop state across store re-instantiation on the same adapter", async () => {
    const adapter = createMemoryOperationalAdapter();
    const storeA = createWorkLoopStore(adapter);
    const timestamp = new Date().toISOString();
    const item: WorkItem = {
      id: makeWorkLoopId("work"),
      title: "Persist me",
      businessId: "realm_os",
      status: "ready",
      priority: "normal",
      riskLevel: "low",
      executionMode: "cursor",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await storeA.createWorkItem(item);

    const storeB = createWorkLoopStore(adapter);
    const items = await storeB.listWorkItems();
    expect(items.some((entry) => entry.id === item.id)).toBe(true);
  });

  it("retains fleet planning state across store re-instantiation", async () => {
    const adapter = createMemoryOperationalAdapter();
    const storeA = createFleetStore(adapter);
    await storeA.resetFromSeed({});

    const timestamp = new Date().toISOString();
    await storeA.createParallelWorkPlan({
      id: "plan_persist_test",
      fleetId: (await storeA.getFleet()).id,
      title: "Parallel plan",
      coordinationMode: "parallel",
      workItemIds: [],
      dependencyEdges: [],
      conflictIds: [],
      approvalRequired: true,
      rationale: "Test persistence",
      createdAt: timestamp
    });

    const storeB = createFleetStore(adapter);
    const plans = await storeB.listParallelWorkPlans();
    expect(plans.some((plan) => plan.id === "plan_persist_test")).toBe(true);

    const consoleView = await buildFleetConsole(storeB);
    expect(consoleView.executionEnabled).toBe(false);
  });

  it("retains realm and platform infra records across re-instantiation", async () => {
    const adapter = createMemoryOperationalAdapter();
    const realmA = createRealmStore(adapter);
    const platformA = createPlatformInfraStore(adapter);
    await realmA.resetFromSeed({});
    await platformA.resetFromSeed({});

    const realms = await realmA.listRealms();
    expect(realms.length).toBeGreaterThan(0);

    const realmB = createRealmStore(adapter);
    const platformB = createPlatformInfraStore(adapter);
    expect(await realmB.listRealms()).toEqual(realms);
    expect((await platformB.listProjectInfrastructurePlans()).length).toBeGreaterThan(0);
  });

  it("uses ephemeral in-memory fallback when adapter is replaced", async () => {
    const adapterA = createMemoryOperationalAdapter();
    const storeA = createWorkLoopStore(adapterA);
    const timestamp = new Date().toISOString();
    await storeA.createWorkItem({
      id: makeWorkLoopId("work"),
      title: "Ephemeral",
      businessId: "realm_os",
      status: "ready",
      priority: "normal",
      riskLevel: "low",
      executionMode: "cursor",
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const adapterB = createMemoryOperationalAdapter();
    const storeB = createWorkLoopStore(adapterB);
    const items = await storeB.listWorkItems();
    expect(items.some((entry) => entry.title === "Ephemeral")).toBe(false);
  });

  it("keeps approval gates after reload via durable store", async () => {
    const adapter = createMemoryOperationalAdapter();
    const store = createWorkLoopStore(adapter);
    await store.resetFromSeed({});

    const policy = await store.getContinuousWorkPolicy();
    expect(policy.requireApprovalForCost).toBe(true);
    expect(policy.requireApprovalForExternalActions).toBe(true);

    const reloaded = createWorkLoopStore(adapter);
    const reloadedPolicy = await reloaded.getContinuousWorkPolicy();
    expect(reloadedPolicy.requireApprovalForDestructiveActions).toBe(true);
    expect(reloadedPolicy.requireStopCheckBeforePhaseAdvance).toBe(true);
  });

  it("retains executor dispatches across store re-instantiation", async () => {
    const adapter = createMemoryOperationalAdapter();
    const storeA = createExecutorStore(adapter);
    const dispatch = buildLocalExecutorDispatch({
      realmId: "realm_realmos",
      repositoryId: "repo_realmos",
      workPacketId: "packet_persist",
      allowedPaths: ["packages/**"],
      forbiddenPaths: [".env"],
      taskSummary: "Persist executor dispatch",
      prompt: "Dry-run only.",
      verificationCommands: ["pnpm test"]
    }, "exec_persist_test");

    await storeA.createExecutorDispatch(dispatch);

    const storeB = createExecutorStore(adapter);
    const loaded = await storeB.getExecutorDispatch("exec_persist_test");
    expect(loaded?.status).toBe("queued");
    expect(loaded?.realmId).toBe("realm_realmos");
  });
});
