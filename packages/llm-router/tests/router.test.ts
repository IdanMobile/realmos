import { afterEach, describe, expect, it, vi } from "vitest";
import type { Budget, CostEntry } from "@realmos/contracts";
import {
  DEFAULT_MODEL_PROFILE,
  OnlineModelBlockedError,
  ONLINE_CAPABLE_MODEL_PROFILE,
  invokeLocalModelStub,
  invokeOnlineModelStub,
  invokeRoutedModel,
  normalizeModelProfile,
  routeAndLogCost,
  routeModelRequest,
  type CostLoggerStore
} from "../src/index";

function createCostStore(): CostLoggerStore & { entries: CostEntry[] } {
  const entries: CostEntry[] = [];
  const budgets: Budget[] = [
    {
      id: "budget_global",
      scope: "global",
      scopeId: "global",
      monthlyLimit: 100,
      currency: "USD",
      requiresApprovalAbove: 0.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return {
    entries,
    listBudgets: async () => budgets,
    listCostEntries: async () => entries,
    createCostEntry: async (entry) => {
      entries.push(entry);
      return entry;
    }
  };
}

describe("@realmos/llm-router", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects local model for simple tasks", () => {
    const decision = routeModelRequest({
      taskSummary: "Summarize this status update",
      modelProfile: ONLINE_CAPABLE_MODEL_PROFILE,
      complexity: "simple"
    });

    expect(decision.provider).toBe("local");
    expect(decision.modelClass).toBe("local_simple");
  });

  it("selects online model for complex tasks when allowed", () => {
    const decision = routeModelRequest({
      taskSummary: "Design architecture",
      modelProfile: ONLINE_CAPABLE_MODEL_PROFILE,
      complexity: "complex",
      estimatedTokens: 2000
    });

    expect(decision.provider).toBe("online");
    expect(decision.modelClass).toBe("online_reasoning");
  });

  it("blocks online model when disabled", () => {
    const decision = routeModelRequest({
      taskSummary: "Design architecture",
      modelProfile: DEFAULT_MODEL_PROFILE,
      complexity: "complex"
    });

    expect(decision.provider).toBe("local");
    expect(decision.reason).toMatch(/disabled/i);
  });

  it("requires approval above threshold for online usage", () => {
    const decision = routeModelRequest(
      {
        taskSummary: "Complex reasoning task",
        modelProfile: { ...ONLINE_CAPABLE_MODEL_PROFILE, requiresApprovalAboveCost: 0.001 },
        complexity: "complex",
        estimatedTokens: 5000
      },
      [
        {
          id: "budget_global",
          scope: "global",
          scopeId: "global",
          currency: "USD",
          requiresApprovalAbove: 0.001,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    );

    expect(decision.requiresApproval).toBe(true);
  });

  it("records cost entry when routing without approval", async () => {
    const store = createCostStore();
    const result = await routeAndLogCost(store, {
      taskSummary: "Summarize notes",
      modelProfile: DEFAULT_MODEL_PROFILE,
      complexity: "simple"
    });

    expect(result.costEntry).toBeDefined();
    expect(store.entries).toHaveLength(1);
  });

  it("normalizes model profiles with safe defaults", () => {
    const profile = normalizeModelProfile({ allowOnline: true });
    expect(profile.allowLocal).toBe(true);
    expect(profile.allowOnline).toBe(true);
  });

  it("local provider stub returns output", async () => {
    const result = await invokeLocalModelStub({ model: "ollama/qwen3.5:latest", prompt: "Hello" });
    expect(result.provider).toBe("ollama");
    expect(result.output).toContain("[local-stub]");
    expect(result.source).toBe("stub");
  });

  it("invokeRoutedModel completes local route without approval", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503
      })) as unknown as typeof fetch
    );

    const store = createCostStore();
    const result = await invokeRoutedModel(store, {
      taskSummary: "Summarize notes",
      prompt: "Summarize notes",
      modelProfile: DEFAULT_MODEL_PROFILE,
      complexity: "simple"
    });

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.costEntry).toBeDefined();
      expect(result.source).toBe("stub");
    }
  });

  it("invokeRoutedModel returns pending approval for costly online route", async () => {
    const store = createCostStore();
    const result = await invokeRoutedModel(store, {
      taskSummary: "Complex architecture design",
      prompt: "Design architecture",
      modelProfile: { ...ONLINE_CAPABLE_MODEL_PROFILE, requiresApprovalAboveCost: 0.001 },
      complexity: "complex",
      estimatedTokens: 5000
    });

    expect(result.status).toBe("pending_approval");
  });

  it("online provider stub throws when online disabled", async () => {
    await expect(
      invokeOnlineModelStub({
        model: "openai/gpt-4.1-mini",
        prompt: "Hello",
        allowOnline: false
      })
    ).rejects.toBeInstanceOf(OnlineModelBlockedError);
  });
});
