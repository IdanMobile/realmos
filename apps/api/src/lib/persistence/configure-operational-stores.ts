import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { createMemoryOperationalAdapter } from "./memory-operational-adapter";
import { createWorkLoopStore, type WorkLoopStore } from "./create-work-loop-store";
import { createFleetStore, type FleetStore } from "./create-fleet-store";
import { createRealmStore, type RealmStore } from "./create-realm-store";
import { createPlatformInfraStore, type PlatformInfraStore } from "./create-platform-infra-store";
import { createExecutorStore, type ExecutorStore } from "./create-executor-store";
import {
  createWorkPacketLifecycleStore,
  type WorkPacketLifecycleStore
} from "./create-work-packet-lifecycle-store";
import { OperationalTables } from "./operational-tables";
import { createDefaultWorkLoopSeed } from "../work-loop-seed";
import { createDefaultFleetSeed } from "../fleet-seed";
import { createDefaultRealmSeed } from "../realm-store";
import { createDefaultPlatformInfraSeed } from "../platform-infra-store";

let activeAdapter: OperationalPersistenceAdapter = createMemoryOperationalAdapter();

const storeRefs = {
  workLoop: createWorkLoopStore(activeAdapter),
  fleet: createFleetStore(activeAdapter),
  realm: createRealmStore(activeAdapter),
  platformInfra: createPlatformInfraStore(activeAdapter),
  executor: createExecutorStore(activeAdapter),
  workPacketLifecycle: createWorkPacketLifecycleStore(activeAdapter)
};

function bindStoreProxy<T extends object>(getter: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const store = getter();
      const value = store[prop as keyof T];
      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(store);
      }
      return value;
    }
  });
}

export const workLoopStore = bindStoreProxy(() => storeRefs.workLoop);
export const fleetStore = bindStoreProxy(() => storeRefs.fleet);
export const realmStore = bindStoreProxy(() => storeRefs.realm);
export const platformInfraStore = bindStoreProxy(() => storeRefs.platformInfra);
export const executorStore = bindStoreProxy(() => storeRefs.executor);
export const workPacketLifecycleStore = bindStoreProxy(() => storeRefs.workPacketLifecycle);

export function getOperationalPersistenceAdapter(): OperationalPersistenceAdapter {
  return activeAdapter;
}

export function configureOperationalPersistence(adapter: OperationalPersistenceAdapter): void {
  activeAdapter = adapter;
  storeRefs.workLoop = createWorkLoopStore(adapter);
  storeRefs.fleet = createFleetStore(adapter);
  storeRefs.realm = createRealmStore(adapter);
  storeRefs.platformInfra = createPlatformInfraStore(adapter);
  storeRefs.executor = createExecutorStore(adapter);
  storeRefs.workPacketLifecycle = createWorkPacketLifecycleStore(adapter);
}

export async function seedOperationalStoresIfEmpty(): Promise<void> {
  if (await activeAdapter.isTableEmpty(OperationalTables.workItems)) {
    await storeRefs.workLoop.resetFromSeed(createDefaultWorkLoopSeed());
  }
  if (await activeAdapter.isTableEmpty(OperationalTables.fleet)) {
    await storeRefs.fleet.resetFromSeed(createDefaultFleetSeed());
  }
  if (await activeAdapter.isTableEmpty(OperationalTables.realms)) {
    await storeRefs.realm.resetFromSeed(createDefaultRealmSeed());
  }
  if (await activeAdapter.isTableEmpty(OperationalTables.platformDecision)) {
    await storeRefs.platformInfra.resetFromSeed(createDefaultPlatformInfraSeed());
  }
}

export async function resetOperationalPersistenceForTests(): Promise<void> {
  const adapter = createMemoryOperationalAdapter();
  configureOperationalPersistence(adapter);
  await seedOperationalStoresIfEmpty();
}

export type { WorkLoopStore, FleetStore, RealmStore, PlatformInfraStore, ExecutorStore, WorkPacketLifecycleStore };
