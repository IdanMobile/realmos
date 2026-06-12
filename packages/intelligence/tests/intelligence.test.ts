import { describe, expect, it } from "vitest";
import type { Memory } from "@realmos/contracts";
import {
  buildContextPack,
  createKnowledgeVaultConfig,
  createModelRoutingDecision,
  createOptimizationReport,
  planObsidianBridge,
  requiresModelChangeApproval,
  runSystemOptimizer,
  scoutModelForUseCase
} from "../src/index";

describe("@realmos/intelligence", () => {
  it("creates OptimizationReport with approval when recommendations require it", () => {
    const report = createOptimizationReport({
      scope: "global",
      summary: "Test report",
      recommendations: [
        {
          id: "rec_1",
          title: "Switch model",
          recommendationType: "switch_model",
          expectedImpact: "Lower cost",
          requiresApproval: true
        }
      ]
    });

    expect(report.requiresApproval).toBe(true);
    expect(report.recommendations).toHaveLength(1);
  });

  it("creates KnowledgeVaultConfig with safe defaults", () => {
    const config = createKnowledgeVaultConfig({
      provider: "obsidian",
      rootPath: "/Users/test/vault",
      enabled: false
    });

    expect(config.provider).toBe("obsidian");
    expect(config.writeMode).toBe("disabled");
    expect(config.enabled).toBe(false);
  });

  it("builds context pack with token savings", () => {
    const base: Omit<Memory, "id" | "createdAt" | "updatedAt"> = {
      scope: "business",
      scopeId: "memscope_a",
      kind: "knowledge",
      title: "Long memory",
      content: "X".repeat(400),
      source: "manual",
      sensitivity: "normal",
      retention: "keep"
    };
    const memories: Memory[] = [0, 1, 2].map((index) => ({
      ...base,
      id: `memory_${index}`,
      title: `Long memory ${index}`,
      content: String.fromCharCode(65 + index).repeat(400),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const { pack, baselineTokens, savingsTokens } = buildContextPack({
      purpose: "task context",
      memories,
      maxTokens: 200
    });

    expect(pack.tokenEstimate).toBeLessThanOrEqual(200);
    expect(savingsTokens).toBeGreaterThan(0);
    expect(baselineTokens).toBeGreaterThan(pack.tokenEstimate);
  });

  it("requires approval for sensitive cloud model changes", () => {
    expect(
      requiresModelChangeApproval({
        currentProvider: "local_ollama",
        nextProvider: "openai",
        nextCostProfile: "medium",
        sendsSensitiveData: true
      })
    ).toBe(true);
  });

  it("scouts online model for complex use case when allowed", () => {
    const result = scoutModelForUseCase({
      useCase: "complex_reasoning",
      preferLocal: false,
      allowPaid: true
    });

    expect(result.decision.approvalRequired).toBe(true);
    expect(result.selected.provider).toBe("openai");
  });

  it("system optimizer recommends rather than silently changing behavior", () => {
    const report = runSystemOptimizer({
      scope: "global",
      onlineCostUsd: 1.2
    });

    expect(report.recommendations.some((item) => item.recommendationType === "switch_model")).toBe(
      true
    );
    expect(report.requiresApproval).toBe(true);
  });

  it("plans Obsidian bridge as optional and safe by default", () => {
    const config = createKnowledgeVaultConfig({
      provider: "obsidian",
      rootPath: "/vault",
      enabled: false,
      writeMode: "manual"
    });
    const plan = planObsidianBridge(config);

    expect(plan.status).toBe("planned");
    expect(plan.writeEnabled).toBe(true);
    expect(plan.notes.some((note) => /optional/i.test(note))).toBe(true);
  });

  it("creates ModelRoutingDecision records", () => {
    const decision = createModelRoutingDecision({
      useCase: "coding",
      selectedProvider: "openai",
      selectedModel: "gpt-4.1-mini",
      reason: "Best fit",
      approvalRequired: true
    });

    expect(decision.approvalRequired).toBe(true);
    expect(decision.revisitAfterDays).toBe(30);
  });
});
