#!/usr/bin/env tsx
import { buildApp } from "../app";
import { loadSeedBundleFromRepo } from "./load-seed";

const { db } = await buildApp();
const bundle = await loadSeedBundleFromRepo();
await db.loadSeed(bundle);

console.log("Seed loaded:", {
  businesses: bundle.businesses.length,
  agents: bundle.agents.length,
  tasks: bundle.tasks.length,
  approvals: bundle.approvals.length
});

process.exit(0);
