import type { OperationalTableName } from "./operational-tables";
import type { OperationalPersistenceAdapter } from "./operational-adapter";

export function createMemoryOperationalAdapter(): OperationalPersistenceAdapter {
  const tables = new Map<OperationalTableName, Map<string, unknown>>();

  function tableMap(table: OperationalTableName): Map<string, unknown> {
    if (!tables.has(table)) {
      tables.set(table, new Map());
    }
    return tables.get(table)!;
  }

  return {
    mode: "memory",
    async readTable<T>(table: OperationalTableName): Promise<T[]> {
      return [...tableMap(table).values()] as T[];
    },
    async readOne<T>(table: OperationalTableName, id: string): Promise<T | null> {
      return (tableMap(table).get(id) as T | undefined) ?? null;
    },
    async upsertOne<T extends { id: string }>(table: OperationalTableName, value: T): Promise<T> {
      tableMap(table).set(value.id, structuredClone(value));
      return value;
    },
    async replaceTable<T extends { id: string }>(table: OperationalTableName, values: T[]): Promise<void> {
      const map = tableMap(table);
      map.clear();
      for (const value of values) {
        map.set(value.id, structuredClone(value));
      }
    },
    async appendOne<T extends { id: string }>(table: OperationalTableName, value: T): Promise<T> {
      tableMap(table).set(value.id, structuredClone(value));
      return value;
    },
    async isTableEmpty(table: OperationalTableName): Promise<boolean> {
      return tableMap(table).size === 0;
    }
  };
}

/** Test helper: re-instantiation against the same adapter retains data. */
export function createSharedMemoryOperationalAdapter(
  existing?: OperationalPersistenceAdapter
): OperationalPersistenceAdapter {
  if (existing && existing.mode === "memory") {
    return existing;
  }
  return createMemoryOperationalAdapter();
}
