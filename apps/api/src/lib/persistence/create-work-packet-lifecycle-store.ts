import type { WorkPacketLifecycle } from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";

export type WorkPacketLifecycleStore = {
  listWorkPacketLifecycleRecords(): Promise<WorkPacketLifecycle[]>;
  getWorkPacketLifecycleRecord(id: string): Promise<WorkPacketLifecycle | null>;
  createWorkPacketLifecycleRecord(record: WorkPacketLifecycle): Promise<WorkPacketLifecycle>;
  updateWorkPacketLifecycleRecord(
    id: string,
    patch: Partial<WorkPacketLifecycle>
  ): Promise<WorkPacketLifecycle | null>;
};

export function createWorkPacketLifecycleStore(
  adapter: OperationalPersistenceAdapter
): WorkPacketLifecycleStore {
  return {
    listWorkPacketLifecycleRecords: () =>
      adapter.readTable<WorkPacketLifecycle>(OperationalTables.workPacketLifecycle),
    getWorkPacketLifecycleRecord: (id) =>
      adapter.readOne<WorkPacketLifecycle>(OperationalTables.workPacketLifecycle, id),
    createWorkPacketLifecycleRecord: (record) =>
      adapter.upsertOne(OperationalTables.workPacketLifecycle, record),
    async updateWorkPacketLifecycleRecord(id, patch) {
      const current = await adapter.readOne<WorkPacketLifecycle>(
        OperationalTables.workPacketLifecycle,
        id
      );
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return adapter.upsertOne(OperationalTables.workPacketLifecycle, updated);
    }
  };
}
