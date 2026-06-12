import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = dirname(fileURLToPath(import.meta.url));
const repoRootEnv = resolve(testsDir, "../../../.env");
const helpersRootEnv = resolve(testsDir, "../../../../.env");

function readDatabaseUrlFromFile(filePath: string): string | undefined {
  if (!existsSync(filePath)) return undefined;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^DATABASE_URL=(.*)$/);
    if (!match) continue;
    const raw = match[1].trim();
    return raw.replace(/^["']|["']$/g, "");
  }
  return undefined;
}

/** Load DATABASE_URL from repo root `.env` when not already in the environment. */
export function loadDatabaseUrlFromEnvFile(): string | undefined {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  return readDatabaseUrlFromFile(repoRootEnv) ?? readDatabaseUrlFromFile(helpersRootEnv);
}

export function resolvePostgresSmokeConnectionString(): string | undefined {
  return loadDatabaseUrlFromEnvFile();
}
