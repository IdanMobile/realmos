import { describe, expect, it } from "vitest";
import type {
  Agent,
  ApprovalRequest,
  AuditEvent,
  ToolRunRequest,
  ToolRunResult
} from "@realmos/contracts";
import {
  attemptApprovedToolRun,
  isDangerousTerminalCommand,
  isTerminalExecutionEnabled,
  listEnabledMvpTools,
  submitToolRun,
  type ToolRunnerStore
} from "../src/index";

function sampleAgent(tools: Agent["tools"]): Agent {
  return {
    id: "agent_tool_test",
    name: "Tool Tester",
    role: "Developer",
    scope: "business",
    businessId: "biz_test",
    directive: "Test tools safely.",
    skills: [],
    limitations: [],
    tools,
    memoryAccess: [],
    modelProfile: { defaultModelClass: "local_simple", allowOnline: false, allowLocal: true },
    canCreateAgents: false,
    canExecuteCode: false,
    canSpendMoney: false,
    canContactHumans: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function createStore(agent?: Agent): ToolRunnerStore & {
  requests: ToolRunRequest[];
  results: ToolRunResult[];
  approvals: ApprovalRequest[];
  audits: AuditEvent[];
} {
  const state = {
    requests: [] as ToolRunRequest[],
    results: [] as ToolRunResult[],
    approvals: [] as ApprovalRequest[],
    audits: [] as AuditEvent[],
    agent
  };

  return {
    ...state,
    getAgent: async (id) => (state.agent?.id === id ? state.agent : null),
    createToolRunRequest: async (request) => {
      state.requests.push(request);
      return request;
    },
    updateToolRunRequest: async (id, patch) => {
      const index = state.requests.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.requests[index] = { ...state.requests[index], ...patch };
      return state.requests[index];
    },
    createToolRunResult: async (result) => {
      state.results.push(result);
      return result;
    },
    createApproval: async (approval) => {
      state.approvals.push(approval);
      return approval;
    },
    appendAuditEvent: async (event) => {
      state.audits.push(event);
      return event;
    }
  };
}

describe("@realmos/tool-runner", () => {
  it("lists MVP-enabled tools in registry", () => {
    const tools = listEnabledMvpTools();
    expect(tools.some((tool) => tool.tool === "filesystem")).toBe(true);
    expect(tools.some((tool) => tool.tool === "browser")).toBe(false);
  });

  it("blocks tool run when agent lacks permission", async () => {
    const store = createStore(
      sampleAgent([{ tool: "filesystem", access: "read", requiresApproval: false, maxRiskLevel: "low" }])
    );

    const outcome = await submitToolRun(store, {
      kind: "filesystem_draft",
      tool: "filesystem",
      title: "Write draft",
      payload: { path: "draft.md", content: "hello" },
      agentId: "agent_tool_test"
    });

    expect(outcome.outcome).toBe("blocked");
    expect(store.audits.some((event) => event.eventType === "tool_blocked")).toBe(true);
  });

  it("runs filesystem draft as dry-run when permitted", async () => {
    const store = createStore(
      sampleAgent([{ tool: "filesystem", access: "write", requiresApproval: false, maxRiskLevel: "low" }])
    );

    const outcome = await submitToolRun(store, {
      kind: "filesystem_draft",
      tool: "filesystem",
      title: "Write draft",
      payload: { path: "draft.md", content: "hello" },
      agentId: "agent_tool_test"
    });

    expect(outcome.outcome).toBe("dry_run");
    if (outcome.outcome === "dry_run") {
      expect(outcome.result.output).toMatch(/dry-run/i);
    }
    expect(store.audits.some((event) => event.eventType === "tool_requested")).toBe(true);
  });

  it("requires approval for terminal commands", async () => {
    const store = createStore(
      sampleAgent([{ tool: "terminal", access: "execute", requiresApproval: true, maxRiskLevel: "high" }])
    );

    const outcome = await submitToolRun(store, {
      kind: "terminal_command",
      tool: "terminal",
      title: "Run tests",
      payload: { command: "pnpm test" },
      agentId: "agent_tool_test"
    });

    expect(outcome.outcome).toBe("pending_approval");
    if (outcome.outcome === "pending_approval") {
      expect(outcome.approval.actionType).toBe("terminal_command");
    }
  });

  it("blocks dangerous terminal commands", async () => {
    const store = createStore(
      sampleAgent([{ tool: "terminal", access: "execute", requiresApproval: true, maxRiskLevel: "high" }])
    );

    const outcome = await submitToolRun(store, {
      kind: "terminal_command",
      tool: "terminal",
      title: "Danger",
      payload: { command: "rm -rf /" },
      agentId: "agent_tool_test"
    });

    expect(outcome.outcome).toBe("blocked");
    expect(isDangerousTerminalCommand("rm -rf /")).toBe(true);
  });

  it("does not execute terminal commands when env flag disabled", async () => {
    expect(isTerminalExecutionEnabled({})).toBe(false);

    const store = createStore(
      sampleAgent([{ tool: "terminal", access: "execute", requiresApproval: true, maxRiskLevel: "high" }])
    );

    const pending = await submitToolRun(store, {
      kind: "terminal_command",
      tool: "terminal",
      title: "Run tests",
      payload: { command: "pnpm test" },
      agentId: "agent_tool_test"
    });

    expect(pending.outcome).toBe("pending_approval");
    if (pending.outcome !== "pending_approval") return;

    const approval = { ...pending.approval, status: "approved" as const };
    const outcome = await attemptApprovedToolRun(store, pending.request, approval);

    expect(outcome.outcome).toBe("approved_not_executed");
    expect(store.audits.some((event) => event.summary.includes("terminal disabled"))).toBe(true);
  });

  it("creates audit events for tool results", async () => {
    const store = createStore(
      sampleAgent([{ tool: "filesystem", access: "write", requiresApproval: false, maxRiskLevel: "low" }])
    );

    await submitToolRun(store, {
      kind: "filesystem_draft",
      tool: "filesystem",
      title: "Draft spec",
      payload: { path: "spec.md", content: "Spec body" },
      agentId: "agent_tool_test"
    });

    expect(store.results.length).toBe(1);
    expect(store.audits.length).toBeGreaterThan(0);
  });
});
