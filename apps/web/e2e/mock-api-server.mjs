import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.E2E_MOCK_API_PORT ?? 4199);

const seedPath = join(__dirname, "../../../mock-data/seed.json");
const dashboard = JSON.parse(readFileSync(seedPath, "utf8"));

const E2E_PACKET_ID = "wpl_e2e_smoke";
const E2E_CANDIDATE_ID = "nec_e2e_stale_agent";

const verificationGates = [
  { gateId: "pnpm_test", label: "pnpm test", expectedCommand: "pnpm test", required: true, status: "not_run", evidenceIds: [] },
  { gateId: "pnpm_typecheck", label: "pnpm typecheck", expectedCommand: "pnpm typecheck", required: true, status: "not_run", evidenceIds: [] },
  { gateId: "pnpm_build", label: "pnpm build", expectedCommand: "pnpm build", required: true, status: "not_run", evidenceIds: [] },
  {
    gateId: "pnpm_check_clean_start",
    label: "pnpm check:clean-start",
    expectedCommand: "pnpm check:clean-start",
    required: true,
    status: "not_run",
    evidenceIds: []
  },
  { gateId: "pnpm_demo_mvp", label: "pnpm demo:mvp", expectedCommand: "pnpm demo:mvp", required: false, status: "not_run", evidenceIds: [] },
  {
    gateId: "pnpm_test_postgres",
    label: "pnpm test:postgres",
    expectedCommand: "pnpm test:postgres",
    required: false,
    status: "not_run",
    evidenceIds: []
  },
  {
    gateId: "manual_smoke",
    label: "Manual Command Center smoke",
    expectedCommand: "manual smoke",
    required: false,
    manualOnly: true,
    status: "manual_only",
    evidenceIds: []
  }
];

const lifecyclePacket = {
  id: E2E_PACKET_ID,
  packetId: E2E_PACKET_ID,
  realmId: "realm_realm_os",
  repositoryId: "repo_realm_os",
  allowedPaths: ["apps/web"],
  forbiddenPaths: [".env"],
  objective: "E2E smoke lifecycle packet",
  instructions: "Browser E2E verification only.",
  verificationCommands: ["pnpm test"],
  expectedArtifacts: ["E2E verification notes"],
  approvalRequired: true,
  verificationStatus: "pending",
  handoffRequired: false,
  handoffUpdated: false,
  status: "verification_pending",
  auditEvents: [],
  createdAt: "2026-06-12T00:00:00.000Z",
  updatedAt: "2026-06-12T00:00:00.000Z"
};

/** @type {typeof lifecyclePacket[]} */
let lifecyclePackets = [structuredClone(lifecyclePacket)];
/** @type {Array<{ id: string; status: string; queueArtifactPath?: string }>} */
let executorDispatches = [];
let lifecyclePacketCounter = 1;

