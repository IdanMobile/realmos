import type {
  Agent,
  ApprovalRequest,
  AuditEvent,
  ToolRunRequest,
  ToolRunResult
} from "@realmos/contracts";
import {
  createApprovalRequestFromAction,
  createGovernanceAuditEvent,
  evaluateAction
} from "@realmos/governance";
import { executeDryRun, mockExecuteApprovedRequest } from "./dry-run";
import { executeApprovedTerminalCommand, type TerminalExecutionError } from "./terminal-executor";
import { isDangerousTerminalCommand, isForbiddenToolForMvp } from "./forbidden";
import { getToolDefinition } from "./registry";
import {
  agentHasToolPermission,
  classifyToolRunRisk,
  getToolRunnerMode,
  isTerminalExecutionEnabled,
  requiresToolRunApproval
} from "./risk";

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type ToolRunnerStore = {
  getAgent(id: string): Promise<Agent | null>;
  createToolRunRequest(request: ToolRunRequest): Promise<ToolRunRequest>;
  updateToolRunRequest(id: string, patch: Partial<ToolRunRequest>): Promise<ToolRunRequest | null>;
  createToolRunResult(result: ToolRunResult): Promise<ToolRunResult>;
  createApproval(approval: ApprovalRequest): Promise<ApprovalRequest>;
  appendAuditEvent(event: AuditEvent): Promise<AuditEvent>;
};

export type SubmitToolRunInput = {
  kind: ToolRunRequest["kind"];
  tool: ToolRunRequest["tool"];
  title: string;
  payload: Record<string, unknown>;
  agentId?: string;
  businessId?: string;
  forceDryRun?: boolean;
};

export type SubmitToolRunOutcome =
  | { outcome: "blocked"; request: ToolRunRequest; result: ToolRunResult; reason: string }
  | { outcome: "pending_approval"; request: ToolRunRequest; approval: ApprovalRequest }
  | { outcome: "dry_run"; request: ToolRunRequest; result: ToolRunResult }
  | { outcome: "approved_not_executed"; request: ToolRunRequest; result: ToolRunResult };

