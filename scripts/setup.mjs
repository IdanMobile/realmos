#!/usr/bin/env node
/**
 * First-time setup after cloning from GitHub.
 * Creates .env from .env.example (if missing) and installs dependencies with pnpm.
 */
import { copyFileSync, existsSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");
const envExample = join(root, ".env.example");
const npmLock = join(root, "package-lock.json");

if (existsSync(npmLock)) {
  console.warn("Removing package-lock.json — this repo uses pnpm, not npm.");
  rmSync(npmLock);
}

if (!existsSync(envPath)) {
  copyFileSync(envExample, envPath);
  console.log("Created .env from .env.example");
} else {
  console.log(".env already exists — leaving unchanged");
}

console.log("Installing dependencies with pnpm…");
execSync("pnpm install", { cwd: root, stdio: "inherit" });

console.log("\nSetup complete. Next steps:");
console.log("  pnpm dev");
console.log("  Open http://localhost:3000 (API on http://localhost:4100)");
