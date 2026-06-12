import { describe, expect, it } from "vitest";
import type {
  Agent,
  AuditEvent,
  Business,
  Memory,
  Task,
  WorldMap
} from "@realmos/contracts";
import { createBusinessFromIdea } from "../src/business-creation/create-business-from-idea";
import type { BusinessCreationStore } from "../src/business-creation/types";
import { createDefaultBusinessTeam } from "../src/business-creation/default-team";
import { rebuildWorldMap } from "../src/business-creation/world-map";
import {
  handleJarvisChat,
  isRealTimeDatingAppDemoCommand,
  parseJarvisChatMessage,
  REAL_TIME_DATING_APP_DEMO_MESSAGE
} from "../src/index";

function createTestStore(initial?: {
  businesses?: Business[];
  agents?: Agent[];
  worldMap?: WorldMap;
}): BusinessCreationStore {
  const businesses = [...(initial?.businesses ?? [])];
  const agents = [...(initial?.agents ?? [])];
  const tasks: Task[] = [];
  const memories: Memory[] = [];
  const auditEvents: AuditEvent[] = [];
  let worldMap: WorldMap =
    initial?.worldMap ??
    ({
      id: "world_default",
      title: "RealmOS World",
      version: "0.1.0",
      nodes: [
        {
          id: "node_jarvis_hq",
          kind: "jarvis_hq",
          label: "Jarvis HQ",
          status: "active"
        }
      ],
      edges: [],
      updatedAt: new Date().toISOString()
    } satisfies WorldMap);

  return {
    createBusiness: async (business) => {
      businesses.push(structuredClone(business));
      return business;
    },
    updateBusiness: async (id, patch) => {
      const index = businesses.findIndex((item) => item.id === id);
      if (index === -1) return null;
      businesses[index] = { ...businesses[index], ...patch, updatedAt: new Date().toISOString() };
      return businesses[index];
    },
    createAgent: async (agent) => {
      agents.push(structuredClone(agent));
      return agent;
    },
    createTask: async (task) => {
      tasks.push(structuredClone(task));
      return task;
    },
    createMemory: async (memory) => {
      memories.push(structuredClone(memory));
      return memory;
    },
    appendAuditEvent: async (event) => {
      auditEvents.push(structuredClone(event));
      return event;
    },
    listBusinesses: async () => [...businesses],
    listAgents: async () => [...agents],
    getWorldMap: async () => structuredClone(worldMap),
    saveWorldMap: async (nextWorldMap) => {
      worldMap = structuredClone(nextWorldMap);
      return worldMap;
    },
    _snapshot: () => ({ businesses, agents, tasks, memories, auditEvents, worldMap })
  } as BusinessCreationStore & { _snapshot: () => Record<string, unknown> };
}

describe("createBusinessFromIdea", () => {
  it("creates business", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "A real-time dating app with live matching."
    });

    expect(result.business.name).toBe("A Real Time Dating App With Live Matching");
    expect(result.business.status).toBe("planning");
    expect(result.business.ownerUserId).toBe("user_idan");
  });

  it("creates CEO and PM", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    const ceo = result.agents.find((agent) => agent.role === "CEO");
    const pm = result.agents.find((agent) => agent.role === "Product Manager");
    expect(ceo?.name).toBe("Ultron");
    expect(pm?.name).toBe("Paul");
    expect(result.business.ceoAgentId).toBe(ceo?.id);
    expect(pm?.reportsTo).toBe(ceo?.id);
  });

  it("creates default team", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    expect(result.agents).toHaveLength(5);
    expect(result.agents.map((agent) => agent.role)).toEqual([
      "CEO",
      "Product Manager",
      "SpecKit Planner",
      "Research",
      "Risk"
    ]);
  });

  it("creates tasks", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    expect(result.tasks.length).toBeGreaterThanOrEqual(4);
    expect(result.business.taskIds).toHaveLength(result.tasks.length);
    expect(result.tasks.some((task) => task.title.includes("spec outline"))).toBe(true);
  });

  it("writes memory", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    expect(result.memories.some((memory) => memory.kind === "decision")).toBe(true);
    expect(result.memories.some((memory) => memory.scope === "business")).toBe(true);
    expect(result.memories.some((memory) => memory.scope === "global")).toBe(true);
  });

  it("writes audit events", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    expect(result.auditEvents.some((event) => event.eventType === "business_created")).toBe(true);
    expect(result.auditEvents.some((event) => event.eventType === "agent_created")).toBe(true);
    expect(result.auditEvents.some((event) => event.eventType === "task_created")).toBe(true);
    expect(result.auditEvents.some((event) => event.eventType === "memory_written")).toBe(true);
  });

  it("updates world map", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    expect(result.worldMap.nodes.some((node) => node.kind === "jarvis_hq")).toBe(true);
    expect(result.worldMap.nodes.some((node) => node.refId === result.business.id)).toBe(true);
    expect(result.worldMap.nodes.some((node) => node.kind === "agent_desk")).toBe(true);
  });

  it("does not create dangerous permissions", async () => {
    const store = createTestStore();
    const result = await createBusinessFromIdea(store, {
      userId: "user_idan",
      ideaText: "real-time dating app",
      proposedName: "Real Time Dating App"
    });

    for (const agent of result.agents) {
      expect(agent.canCreateAgents).toBe(false);
      expect(agent.canExecuteCode).toBe(false);
      expect(agent.canSpendMoney).toBe(false);
      expect(agent.canContactHumans).toBe(false);
      expect(agent.tools).toEqual([]);
    }
  });
});

describe("default team factory", () => {
  it("always includes safe defaults", () => {
    const team = createDefaultBusinessTeam("biz_test", "Test Business");
    expect(team.agents.every((agent) => agent.scope === "business")).toBe(true);
    expect(team.agents.every((agent) => agent.businessId === "biz_test")).toBe(true);
  });
});

describe("world map rebuild", () => {
  it("preserves Jarvis HQ and adds business nodes", () => {
    const business: Business = {
      id: "biz_demo",
      name: "Demo",
      mission: "Demo mission",
      type: "startup",
      status: "planning",
      ownerUserId: "user_idan",
      agentIds: ["agent_ceo"],
      taskIds: [],
      memoryScopeId: "memscope_demo",
      metrics: [],
      risks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ceoAgentId: "agent_ceo"
    };
    const agents: Agent[] = [
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
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const worldMap = rebuildWorldMap({ businesses: [business], agents });
    expect(worldMap.nodes.some((node) => node.kind === "jarvis_hq")).toBe(true);
    expect(worldMap.nodes.some((node) => node.refId === "biz_demo")).toBe(true);
  });
});

describe("Jarvis chat", () => {
  it("parses create-business demo command", () => {
    const parsed = parseJarvisChatMessage(REAL_TIME_DATING_APP_DEMO_MESSAGE);
    expect(parsed.intent).toBe("create_business_from_idea");
    expect(parsed.proposedName).toBe("Real Time Dating App");
    expect(isRealTimeDatingAppDemoCommand(REAL_TIME_DATING_APP_DEMO_MESSAGE)).toBe(true);
  });

  it("executes business creation from chat", async () => {
    const store = createTestStore();
    const response = await handleJarvisChat(store, {
      message: REAL_TIME_DATING_APP_DEMO_MESSAGE,
      userId: "user_idan"
    });

    expect(response.actions[0]?.type).toBe("business_created");
    expect(response.result?.businessName).toBe("Real Time Dating App");
    expect(response.result?.createdAgentIds.length).toBe(5);
  });
});
