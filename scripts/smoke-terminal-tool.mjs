#!/usr/bin/env node
/**
 * End-to-end smoke: submit terminal tool run → approve → print stdout.
 * Requires API on :4100 and REALMOS_ALLOW_TERMINAL=true in API process env.
 */
const baseUrl = process.env.REALMOS_API_BASE_URL ?? "http://localhost:4100";

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

async function main() {
  const registry = await request("GET", "/api/tools/registry");
  console.log("terminalExecutionEnabled:", registry.terminalExecutionEnabled);

  await request("POST", "/api/agents", {
    id: "agent_terminal_smoke",
    name: "Terminal Smoke Agent",
    role: "Developer",
    scope: "business",
    businessId: "biz_test",
    directive: "Smoke test terminal.",
    skills: [],
    limitations: [],
    tools: [{ tool: "terminal", access: "execute", requiresApproval: true, maxRiskLevel: "high" }],
    memoryAccess: [],
    modelProfile: { defaultModelClass: "local_simple", allowOnline: false, allowLocal: true },
    canCreateAgents: false,
    canExecuteCode: false,
    canSpendMoney: false,
    canContactHumans: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).catch(() => {});

  const submit = await request("POST", "/api/tools/runs", {
    kind: "terminal_command",
    tool: "terminal",
    title: "Smoke echo",
    payload: { command: "echo realm_os_terminal_smoke" },
    agentId: "agent_terminal_smoke"
  });

  if (submit.outcome !== "pending_approval") {
    console.log("Submit result:", submit);
    throw new Error("Expected pending_approval");
  }

  const approvals = (await request("GET", "/api/approvals")).items;
  const approval = approvals.find((item) => item.payload?.requestId === submit.request.id);
  if (!approval) throw new Error("Approval not found for tool run");

  const approved = await request("POST", `/api/approvals/${approval.id}/approve`);
  console.log("Approve + execute:", JSON.stringify(approved, null, 2));

  if (!registry.terminalExecutionEnabled) {
    console.log("\nNote: REALMOS_ALLOW_TERMINAL is off — command stayed in dry-run / blocked mode.");
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
