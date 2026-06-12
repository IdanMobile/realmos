import type { OperationalTableName } from "./operational-tables";

export type OperationalPersistenceAdapter = {
  mode: "memory" | "postgres";
  readTable<T>(table: OperationalTableName): Promise<T[]>;
  readOne<T>(table: OperationalTableName, id: string): Promise<T | null>;
  upsertOne<T extends { id: string }>(table: OperationalTableName, value: T): Promise<T>;
  replaceTable<T extends { id: string }>(table: OperationalTableName, values: T[]): Promise<void>;
  appendOne<T extends { id: string }>(
    table: OperationalTableName,
    value: T,
    extra?: Record<string, unknown>
  ): Promise<T>;
  isTableEmpty(table: OperationalTableName): Promise<boolean>;
};
