import { describe, expect, it } from "vitest";
import {
  createMockAgent,
  createMockApprovalRequest,
  createMockArtifact,
  createMockAuditEvent,
  createMockBudget,
  createMockBusiness,
  createMockCostEntry,
  createMockMemory,
  createMockRun,
  createMockTask,
  createMockWorldMap,
  createMockWorldNode
} from "./index";

describe("mock business factory", () => {
  it("creates a valid default Business shape", () => {
    const business = createMockBusiness();

    expect(business.id).toBeTruthy();
    expect(business.name).toBeTruthy();
    expect(business.mission).toBeTruthy();
    expect(business.type).toBe("software_project");
    expect(business.status).toBe("idea");
    expect(business.agentIds).toEqual([]);
    expect(business.taskIds).toEqual([]);
    expect(business.metrics).toEqual([]);
    expect(business.risks).toEqual([]);
    expect(business.createdAt).toBeTruthy();
    expect(business.updatedAt).toBeTruthy();
  });
});

describe("mock agent factory", () => {
  it("creates a default agent with no dangerous permissions", () => {
    const agent = createMockAgent();

    expect(agent.canCreateAgents).toBe(false);
    expect(agent.canExecuteCode).toBe(false);
    expect(agent.canSpendMoney).toBe(false);
    expect(agent.canContactHumans).toBe(false);
    expect(agent.status).toBe("draft");
    expect(agent.tools.every((tool) => tool.requiresApproval)).toBe(true);
  });
});

describe("mock approval factory", () => {
  it("supports subscription approval requests", () => {
    const approval = createMockApprovalRequest({ actionType: "create_subscription" });

    expect(approval.actionType).toBe("create_subscription");
    expect(approval.status).toBe("pending");
    expect(approval.title).toBeTruthy();
  });
});

describe("mock memory factory", () => {
  it("requires explicit scope and scopeId", () => {
    expect(() => createMockMemory("" as never, "")).toThrow(/scope/i);

    const memory = createMockMemory("business", "memory_scope_test");

    expect(memory.scope).toBe("business");
    expect(memory.scopeId).toBe("memory_scope_test");
  });
});

describe("mock world node factory", () => {
  it("accepts valid ref types only", () => {
    const node = createMockWorldNode({
      refType: "agent",
      refId: "agent_test"
    });

    expect(node.refType).toBe("agent");
    expect(node.refId).toBe("agent_test");
  });

  it("rejects invalid ref types", () => {
    expect(() =>
      createMockWorldNode({
        refType: "invalid" as "business",
        refId: "bad_ref"
      })
    ).toThrow(/refType/i);
  });
});

describe("supporting mock factories", () => {
  it("creates task, run, audit, budget, cost, artifact, and world map defaults", () => {
    const task = createMockTask();
    const run = createMockRun();
    const audit = createMockAuditEvent();
    const budget = createMockBudget();
    const cost = createMockCostEntry();
    const artifact = createMockArtifact();
    const world = createMockWorldMap();

    expect(task.status).toBe("todo");
    expect(run.status).toBe("queued");
    expect(audit.eventType).toBeTruthy();
    expect(budget.scope).toBe("global");
    expect(cost.amount).toBe(0);
    expect(artifact.kind).toBe("spec");
    expect(world.nodes).toEqual([]);
  });
});
