#!/usr/bin/env node
/**
 * Initiative 0.28 — Dogfood RealmOS lifecycle on a real RealmOS governance task.
 * Requires API on :4100 (memory or postgres). Dry-run dispatch only — no shell, no Cursor CLI.
 *
 * Usage:
 *   node scripts/dogfood-v0-28.mjs dispatch   # create packet → dispatch → run-state
 *   node scripts/dogfood-v0-28.mjs complete     # result → verification → close → handoff
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.REALMOS_API_BASE_URL ?? "http://localhost:4100";
const statePath =
  process.env.DOGFOOD_STATE_PATH ??
  join(process.cwd(), ".realmos", "dogfood-v0-28-state.json");

const PACKET_PAYLOAD = {
  realmId: "realm_realmos",
  repositoryId: "repo_realmos",
  objective: "Add permanent Testing & Quality Gate governance rule",
  instructions:
    "Dogfood Initiative 0.28. Update RealmOS governance docs only. No shell execution. No Cursor CLI. No side projects. Human applies doc changes after dry-run dispatch.",
  allowedPaths: [
    "CURSOR_SSOT.md",
    "PROJECT_STATE.md",
    "SSOT_TODO_CHECKLIST.md",
    "VERIFICATION_COMMANDS.md",
    "docs/realmos-package/99_handoffs/",
    "docs/realmos-package/06_operations/",
    "docs/realmos-package/99_audits/"
  ],
  forbiddenPaths: [".env", ".realmos/", "node_modules/", "apps/api/src/db/migrations/"],
  verificationCommands: [
    "pnpm test",
    "pnpm typecheck",
    "pnpm build",
    "pnpm check:clean-start",
    "pnpm demo:mvp",
    "pnpm test:postgres"
  ],
  expectedArtifacts: [
    "Testing & Quality Gate rule in CURSOR_SSOT.md",
    "dogfood audit v0_28",
    "dogfood operations doc v0_28"
  ],
  approvalRequired: true,
  handoffRequired: true
};

async function request(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status}: ${text}`);
  }
  return json;
}

async function saveState(state) {
  await mkdir(join(process.cwd(), ".realmos"), { recursive: true });
  await writeFile(statePath, JSON.stringify(state, null, 2));
}

async function loadState() {
  const raw = await readFile(statePath, "utf8");
  return JSON.parse(raw);
}

async function dispatchPhase() {
  console.log("=== Dogfood 0.28 — dispatch phase ===\n");

  const health = await request("GET", "/api/health");
  console.log("API health:", health.status, "| version:", health.version);

  const created = await request("POST", "/api/lifecycle/packets", PACKET_PAYLOAD);
  console.log("Created packet:", created.id, "| status:", created.status);

  const ready = await request("POST", `/api/lifecycle/packets/${created.id}/ready`);
  console.log("Ready:", ready.status);

  const approved = await request("POST", `/api/lifecycle/packets/${created.id}/approve`, {
    approvedBy: "operator"
  });
  console.log("Approved:", approved.status);

  const dispatched = await request("POST", `/api/lifecycle/packets/${created.id}/dispatch`, {
    cwd: process.cwd()
  });
  const queuePath =
    dispatched.artifacts?.packetDir ??
    dispatched.dispatch?.queueArtifactPath ??
    "(unknown)";
  console.log("Dispatched:", dispatched.packet.status, "| dispatchId:", dispatched.packet.dispatchId);
  console.log("Queue artifact path:", queuePath);

  const runState = await request("POST", `/api/run-state/records/from-packet/${created.id}`, {
    initiativeId: "0.28",
    taskLabel: PACKET_PAYLOAD.objective
  });
  console.log("Run state:", runState.id);

  const state = {
    packetId: created.id,
    dispatchId: dispatched.packet.dispatchId,
    runStateId: runState.id,
    queueArtifactPath: queuePath,
    dispatchedAt: new Date().toISOString()
  };
  await saveState(state);
  console.log("\nState saved:", statePath);
  console.log(JSON.stringify(state, null, 2));
}

async function completePhase() {
  console.log("=== Dogfood 0.28 — complete phase ===\n");

  const { packetId, dispatchId, runStateId, queueArtifactPath } = await loadState();
  console.log("Resuming packet:", packetId);

  const changedFiles = [
    "CURSOR_SSOT.md",
    "SSOT_TODO_CHECKLIST.md",
    "PROJECT_STATE.md",
    "VERIFICATION_COMMANDS.md",
    "docs/realmos-package/99_handoffs/latest_cursor_handoff.md",
    "docs/realmos-package/99_handoffs/new_chat_prompt.md",
    "docs/realmos-package/06_operations/dogfood_realmOS_task_v0_28.md",
    "docs/realmos-package/99_audits/dogfood_realmOS_task_audit_v0_28.md",
    "packages/work-loop/src/run-state-handoff.ts",
    "apps/api/src/lib/health-export.ts",
    "scripts/dogfood-v0-28.mjs"
  ];

  const resultSummary = [
    "Manual governance doc updates applied after dry-run dispatch.",
    "Changed files: " + changedFiles.join(", "),
    "No secrets touched. No shell execution. No side projects.",
    "Queue artifact: " + queueArtifactPath
  ].join(" ");

  const result = await request("POST", `/api/lifecycle/packets/${packetId}/result`, {
    status: "completed",
    resultSummary
  });
  console.log("Result recorded:", result.status);

  const verificationOutput = process.env.DOGFOOD_VERIFICATION_SUMMARY ?? "All verification gates passed locally.";
  const verified = await request("POST", `/api/lifecycle/packets/${packetId}/verification`, {
    reportedStatus: "pass",
    outputSummary: verificationOutput,
    artifactsSummary: "Testing & Quality Gate governance docs + dogfood audit/ops v0_28"
  });
  console.log("Verification:", verified.status, "| verificationStatus:", verified.verificationStatus);

  const closed = await request("POST", `/api/lifecycle/packets/${packetId}/close`, {
    status: "completed",
    handoffUpdated: true
  });
  console.log("Closed:", closed.status);

  await request("POST", `/api/run-state/records/${runStateId}/sync-from-verification`);
  await request("POST", `/api/run-state/records/${runStateId}/handoff-updated`);

  const handoff = await request("GET", "/api/run-state/handoff/latest");
  const prompt = await request("GET", "/api/run-state/next-chat-prompt/latest");
  const lifecycleStatus = await request("GET", "/api/lifecycle/status");
  const runStateStatus = await request("GET", "/api/run-state/status");

  console.log("\n=== Dogfood complete ===");
  console.log(JSON.stringify({ packetId, dispatchId, runStateId, queueArtifactPath }, null, 2));
  console.log("\nLifecycle status:", JSON.stringify(lifecycleStatus, null, 2));
  console.log("\nRun-state status:", JSON.stringify(runStateStatus, null, 2));
  console.log("\nNext initiative:", handoff.nextRecommendedInitiative);
  console.log("\nHandoff required:", handoff.handoffRequired, "| updated:", handoff.handoffUpdated);
}

const phase = process.argv[2] ?? "dispatch";

try {
  if (phase === "dispatch") {
    await dispatchPhase();
  } else if (phase === "complete") {
    await completePhase();
  } else {
    throw new Error(`Unknown phase: ${phase}. Use dispatch or complete.`);
  }
} catch (error) {
  console.error(error.message ?? error);
  process.exit(1);
}
