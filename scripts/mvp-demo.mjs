#!/usr/bin/env node
/**
 * RealmOS MVP demo — Gate H acceptance flow.
 * Requires API on :4100 (memory or postgres DB).
 */
const baseUrl = process.env.REALMOS_API_BASE_URL ?? "http://localhost:4100";

const DEMO_IDEA =
  "Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.";

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("=== RealmOS MVP Demo ===\n");

  const health = await request("GET", "/api/health");
  const ollama = health.checks.ollama;
  const firebase = health.checks.firebase;
  console.log(
    "Health:",
    health.status,
    "| Ollama:",
    ollama.status,
    "| model:",
    ollama.defaultModel,
    "| fallback:",
    ollama.fallbackActive ? "active" : "inactive"
  );
  console.log(
    "Firebase:",
    firebase.status,
    "| mode:",
    firebase.mode,
    "| project:",
    firebase.projectId ?? "none"
  );
  assert(health.service === "realmos-api", "API health missing service id");

  const created = await request("POST", "/api/jarvis/commands/create-business-from-idea", {
    ideaText: DEMO_IDEA,
    businessName: "Real Time Dating App"
  });

  console.log("\nCreated business:", created.businessName, `(${created.businessId})`);
  assert(created.createdAgentIds?.length >= 1, "Expected default agents");
  assert(created.createdArtifactIds?.length >= 10, "Expected SpecKit artifacts");

  const dashboard = await request("GET", "/api/dashboard");
  assert(
    dashboard.businesses.some((b) => b.name === "Real Time Dating App"),
    "Business not on dashboard"
  );
  assert(dashboard.artifacts.some((a) => a.businessId === created.businessId), "Artifacts missing");

  const invoke = await request("POST", "/api/models/invoke", {
    taskSummary: "Summarize dating app MVP scope",
    prompt: "Summarize the MVP scope in one sentence.",
    complexity: "simple"
  });
  assert(invoke.status === "completed", "Local model invoke should complete");
  console.log("\nModel invoke source:", invoke.source);

  const exportBundle = await request("GET", "/api/export/bundle");
  assert(exportBundle.version === "realmos-export-v1", "Export bundle version mismatch");
  assert(exportBundle.counts.businesses >= 1, "Export missing businesses");

  console.log("\n=== MVP Demo PASSED ===");
  console.log("Gates verified: business creation, agents, SpecKit, dashboard, model invoke, export");
}

main().catch((error) => {
  console.error("\nMVP demo failed:", error.message ?? error);
  process.exit(1);
});
