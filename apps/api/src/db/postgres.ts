import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

export const MIGRATION_FILES = [
  "001_initial.sql",
  "002_capability_reports.sql",
  "003_communication_ledger.sql",
  "004_artifacts.sql",
  "005_tool_runs.sql",
  "006_operational_state.sql",
  "007_executor_bridge.sql",
  "008_work_packet_lifecycle.sql",
  "009_run_state_handoff.sql",
  "010_verification_evidence.sql",
  "011_necromancer_persistence.sql"
] as const;

export async function runMigrations(connectionString: string): Promise<void> {
  const pool = new pg.Pool({ connectionString });
  const migrationFiles = [...MIGRATION_FILES];

  try {
    for (const fileName of migrationFiles) {
      const sql = await readFile(path.join(migrationsDir, fileName), "utf8");
      await pool.query(sql);
    }
  } finally {
    await pool.end();
  }
}

export function createPgPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}
