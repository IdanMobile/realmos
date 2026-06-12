import { describe, expect, it } from "vitest";
import type { Agent } from "@realmos/contracts";
import {
  canAssignTaskToAgent,
  createCreationProposal,
  createDefaultBusinessTeam,
  pauseAgent,
  prepareAgentCreationFromProposal,
  retireAgent,
  validateCustomAgentBlueprint
} from "../src/index";

describe("Necromancer default team", () => {
  it("creates default team from templates", () => {
    const team = createDefaultBusinessTeam("biz_demo", "Demo Business");
    expect(team.agents).toHaveLength(5);
    expect(team.agents.every((agent) => agent.scope === "business")).toBe(true);
    expect(team.agents.every((agent) => agent.businessId === "biz_demo")).toBe(true);
    expect(team.agents.every((agent) => agent.modelProfile.allowLocal)).toBe(true);
    expect(team.agents.every((agent) => agent.limitations.length > 0)).toBe(true);
  });
});

describe("reuse check", () => {
  it("prevents duplicate role creation", () => {
    const existing: Agent[] = [
      {
        id: "agent_ceo",
        name: "Ultron",
        role: "CEO",
        scope: "business",
        businessId: "biz_demo",
        directive: "Lead",
        skills: [],
        limitations: [],
        tools: [],
        memoryAccess: [],
        modelProfile: { defaultModelClass: "local_simple", allowOnline: false, allowLocal: true },
        canCreateAgents: false,
        canExecuteCode: false,
        canSpendMoney: false,
        canContactHumans: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const proposal = createCreationProposal({
      requestedBy: "agent_necromancer",
      businessId: "biz_demo",
      needSummary: "Need a CEO agent for strategy and accountability."
    });

    const result = prepareAgentCreationFromProposal({
      proposal,
      businessId: "biz_demo",
      existingAgents: existing,
      blueprint: {
        name: "Ultron II",
        role: "CEO",
        directive: "Duplicate CEO attempt.",
        skills: ["strategy"],
        limitations: ["No spending"]
      }
    });

    expect(result.status).toBe("reuse");
    if (result.status === "reuse") {
      expect(result.agent.id).toBe("agent_ceo");
    }
  });
});

describe("custom agent proposal limits", () => {
  it("rejects oversized blueprints", () => {
    const validation = validateCustomAgentBlueprint({
      name: "x".repeat(100),
      role: "Helper",
      directive: "Help",
      skills: [],
      limitations: []
    });

    expect(validation.valid).toBe(false);
    if (!validation.valid) {
      expect(validation.errors.length).toBeGreaterThan(0);
    }
  });

  it("rejects non-agent creation proposals", () => {
    const proposal = createCreationProposal({
      requestedBy: "agent_necromancer",
      needSummary: "Validate request schema on every API call."
    });

    const result = prepareAgentCreationFromProposal({
      proposal,
      businessId: "biz_demo",
      existingAgents: [],
      blueprint: {
        name: "Validator",
        role: "Validator",
        directive: "Validate schemas.",
        skills: ["validation"],
        limitations: ["No external access"]
      }
    });

    expect(result.status).toBe("invalid_proposal");
  });
});

describe("governance review before activation", () => {
  it("requires approval for high-permission agents", () => {
    const proposal = createCreationProposal({
      requestedBy: "agent_necromancer",
      businessId: "biz_demo",
      needSummary: "Need a developer agent that can execute code."
    });

    const result = prepareAgentCreationFromProposal({
      proposal,
      businessId: "biz_demo",
      existingAgents: [],
      blueprint: {
        name: "DevBot",
        role: "Developer",
        directive: "Write and execute code.",
        skills: ["coding"],
        limitations: ["Requires approval for deploy"],
        canExecuteCode: true
      }
    });

    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.governance.requiresApproval).toBe(true);
      expect(result.testTask.assignedAgentId).toBe(result.agent.id);
    }
  });
});

describe("agent lifecycle", () => {
  const baseAgent: Agent = {
    id: "agent_test",
    name: "Test",
    role: "QA",
    scope: "business",
    businessId: "biz_demo",
    directive: "Test things",
    skills: [],
    limitations: [],
    tools: [],
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

  it("retired agent cannot receive tasks", () => {
    const retired = retireAgent(baseAgent);
    expect(canAssignTaskToAgent(retired)).toBe(false);
  });

  it("paused agent cannot receive tasks", () => {
    const paused = pauseAgent(baseAgent);
    expect(canAssignTaskToAgent(paused)).toBe(false);
  });

  it("active agent can receive tasks", () => {
    expect(canAssignTaskToAgent(baseAgent)).toBe(true);
  });
});

describe("creator router", () => {
  it("classifies deterministic needs without creating agents blindly", () => {
    const proposal = createCreationProposal({
      requestedBy: "agent_jarvis",
      needSummary: "Validate request schema on every API call."
    });

    expect(proposal.recommendedCreationType).toBe("deterministic_module");
    expect(proposal.proposedOwner).toBe("deterministic_engineer");
  });
});
