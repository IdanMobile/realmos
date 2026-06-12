import type { RealmOSRunState } from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";

export type RunStateHandoffStore = {
  listRunStates(): Promise<RealmOSRunState[]>;
  getRunState(id: string): Promise<RealmOSRunState | null>;
  getRunStateByPacketId(packetId: string): Promise<RealmOSRunState | null>;
  createRunState(state: RealmOSRunState): Promise<RealmOSRunState>;
  updateRunState(id: string, patch: Partial<RealmOSRunState>): Promise<RealmOSRunState | null>;
};

export function createRunStateHandoffStore(adapter: OperationalPersistenceAdapter): RunStateHandoffStore {
  return {
    listRunStates: () => adapter.readTable<RealmOSRunState>(OperationalTables.runStateHandoff),
    getRunState: (id) => adapter.readOne<RealmOSRunState>(OperationalTables.runStateHandoff, id),
    async getRunStateByPacketId(packetId) {
      const items = await adapter.readTable<RealmOSRunState>(OperationalTables.runStateHandoff);
      return items.find((item) => item.sourcePacketId === packetId) ?? null;
    },
    createRunState: (state) => adapter.upsertOne(OperationalTables.runStateHandoff, state),
    async updateRunState(id, patch) {
      const current = await adapter.readOne<RealmOSRunState>(OperationalTables.runStateHandoff, id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return adapter.upsertOne(OperationalTables.runStateHandoff, updated);
    }
  };
}