function splitLines(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function validateLifecycleInput(body) {
  const errors = [];
  if (!body.realmId?.trim()) errors.push({ field: "realmId", message: "realmId is required." });
  else if (/guing/i.test(body.realmId)) {
    errors.push({
      field: "realmId",
      message: "GUING and side-project realms are blocked until RealmOS self-management milestone."
    });
  }
  if (!body.repositoryId?.trim()) errors.push({ field: "repositoryId", message: "repositoryId is required." });
  if (!body.objective?.trim()) errors.push({ field: "objective", message: "objective is required." });
  if (!body.instructions?.trim()) errors.push({ field: "instructions", message: "instructions is required." });
  if (!splitLines(body.allowedPaths).length) {
    errors.push({ field: "allowedPaths", message: "allowedPaths must include at least one path." });
  }
  if (!splitLines(body.forbiddenPaths).length) {
    errors.push({ field: "forbiddenPaths", message: "forbiddenPaths must include at least one path." });
  }
  if (!splitLines(body.verificationCommands).length) {
    errors.push({ field: "verificationCommands", message: "verificationCommands must include at least one command." });
  }
  return errors;
}

function findLifecyclePacket(id) {
  return lifecyclePackets.find((packet) => packet.id === id) ?? null;
}

function lifecycleSummary() {
  const approvalNeededCount = lifecyclePackets.filter((p) => p.status === "ready_for_approval").length;
  const awaitingResultCount = lifecyclePackets.filter((p) =>
    ["awaiting_result", "dispatched", "in_progress"].includes(p.status)
  ).length;
  const verificationPendingCount = lifecyclePackets.filter((p) => p.status === "verification_pending").length;
  const latest = [...lifecyclePackets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
  return {
    totalCount: lifecyclePackets.length,
    approvalNeededCount,
    dispatchedCount: lifecyclePackets.filter((p) => p.dispatchId).length,
    awaitingResultCount,
    verificationPendingCount,
    latestPacketId: latest?.id ?? null,
    latestPacketStatus: latest?.status ?? null
  };
}

function buildLifecyclePacketFromInput(body) {
  const now = new Date().toISOString();
  const id = `wpl_e2e_create_${lifecyclePacketCounter++}`;
  return {
    id,
    packetId: id,
    sourceWorkItemId: body.sourceWorkItemId,
    realmId: body.realmId.trim(),
    repositoryId: body.repositoryId.trim(),
    branchTarget: body.branchTarget?.trim() || undefined,
    worktreeTarget: body.worktreeTarget?.trim() || undefined,
    allowedPaths: splitLines(body.allowedPaths),
    forbiddenPaths: splitLines(body.forbiddenPaths),
    objective: body.objective.trim(),
    instructions: body.instructions.trim(),
    verificationCommands: splitLines(body.verificationCommands),
    expectedArtifacts: splitLines(body.expectedArtifacts),
    approvalRequired: body.approvalRequired ?? true,
    verificationStatus: "pending",
    handoffRequired: body.handoffRequired ?? false,
    handoffUpdated: false,
    status: "draft",
    auditEvents: [{ eventType: "packet_created", timestamp: now, summary: `Draft created: ${id}` }],
    createdAt: now,
    updatedAt: now
  };
}

const necromancerCandidate = {
  id: E2E_CANDIDATE_ID,
  kind: "agent",
  entityId: "agent_e2e_stale",
  classification: "stale",
  riskLevel: "medium",
  title: "E2E stale agent candidate",
  currentStatus: "idle",
  realmId: "realm_realm_os",
  reason: "No heartbeat for 30 days (E2E fixture).",
  protected: false,
  sideProjectBlocked: false,
  recommendedAction: "pause"
};

const necromancerRecommendation = {
  candidateId: E2E_CANDIDATE_ID,
  summary: "Stale agent suitable for pause after operator review.",
  recommendation: "Pause the agent after explicit operator approval.",
  allowedActions: ["prepare", "pause", "retire", "protect"],
  requiresApproval: true,
  safetyNotes: ["No delete", "No shell", "No Cursor CLI"],
  blockedActions: ["delete", "shell", "cursor_cli"]
};

const actionHistory = [];

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "content-type": "application/json",
    ...CORS_HEADERS
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve({});
      }
    });
  });
}

function healthReport() {
  return {
    status: "ok",
    service: "realmos-api-e2e-mock",
    version: "0.35.0-e2e",
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: "ok", detail: "e2e-mock (no postgres)" },
      ollama: {
        status: "disabled",
        baseUrl: "",
        defaultModel: "stub",
        fallbackActive: true,
        defaultModelAvailable: false,
        models: []
      },
      firebase: {
        status: "not_configured",
        mode: "none",
        projectId: null,
        adminStatus: "not_configured",
        services: { auth: "not_configured", firestore: "not_configured", storage: "not_configured" },
        emulatorHosts: {}
      },
      executor: {
        enabled: true,
        mode: "dry_run",
        queueRoot: "/tmp/realmos-e2e-queue",
        queuedCount: 0,
        dispatchedCount: 0,
        runningCount: 0,
        completedCount: 0,
        failedCount: 0,
        blockedCount: 0,
        lastDispatchId: null,
        lastDispatchStatus: null
      },
      lifecycle: lifecycleSummary(),
      runState: {
        totalCount: 0,
        handoffRequiredCount: 0,
        handoffUpdatedCount: 0,
        latestRunStateId: null,
        latestNextRecommendedInitiative: "0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps"
      },
      terminal: { enabled: false },
      onlineModels: { enabled: false, configured: false }
    }
  };
}

