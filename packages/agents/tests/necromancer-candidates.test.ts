import { describe, expect, it } from "vitest";
import type { Agent, Task } from "@realmos/contracts";
import type { WorkPacketLifecycle } from "@realmos/contracts";
import { detectNecromancerCandidates, isSideProjectScope } from "../src/necromancer/candidates";

const now = new Date("2026-06-13T12:00:00.000Z");
const staleUpdatedAt = new Date("2026-05-01T12:00:00.000Z").toISOString();

function baseAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent_test",
    name: "Test Agent",
    role: "QA",
    scope: "business",
    businessId: "biz_demo",
    directive: "Test",
    skills: [],
    limitations: [],
    tools: [],
    memoryAccess: [],
    modelProfile: { defaultModelClass: "local_simple", allowOnline: false, allowLocal: true },
    canCreateAgents: false,
    canExecuteCode: false,
    canSpendMoney: false,
    canContactHumans: false,
    status: "testing",
    createdAt: staleUpdatedAt,
    updatedAt: staleUpdatedAt,
    ...overrides
  };
}

function baseTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task_test",
    businessId: "biz_demo",
    title: "Blocked task",
    goal: "Test",
    status: "blocked",
    priority: "medium",
    requiresApproval: false,
    dependencies: [],
    artifacts: [],
    auditEventIds: [],
    createdAt: staleUpdatedAt,
    updatedAt: staleUpdatedAt,
    ...overrides
  };
}

function basePacket(overrides: Partial<WorkPacketLifecycle> = {}): WorkPacketLifecycle {
  return {
    id: "lifecycle_failed",
    packetId: "packet_failed",
    realmId: "realm_realmos",
    repositoryId: "repo_realmos",
    allowedPaths: ["apps/"],
    forbiddenPaths: [".env"],
    objective: "Failed packet",
    instructions: "Test",
    verificationCommands: ["pnpm test"],
    expectedArtifacts: [],
    approvalRequired: true,
    verificationStatus: "pending",
    handoffRequired: false,
    handoffUpdated: false,
    status: "failed",
    auditEvents: [],
    createdAt: staleUpdatedAt,
    updatedAt: staleUpdatedAt,
    ...overrides
  };
}

describe("Necromancer candidate detection", () => {
  it("detects stale testing agents", () => {
    const candidates = detectNecromancerCandidates({
      agents: [baseAgent()],
      tasks: [],
      workPackets: [],
      now
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.classification).toBe("stale");
    expect(candidates[0]?.recommendedAction).toBe("observe");
  });

  it("detects orphaned tasks assigned to retired agents", () => {
    const retired = baseAgent({ id: "agent_retired", status: "retired", updatedAt: now.toISOString() });
    const task = baseTask({
      status: "todo",
      assignedAgentId: "agent_retired",
      updatedAt: now.toISOString()
    });

    const candidates = detectNecromancerCandidates({
      agents: [retired],
      tasks: [task],
      workPackets: [],
      now
    });

    expect(candidates.some((item) => item.kind === "task" && item.classification === "orphaned")).toBe(true);
  });

  it("detects failed work packets", () => {
    const candidates = detectNecromancerCandidates({
      agents: [],
      tasks: [],
      workPackets: [basePacket()],
      now
    });

    expect(candidates[0]?.kind).toBe("work_packet");
    expect(candidates[0]?.classification).toBe("failed");
  });

  it("flags GUING side-project scope as blocked", () => {
    const candidates = detectNecromancerCandidates({
      agents: [],
      tasks: [],
      workPackets: [basePacket({ realmId: "realm_guing", repositoryId: "repo_binding_guing" })],
      now
    });

    expect(candidates[0]?.sideProjectBlocked).toBe(true);
    expect(candidates[0]?.recommendedAction).toBe("protect");
  });
});

describe("side project scope guard", () => {
  it("blocks GUING realm identifiers", () => {
    expect(isSideProjectScope("realm_guing", "repo_realmos")).toBe(true);
    expect(isSideProjectScope("realm_realmos", "repo_realmos")).toBe(false);
  });
});
