import { describe, expect, it } from "vitest";
import {
  createDefaultGuingInfrastructurePlan,
  createDefaultPlatformDecision,
  createMockPrototypeInfrastructurePlan,
  createTemporaryPrototypeApproval,
  detectInfrastructureIsolationViolations,
  enrichCursorWorkPacketWithInfrastructureBoundary,
  FIREBASE_BASELINE_CONFIG,
  GITHUB_SOURCE_CONTROL_CONFIG,
  hasBlockingInfrastructureViolations,
  M1_PRO_LOCAL_NODE_CONFIG,
  OLLAMA_LOCAL_LLM_CONFIG,
  validatePrototypeApprovalInput
} from "../src/index";

describe("@realmos/platform-infra", () => {
  it("locks baseline platform decision and config placeholders", () => {
    const decision = createDefaultPlatformDecision();
    expect(decision.cloudPlatform).toBe("firebase");
    expect(decision.sourceControl).toBe("github");
    expect(decision.localLLMRuntime).toBe("ollama");
    expect(FIREBASE_BASELINE_CONFIG.placeholder).toBe(true);
    expect(M1_PRO_LOCAL_NODE_CONFIG.runtime).toBe("m1_pro_macbook");
    expect(GITHUB_SOURCE_CONTROL_CONFIG.actionsEnabled).toBe(false);
    expect(OLLAMA_LOCAL_LLM_CONFIG.offlineFallback).toBe(true);
  });

  it("passes dedicated project infrastructure plans without violations", () => {
    const plan = createDefaultGuingInfrastructurePlan();
    const violations = detectInfrastructureIsolationViolations(plan);
    expect(violations.length).toBe(0);
  });

  it("detects when project runtime uses RealmOS platform resources", () => {
    const plan = createMockPrototypeInfrastructurePlan();
    const violations = detectInfrastructureIsolationViolations(plan);
    expect(violations.length).toBeGreaterThan(0);
    expect(hasBlockingInfrastructureViolations(violations)).toBe(true);
  });

  it("allows temporary prototype resources when approved", () => {
    const plan = createMockPrototypeInfrastructurePlan();
    const resourceId = plan.appDatabase?.id ?? "";
    const approval = createTemporaryPrototypeApproval({
      realmId: plan.realmId,
      resourceIds: [resourceId],
      reason: "Early GUING mock prototype",
      exitPlan: "Migrate to guing-dedicated-db before beta",
      approvedByUserId: "user_idan"
    });
    const violations = detectInfrastructureIsolationViolations(plan, [approval]);
    expect(violations.length).toBe(0);
  });

  it("validates prototype approval input", () => {
    expect(validatePrototypeApprovalInput({
      realmId: "",
      resourceIds: [],
      reason: "",
      exitPlan: "",
      approvedByUserId: ""
    }).length).toBeGreaterThan(0);
  });

  it("enriches cursor work packets with infrastructure boundary rules", () => {
    const plan = createDefaultGuingInfrastructurePlan();
    const packet = {
      id: "packet_infra",
      workItemId: "work_infra",
      title: "Infra packet",
      status: "ready_for_cursor" as const,
      goal: "Verify infra boundary",
      filesToRead: [],
      filesToModify: [],
      rules: [],
      expectedOutput: [],
      stopAfter: "Verification",
      createdByAgentId: "agent_jarvis",
      createdAt: new Date().toISOString()
    };

    const enriched = enrichCursorWorkPacketWithInfrastructureBoundary({ packet, plan });
    expect(enriched.rules.some((rule) => rule.includes("RealmOS Firebase"))).toBe(true);
    expect(enriched.filesToRead).toContain("PROJECT_INFRASTRUCTURE_ISOLATION.md");
  });
});