export async function submitToolRun(
  store: ToolRunnerStore,
  input: SubmitToolRunInput
): Promise<SubmitToolRunOutcome> {
  const timestamp = nowIso();
  const definition = getToolDefinition(input.tool);
  const agent = input.agentId ? await store.getAgent(input.agentId) : null;

  if (!definition || !definition.enabled || !definition.allowedInMvp) {
    return finalizeBlocked(store, input, timestamp, "Tool is disabled or not allowed in MVP.");
  }

  if (isForbiddenToolForMvp(input.tool)) {
    return finalizeBlocked(store, input, timestamp, "Tool is forbidden until Tool Safety Review passes.");
  }

  const requiredAccess = input.kind === "terminal_command" ? "execute" : "write";
  const permission = agentHasToolPermission(agent ?? undefined, input.tool, requiredAccess);
  if (!permission.allowed) {
    return finalizeBlocked(store, input, timestamp, permission.reason ?? "Permission denied.");
  }

  if (input.kind === "terminal_command") {
    const command = String(input.payload.command ?? "");
    if (isDangerousTerminalCommand(command)) {
      return finalizeBlocked(store, input, timestamp, "Dangerous terminal command pattern blocked.");
    }
  }

  const riskLevel = classifyToolRunRisk({
    kind: input.kind,
    tool: input.tool,
    payload: input.payload
  });

  const request = await store.createToolRunRequest({
    id: makeId("tool_req"),
    kind: input.kind,
    tool: input.tool,
    agentId: input.agentId,
    businessId: input.businessId,
    title: input.title,
    payload: input.payload,
    status: "requested",
    riskLevel,
    dryRun: input.forceDryRun ?? definition.dryRunOnly ?? true,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const governance = evaluateAction({
    type: input.kind === "terminal_command" ? "terminal_command" : "other",
    title: input.title,
    description: input.kind === "terminal_command" ? String(input.payload.command ?? "") : undefined,
    payload: input.payload,
    requestedByAgentId: input.agentId,
    businessId: input.businessId
  });

  await store.appendAuditEvent({
    id: makeId("audit"),
    actorType: agent ? "agent" : "user",
    actorId: input.agentId,
    businessId: input.businessId,
    eventType: governance.outcome === "blocked" ? "tool_blocked" : "tool_requested",
    summary: `Tool run requested: ${input.title}`,
    payload: { requestId: request.id, tool: input.tool, kind: input.kind, riskLevel },
    createdAt: timestamp
  });

  if (governance.outcome === "blocked") {
    await store.updateToolRunRequest(request.id, { status: "blocked", updatedAt: nowIso() });
    const result = await store.createToolRunResult({
      id: makeId("tool_res"),
      requestId: request.id,
      status: "blocked",
      error: governance.reason,
      createdAt: nowIso()
    });
    await store.appendAuditEvent({
      id: makeId("audit"),
      actorType: "system",
      businessId: input.businessId,
      eventType: "tool_blocked",
      summary: `Tool run blocked: ${governance.reason}`,
      payload: { requestId: request.id },
      createdAt: nowIso()
    });
    return { outcome: "blocked", request: { ...request, status: "blocked" }, result, reason: governance.reason };
  }

  if (requiresToolRunApproval({ kind: input.kind, tool: input.tool, riskLevel })) {
    const approval = createApprovalRequestFromAction(
      {
        type: input.kind === "terminal_command" ? "terminal_command" : "other",
        title: input.title,
        description:
          input.kind === "terminal_command"
            ? `Terminal command: ${String(input.payload.command ?? "")}`
            : `Tool request: ${input.title}`,
        payload: { requestId: request.id, ...input.payload },
        requestedByAgentId: input.agentId,
        businessId: input.businessId
      },
      governance.outcome === "requires_approval"
        ? governance
        : { outcome: "requires_approval", riskLevel, reason: "Tool policy requires approval." }
    );

    const savedApproval = await store.createApproval(approval);
    const pending = await store.updateToolRunRequest(request.id, {
      status: "pending_approval",
      approvalId: savedApproval.id,
      updatedAt: nowIso()
    });

    await store.appendAuditEvent(
      createGovernanceAuditEvent(
        { outcome: "requires_approval", riskLevel, reason: "Tool run requires approval." },
        { actorType: "system", businessId: input.businessId }
      )
    );

    return {
      outcome: "pending_approval",
      request: pending ?? request,
      approval: savedApproval
    };
  }

  return runDryOrMock(store, request);
}

async function finalizeBlocked(
  store: ToolRunnerStore,
  input: SubmitToolRunInput,
  timestamp: string,
  reason: string
): Promise<SubmitToolRunOutcome> {
  const request = await store.createToolRunRequest({
    id: makeId("tool_req"),
    kind: input.kind,
    tool: input.tool,
    agentId: input.agentId,
    businessId: input.businessId,
    title: input.title,
    payload: input.payload,
    status: "blocked",
    riskLevel: "critical",
    dryRun: true,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const result = await store.createToolRunResult({
    id: makeId("tool_res"),
    requestId: request.id,
    status: "blocked",
    error: reason,
    createdAt: nowIso()
  });

  await store.appendAuditEvent({
    id: makeId("audit"),
    actorType: "system",
    businessId: input.businessId,
    eventType: "tool_blocked",
    summary: `Tool run blocked: ${reason}`,
    payload: { requestId: request.id, tool: input.tool },
    createdAt: nowIso()
  });

  return { outcome: "blocked", request, result, reason };
}

async function runDryOrMock(
  store: ToolRunnerStore,
  request: ToolRunRequest
): Promise<SubmitToolRunOutcome> {
  const mode = getToolRunnerMode();
  const dry = executeDryRun(request);
  const result = await store.createToolRunResult({
    id: makeId("tool_res"),
    requestId: request.id,
    status: dry.status,
    output: dry.output,
    createdAt: nowIso()
  });

  const updated = await store.updateToolRunRequest(request.id, {
    status: "dry_run",
    updatedAt: nowIso()
  });

  await store.appendAuditEvent({
    id: makeId("audit"),
    actorType: "system",
    businessId: request.businessId,
    eventType: "tool_requested",
    summary: `Tool dry-run completed: ${request.title}`,
    payload: { requestId: request.id, resultId: result.id, mode },
    createdAt: nowIso()
  });

  return { outcome: "dry_run", request: updated ?? request, result };
}

export async function attemptApprovedToolRun(
  store: ToolRunnerStore,
  request: ToolRunRequest,
  approval: ApprovalRequest
): Promise<SubmitToolRunOutcome> {
  if (approval.status !== "approved") {
    const result = await store.createToolRunResult({
      id: makeId("tool_res"),
      requestId: request.id,
      status: "blocked",
      error: "Approval is not granted.",
      createdAt: nowIso()
    });
    return {
      outcome: "blocked",
      request,
      result,
      reason: "Approval is not granted."
    };
  }

  if (request.kind === "terminal_command") {
    if (!isTerminalExecutionEnabled()) {
      const mock = mockExecuteApprovedRequest(request);
      const result = await store.createToolRunResult({
        id: makeId("tool_res"),
        requestId: request.id,
        status: mock.status,
        output: mock.output,
        createdAt: nowIso()
      });

      await store.updateToolRunRequest(request.id, {
        status: "approved_not_executed",
        updatedAt: nowIso()
      });

      await store.appendAuditEvent({
        id: makeId("audit"),
        actorType: "system",
        businessId: request.businessId,
        eventType: "tool_blocked",
        summary: "Approved terminal command not executed (terminal disabled in env).",
        payload: { requestId: request.id, approvalId: approval.id },
        createdAt: nowIso()
      });

      return {
        outcome: "approved_not_executed",
        request: { ...request, status: "approved_not_executed" },
        result
      };
    }

    return executeApprovedTerminal(store, request, approval);
  }

  return runDryOrMock(store, request);
}

async function executeApprovedTerminal(
  store: ToolRunnerStore,
  request: ToolRunRequest,
  approval: ApprovalRequest
): Promise<SubmitToolRunOutcome> {
  const command = String(request.payload.command ?? "");
  const cwd = request.payload.cwd ? String(request.payload.cwd) : undefined;

  try {
    const executed = await executeApprovedTerminalCommand({ command, cwd });
    const output = [
      `[executed] ${command}`,
      executed.stdout ? `stdout:\n${executed.stdout}` : "",
      executed.stderr ? `stderr:\n${executed.stderr}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const result = await store.createToolRunResult({
      id: makeId("tool_res"),
      requestId: request.id,
      status: "mock_success",
      output,
      createdAt: nowIso()
    });

    await store.updateToolRunRequest(request.id, {
      status: "completed_mock",
      updatedAt: nowIso()
    });

    await store.appendAuditEvent({
      id: makeId("audit"),
      actorType: "system",
      businessId: request.businessId,
      eventType: "tool_executed",
      summary: `Terminal command executed: ${request.title}`,
      payload: { requestId: request.id, approvalId: approval.id, command, exitCode: executed.exitCode },
      createdAt: nowIso()
    });

    return {
      outcome: "dry_run",
      request: { ...request, status: "completed_mock" },
      result
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : (error as TerminalExecutionError).message || "Terminal execution failed.";
    const details = error as TerminalExecutionError;

    const result = await store.createToolRunResult({
      id: makeId("tool_res"),
      requestId: request.id,
      status: "blocked",
      error: message,
      output: details.stderr || details.stdout,
      createdAt: nowIso()
    });

    await store.appendAuditEvent({
      id: makeId("audit"),
      actorType: "system",
      businessId: request.businessId,
      eventType: "tool_blocked",
      summary: `Terminal command failed: ${message}`,
      payload: { requestId: request.id, approvalId: approval.id, command },
      createdAt: nowIso()
    });

    return { outcome: "blocked", request, result, reason: message };
  }
}
