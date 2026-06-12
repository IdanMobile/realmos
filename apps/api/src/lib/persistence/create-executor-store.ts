import type { LocalExecutorDispatch } from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";

export type ExecutorStore = {
  listExecutorDispatches(): Promise<LocalExecutorDispatch[]>;
  getExecutorDispatch(id: string): Promise<LocalExecutorDispatch | null>;
  createExecutorDispatch(dispatch: LocalExecutorDispatch): Promise<LocalExecutorDispatch>;
  updateExecutorDispatch(
    id: string,
    patch: Partial<LocalExecutorDispatch>
  ): Promise<LocalExecutorDispatch | null>;
};

export function createExecutorStore(adapter: OperationalPersistenceAdapter): ExecutorStore {
  return {
    listExecutorDispatches: () =>
      adapter.readTable<LocalExecutorDispatch>(OperationalTables.executorDispatches),
    getExecutorDispatch: (id) =>
      adapter.readOne<LocalExecutorDispatch>(OperationalTables.executorDispatches, id),
    createExecutorDispatch: (dispatch) =>
      adapter.upsertOne(OperationalTables.executorDispatches, dispatch),
    async updateExecutorDispatch(id, patch) {
      const current = await adapter.readOne<LocalExecutorDispatch>(
        OperationalTables.executorDispatches,
        id
      );
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return adapter.upsertOne(OperationalTables.executorDispatches, updated);
    }
  };
}
