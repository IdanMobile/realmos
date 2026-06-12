import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SeedBundle } from "../db/types";

const apiRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export async function loadSeedBundleFromRepo(): Promise<SeedBundle> {
  const repoRoot = path.resolve(apiRoot, "../../..");
  const [seedRaw, worldRaw] = await Promise.all([
    readFile(path.join(repoRoot, "mock-data/seed.json"), "utf8"),
    readFile(path.join(repoRoot, "mock-data/world-map.sample.json"), "utf8")
  ]);

  const seed = JSON.parse(seedRaw) as Omit<SeedBundle, "worldMap">;
  const worldMap = JSON.parse(worldRaw) as SeedBundle["worldMap"];

  return { ...seed, worldMap, capabilityReports: [], communicationThreads: [], communicationMessages: [], communicationDecisions: [], communicationArchives: [], artifacts: [], toolRunRequests: [], toolRunResults: [] };
}