function verificationSummary() {
  return {
    initiativeId: "0.35",
    workPacketId: E2E_PACKET_ID,
    totalCount: 0,
    attachedCount: 0,
    missingRequiredGateIds: ["pnpm_test", "pnpm_typecheck", "pnpm_build", "pnpm_check_clean_start"],
    gates: verificationGates,
    overallStatus: "partial",
    updatedAt: new Date().toISOString()
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  const { pathname } = url;
  const method = req.method ?? "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (pathname === "/api/health" && method === "GET") {
    return jsonResponse(res, 200, healthReport());
  }

  if (pathname === "/api/dashboard" && method === "GET") {
    return jsonResponse(res, 200, dashboard);
  }

  if (pathname === "/api/lifecycle/packets" && method === "GET") {
    return jsonResponse(res, 200, { items: lifecyclePackets });
  }

  if (pathname === "/api/lifecycle/packets" && method === "POST") {
    const body = await readBody(req);
    const errors = validateLifecycleInput(body);
    if (errors.length) {
      return jsonResponse(res, 400, { error: "Validation failed", details: errors });
    }
    const packet = buildLifecyclePacketFromInput(body);
    lifecyclePackets.unshift(packet);
    return jsonResponse(res, 201, packet);
  }

  if (pathname.startsWith("/api/lifecycle/packets/") && method === "POST") {
    const segments = pathname.split("/");
    const packetId = segments[4];
    const action = segments[5];
    const packet = findLifecyclePacket(packetId);
    if (!packet) {
      return jsonResponse(res, 404, { error: "Work packet lifecycle record not found" });
    }

    if (action === "ready") {
      if (!packet.expectedArtifacts?.length) {
        return jsonResponse(res, 400, {
          error: "Readiness validation failed",
          details: [{ field: "expectedArtifacts", message: "expectedArtifacts required" }]
        });
      }
      if (packet.status !== "draft") {
        return jsonResponse(res, 400, { error: "Only draft packets can be marked ready." });
      }
      packet.status = "ready_for_approval";
      packet.updatedAt = new Date().toISOString();
      return jsonResponse(res, 200, packet);
    }

    if (action === "approve") {
      const body = await readBody(req);
      if (!body.approvedBy?.trim()) {
        return jsonResponse(res, 409, {
          error: "Approval failed",
          details: [{ field: "approvedBy", message: "approvedBy is required." }]
        });
      }
      if (packet.status !== "ready_for_approval") {
        return jsonResponse(res, 409, { error: "Approval failed", details: [{ field: "status", message: "not ready" }] });
      }
      packet.status = "approved";
      packet.approvedBy = body.approvedBy.trim();
      packet.approvedAt = new Date().toISOString();
      packet.updatedAt = packet.approvedAt;
      return jsonResponse(res, 200, packet);
    }

    if (action === "dispatch") {
      if (packet.status !== "approved") {
        return jsonResponse(res, 409, { error: "Only approved packets can be dispatched.", status: packet.status });
      }
      const dispatchId = `exec_e2e_${Date.now()}`;
      const queueArtifactPath = `/tmp/realmos-e2e-queue/${dispatchId}/packet.json`;
      const dispatch = { id: dispatchId, status: "dispatched", queueArtifactPath };
      executorDispatches.unshift(dispatch);
      packet.status = "awaiting_result";
      packet.dispatchId = dispatchId;
      packet.updatedAt = new Date().toISOString();
      return jsonResponse(res, 200, { packet, dispatch, artifacts: { packetDir: queueArtifactPath } });
    }
  }

  if (pathname.startsWith("/api/lifecycle/packets/") && method === "GET") {
    const id = pathname.split("/").pop();
    const packet = findLifecyclePacket(id);
    if (!packet) return jsonResponse(res, 404, { error: "Work packet lifecycle record not found" });
    return jsonResponse(res, 200, packet);
  }

  if (pathname === "/api/executor/status" && method === "GET") {
    return jsonResponse(res, 200, {
      enabled: true,
      mode: "dry_run",
      queueRoot: "/tmp/realmos-e2e-queue",
      queuedCount: 0,
      dispatchedCount: 0,
      runningCount: 0,
      completedCount: 0,
      failedCount: 0,
      blockedCount: 0,
      lastDispatch: null
    });
  }

  if (pathname === "/api/executor/dispatches" && method === "GET") {
    return jsonResponse(res, 200, { items: executorDispatches });
  }

  if (pathname === "/api/necromancer/status" && method === "GET") {
    return jsonResponse(res, 200, {
      persistenceMode: "memory",
      durable: false,
      safetyNotice: "No autonomous destructive actions. Approval required for pause/retire/protect.",
      noDeleteEndpoint: true,
      noAutomaticCleanup: true
    });
  }

  if (pathname === "/api/necromancer/candidates" && method === "GET") {
    return jsonResponse(res, 200, {
      items: [necromancerCandidate],
      totalCount: 1,
      protectedCount: 0,
      safetyNotice: "No autonomous destructive actions. Approval required for pause/retire/protect.",
      persistenceMode: "memory",
      durable: false
    });
  }

  if (pathname === `/api/necromancer/candidates/${E2E_CANDIDATE_ID}` && method === "GET") {
    return jsonResponse(res, 200, { candidate: necromancerCandidate, recommendation: necromancerRecommendation });
  }

  if (pathname === `/api/necromancer/candidates/${E2E_CANDIDATE_ID}/prepare` && method === "POST") {
    await readBody(req);
    const record = {
      id: `nec_act_${actionHistory.length + 1}`,
      candidateId: E2E_CANDIDATE_ID,
      action: "prepare",
      operatorId: "operator_preview",
      approved: true,
      outcome: "applied",
      summary: necromancerRecommendation.summary,
      createdAt: new Date().toISOString()
    };
    actionHistory.unshift(record);
    return jsonResponse(res, 200, {
      candidate: necromancerCandidate,
      recommendation: necromancerRecommendation,
      actionRecord: record
    });
  }

  if (
    pathname.startsWith(`/api/necromancer/candidates/${E2E_CANDIDATE_ID}/`) &&
    ["pause", "retire", "protect"].some((action) => pathname.endsWith(`/${action}`)) &&
    method === "POST"
  ) {
    const action = pathname.split("/").pop();
    const body = await readBody(req);
    if (!body.approved || !body.operatorId?.trim()) {
      const record = {
        id: `nec_act_${actionHistory.length + 1}`,
        candidateId: E2E_CANDIDATE_ID,
        action,
        operatorId: body.operatorId ?? "unknown",
        approved: Boolean(body.approved),
        outcome: "blocked",
        summary: "Operator approval and ID are required.",
        createdAt: new Date().toISOString()
      };
      actionHistory.unshift(record);
      return jsonResponse(res, 400, { error: "Operator approval and ID are required." });
    }
    const record = {
      id: `nec_act_${actionHistory.length + 1}`,
      candidateId: E2E_CANDIDATE_ID,
      action,
      operatorId: body.operatorId,
      approved: true,
      outcome: "applied",
      summary: `${action} applied (E2E mock)`,
      evidenceId: body.evidenceId,
      createdAt: new Date().toISOString()
    };
    actionHistory.unshift(record);
    return jsonResponse(res, 200, { candidate: necromancerCandidate, actionRecord: record });
  }

  if (pathname === "/api/necromancer/actions" && method === "GET") {
    return jsonResponse(res, 200, {
      items: actionHistory,
      persistenceMode: "memory",
      durable: false
    });
  }

  if (pathname === "/api/verification/evidence/summary" && method === "GET") {
    return jsonResponse(res, 200, verificationSummary());
  }

  if (pathname === "/api/verification/evidence" && method === "GET") {
    return jsonResponse(res, 200, { items: [] });
  }

  if (pathname === "/api/verification/evidence" && method === "POST") {
    const body = await readBody(req);
    const record = {
      id: `ve_e2e_${Date.now()}`,
      workPacketId: body.workPacketId,
      initiativeId: body.initiativeId ?? "0.35",
      gateId: body.gateId,
      commandName: body.commandName,
      reportedStatus: body.reportedStatus ?? "pass",
      capturedAt: new Date().toISOString(),
      environment: body.environment ?? "local",
      source: "operator",
      artifactRefs: [],
      warnings: [],
      gaps: [],
      redactionApplied: false,
      redactionBlocked: false
    };
    const summary = verificationSummary();
    summary.attachedCount = 1;
    summary.totalCount = 1;
    summary.gates = summary.gates.map((gate) =>
      gate.gateId === body.gateId ? { ...gate, status: "pass_with_evidence", evidenceIds: [record.id] } : gate
    );
    return jsonResponse(res, 200, { record, summary });
  }

  if (pathname === "/api/verification/evidence/ci" && method === "POST") {
    const body = await readBody(req);
    const record = {
      id: `ve_ci_e2e_${Date.now()}`,
      workPacketId: body.workPacketId,
      initiativeId: body.initiativeId ?? "0.35",
      gateId: body.gateId,
      commandName: body.gateId,
      reportedStatus: "pass",
      capturedAt: new Date().toISOString(),
      environment: "ci",
      ciRunUrl: body.ciRunUrl,
      commitSha: body.commitSha,
      source: "ci_manual",
      artifactRefs: [],
      warnings: [],
      gaps: [],
      redactionApplied: false,
      redactionBlocked: false
    };
    return jsonResponse(res, 200, { record, summary: verificationSummary() });
  }

  if (pathname === "/api/jarvis/chat" && method === "POST") {
    const body = await readBody(req);
    return jsonResponse(res, 200, {
      mode: "operator",
      reply: `E2E stub reply for: ${body.message ?? ""}`,
      actions: [],
      routing: {
        provider: "ollama",
        source: "stub",
        model: "stub",
        fallbackActive: true,
        executeAllowed: false,
        blocked: false
      }
    });
  }

  jsonResponse(res, 404, { error: `E2E mock API: not found ${method} ${pathname}` });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`E2E mock API listening on http://127.0.0.1:${port}\n`);
});
