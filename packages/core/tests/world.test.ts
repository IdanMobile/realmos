import { describe, expect, it } from "vitest";
import { generateWorldMap, WORLD_MAP_VISUAL_AGENT } from "../src/world/generate-world-map";

describe("world map generation", () => {
  const business = {
    id: "biz_world",
    name: "World Co",
    mission: "Test",
    type: "startup" as const,
    status: "planning" as const,
    ownerUserId: "user_1",
    agentIds: [],
    taskIds: [],
    memoryScopeId: "memscope_world",
    metrics: [],
    risks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const agent = {
    id: "agent_world",
    name: "Scout",
    role: "Research",
    scope: "business" as const,
    businessId: "biz_world",
    directive: "Explore.",
    skills: [],
    limitations: [],
    tools: [],
    memoryAccess: [],
    modelProfile: { defaultModelClass: "local_simple" as const, allowOnline: false, allowLocal: true },
    canCreateAgents: false,
    canExecuteCode: false,
    canSpendMoney: false,
    canContactHumans: false,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const task = {
    id: "task_world",
    businessId: "biz_world",
    title: "Validate market",
    description: "Research",
    goal: "Validate market fit",
    status: "running" as const,
    priority: "medium" as const,
    requiresApproval: false,
    dependencies: [],
    artifacts: [],
    auditEventIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it("contains Jarvis HQ node", () => {
    const map = generateWorldMap({ businesses: [], agents: [] });
    expect(map.nodes.some((node) => node.kind === "jarvis_hq")).toBe(true);
  });

  it("generates business land nodes", () => {
    const map = generateWorldMap({ businesses: [business], agents: [] });
    expect(map.nodes.some((node) => node.kind === "business_land" && node.refId === "biz_world")).toBe(
      true
    );
  });

  it("generates office and agent desk nodes", () => {
    const map = generateWorldMap({ businesses: [business], agents: [agent] });
    expect(map.nodes.some((node) => node.kind === "office")).toBe(true);
    expect(map.nodes.some((node) => node.kind === "room")).toBe(true);
    expect(map.nodes.some((node) => node.kind === "agent_desk" && node.refId === "agent_world")).toBe(
      true
    );
  });

  it("generates task status markers", () => {
    const map = generateWorldMap({ businesses: [business], agents: [agent], tasks: [task] });
    expect(map.nodes.some((node) => node.kind === "task_marker" && node.refId === "task_world")).toBe(
      true
    );
  });

  it("reserves future character fields without enabling characters", () => {
    const map = generateWorldMap({ businesses: [business], agents: [agent] });
    const desk = map.nodes.find((node) => node.kind === "agent_desk");
    expect(desk?.characterAvatarId).toBeTruthy();
    expect(desk?.characterEnabled).toBe(false);
  });

  it("exposes world map visual agent placeholder", () => {
    expect(WORLD_MAP_VISUAL_AGENT.status).toBe("planned");
  });
});
