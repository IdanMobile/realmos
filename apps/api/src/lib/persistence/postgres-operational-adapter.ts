import type pg from "pg";
import type { OperationalTableName } from "./operational-tables";
import type { OperationalPersistenceAdapter } from "./operational-adapter";

export function createPostgresOperationalAdapter(pool: pg.Pool): OperationalPersistenceAdapter {
  return {
    mode: "postgres",
    async readTable<T>(table: OperationalTableName): Promise<T[]> {
      const result = await pool.query<{ payload: T }>(`SELECT payload FROM ${table}`);
      return result.rows.map((row) => row.payload);
    },
    async readOne<T>(table: OperationalTableName, id: string): Promise<T | null> {
      const result = await pool.query<{ payload: T }>(`SELECT payload FROM ${table} WHERE id = $1`, [id]);
      return result.rows[0]?.payload ?? null;
    },
    async upsertOne<T extends { id: string }>(table: OperationalTableName, value: T): Promise<T> {
      if (table === "operational_next_best_work_decisions") {
        await pool.query(
          `INSERT INTO ${table} (id, payload, created_at) VALUES ($1, $2, NOW())
           ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
          [value.id, value]
        );
      } else {
        await pool.query(
          `INSERT INTO ${table} (id, payload) VALUES ($1, $2)
           ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
          [value.id, value]
        );
      }
      return value;
    },
    async replaceTable<T extends { id: string }>(table: OperationalTableName, values: T[]): Promise<void> {
      await pool.query(`DELETE FROM ${table}`);
      for (const value of values) {
        await this.upsertOne(table, value);
      }
    },
    async appendOne<T extends { id: string }>(table: OperationalTableName, value: T): Promise<T> {
      return this.upsertOne(table, value);
    },
    async isTableEmpty(table: OperationalTableName): Promise<boolean> {
      const result = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ${table}`);
      return Number(result.rows[0]?.count ?? 0) === 0;
    }
  };
}
