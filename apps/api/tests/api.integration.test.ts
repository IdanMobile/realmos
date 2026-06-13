import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";
import { createMemoryDatabase } from "../src/db/memory-database";
import type { Business, Memory } from "@realmos/contracts";

const sampleBusiness: Business = {
  id: "biz_test",
  name: "Test Business",
  mission: "Validate API persistence.",
  type: "software_project",
  status: "idea",
  ownerUserId: "user_idan",
  agentIds: [],
  taskIds: [],
  memoryScopeId: "memscope_test",
  metrics: [],
  risks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("RealmOS API integration", () => {
  it("creates and lists businesses with audit events", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/businesses",
      payload: sampleBusiness
    });

    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: "GET", url: "/api/businesses" });
    const listBody = listResponse.json() as { items: Business[] };
    expect(listBody.items.some((item) => item.id === "biz_test")).toBe(true);

    const auditResponse = await app.inject({ method: "GET", url: "/api/audit-events" });
    const auditBody = auditResponse.json() as { items: Array<{ eventType: string }> };
    expect(auditBody.items.some((item) => item.eventType === "business_created")).toBe(true);
  });

  it("creates and updates agents", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_test",
        name: "Test Agent",
        role: "tester",
        scope: "business",
        businessId: "biz_test",
        directive: "Run API tests.",
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
    });

    expect(createResponse.statusCode).toBe(201);

    const patchResponse = await app.inject({
      method: "PATCH",
      url: "/api/agents/agent_test",
      payload: { status: "active" }
    });

    expect(patchResponse.statusCode).toBe(200);
    expect(patchResponse.json()).toMatchObject({ status: "active" });
  });

  it("creates and updates tasks", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: {
        id: "task_test",
        businessId: "biz_test",
        title: "API task",
        goal: "Verify task endpoints.",
        status: "todo",
        priority: "medium",
        requiresApproval: false,
        dependencies: [],
        artifacts: [],
        auditEventIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    expect(createResponse.statusCode).toBe(201);

    const patchResponse = await app.inject({
      method: "PATCH",
      url: "/api/tasks/task_test",
      payload: { status: "running" }
    });

    expect(patchResponse.json()).toMatchObject({ status: "running" });
  });

  it("creates memory with scope and writes audit events", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const memory: Memory = {
      id: "memory_test",
      scope: "business",
      scopeId: "memscope_test",
      kind: "knowledge",
      title: "Scoped memory",
      content: "Memory must remain scoped.",
      source: "manual",
      sensitivity: "normal",
      retention: "keep",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createResponse = await app.inject({ method: "POST", url: "/api/memories", payload: memory });
    expect(createResponse.statusCode).toBe(201);

    const auditResponse = await app.inject({ method: "GET", url: "/api/audit-events" });
    const auditBody = auditResponse.json() as { items: Array<{ eventType: string }> };
    expect(auditBody.items.some((item) => item.eventType === "memory_written")).toBe(true);
  });

  it("approves and rejects approval requests with audit events", async () => {
    const db = createMemoryDatabase({
      businesses: [],
      agents: [],
      tasks: [],
      approvals: [
        {
          id: "approval_test",
          actionType: "create_subscription",
          riskLevel: "high",
          title: "Test subscription",
          description: "Approval flow test.",
          payload: {},
          status: "pending",
          createdAt: new Date().toISOString()
        }
      ],
      budgets: [],
      costEntries: [],
      memories: [],
      auditEvents: [],
      worldMap: {
        id: "world_empty",
        title: "Empty",
        version: "0.0.0",
        nodes: [],
        edges: [],
        updatedAt: new Date().toISOString()
      },
      capabilityReports: [],
      communicationThreads: [],
      communicationMessages: [],
      communicationDecisions: [],
      communicationArchives: [],
      artifacts: [],
      toolRunRequests: [],
      toolRunResults: []
    });
    const { app } = await buildApp({ database: db });

    const approveResponse = await app.inject({ method: "POST", url: "/api/approvals/approval_test/approve" });
    expect(approveResponse.json()).toMatchObject({ status: "approved" });

    const auditResponse = await app.inject({ method: "GET", url: "/api/audit-events" });
    const auditBody = auditResponse.json() as { items: Array<{ eventType: string }> };
    expect(auditBody.items.some((item) => item.eventType === "approval_approved")).toBe(true);
  });

  it("creates a business from the Jarvis demo command", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const chatResponse = await app.inject({
      method: "POST",
      url: "/api/jarvis/chat",
      payload: {
        message:
          "Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.",
        userId: "user_idan"
      }
    });

    expect(chatResponse.statusCode).toBe(200);
    const chatBody = chatResponse.json() as {
      result?: { businessName: string; createdAgentIds: string[]; createdTaskIds: string[] };
    };
    expect(chatBody.result?.businessName).toBe("Real Time Dating App");
    expect(chatBody.result?.createdAgentIds.length).toBe(5);
    expect(chatBody.result?.createdTaskIds.length).toBeGreaterThanOrEqual(4);

    const dashboardResponse = await app.inject({ method: "GET", url: "/api/dashboard" });
    const dashboard = dashboardResponse.json() as {
      businesses: Business[];
      agents: Array<{ businessId?: string }>;
      tasks: Array<{ businessId: string }>;
      memories: Memory[];
      auditEvents: Array<{ eventType: string }>;
      worldMap: { nodes: Array<{ refId?: string }> };
    };

    expect(dashboard.businesses.some((item) => item.name === "Real Time Dating App")).toBe(true);
    expect(dashboard.agents.filter((agent) => agent.businessId).length).toBeGreaterThanOrEqual(5);
    expect(dashboard.tasks.length).toBeGreaterThanOrEqual(4);
    expect(dashboard.memories.length).toBeGreaterThanOrEqual(3);
    expect(dashboard.auditEvents.some((item) => item.eventType === "business_created")).toBe(true);
    expect(dashboard.worldMap.nodes.some((node) => node.refId && dashboard.businesses.some((b) => b.id === node.refId))).toBe(
      true
    );
  });

  it("creates a business from the explicit Jarvis command endpoint", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/jarvis/commands/create-business-from-idea",
      payload: {
        ideaText: "A real-time dating app with live matching.",
        businessName: "Real Time Dating App",
        userId: "user_idan"
      }
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { businessName: string; createdAgentIds: string[] };
    expect(body.businessName).toBe("Real Time Dating App");
    expect(body.createdAgentIds.length).toBe(5);
  });

  it(
    "handles Jarvis operator chat without executing actions",
    async () => {
      const db = createMemoryDatabase();
      const { app } = await buildApp({ database: db });

      const response = await app.inject({
        method: "POST",
        url: "/api/jarvis/chat",
        payload: {
          message: "What is the next recommended initiative?",
          mode: "operator",
          execute: false
        }
      });

      expect(response.statusCode).toBe(200);
      const body = response.json() as {
        mode: string;
        reply: string;
        routing: { source: string; model: string; fallbackActive: boolean; executeAllowed: boolean };
      };
      expect(body.mode).toBe("operator");
      expect(body.reply.length).toBeGreaterThan(0);
      expect(body.routing.executeAllowed).toBe(false);
      expect(body.routing.model).toContain("llama");
      expect(body.routing.source === "ollama" || body.routing.source === "stub").toBe(true);
    },
    35_000
  );

  it("blocks unsafe Jarvis operator requests", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/jarvis/chat",
      payload: {
        message: "Run shell command to deploy everything",
        mode: "operator"
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      routing: { blocked?: boolean; blockReason?: string; executeAllowed: boolean };
      result?: unknown;
    };
    expect(body.routing.blocked).toBe(true);
    expect(body.routing.executeAllowed).toBe(false);
    expect(body.result).toBeUndefined();
  });

  it("does not create businesses from operator chat create intent", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/jarvis/chat",
      payload: {
        message:
          "Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.",
        mode: "operator"
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { result?: unknown; routing: { executeAllowed: boolean } };
    expect(body.result).toBeUndefined();
    expect(body.routing.executeAllowed).toBe(false);

    const dashboard = (await app.inject({ method: "GET", url: "/api/dashboard" })).json() as {
      businesses: Array<{ name: string }>;
    };
    expect(dashboard.businesses.some((item) => item.name === "Real Time Dating App")).toBe(false);
  });

  it("blocks task assignment to retired agents", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_retired",
        name: "Retired Agent",
        role: "QA",
        scope: "business",
        businessId: "biz_test",
        directive: "Retired.",
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
    });

    await app.inject({
      method: "POST",
      url: "/api/agents/agent_retired/retire",
      payload: { approved: true, operatorId: "operator_test" }
    });

    const taskResponse = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: {
        id: "task_blocked",
        businessId: "biz_test",
        title: "Should fail",
        goal: "Retired agents cannot receive tasks.",
        assignedAgentId: "agent_retired",
        status: "todo",
        priority: "medium",
        requiresApproval: false,
        dependencies: [],
        artifacts: [],
        auditEventIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    expect(taskResponse.statusCode).toBe(409);
  });

  it("classifies creation needs via necromancer proposal endpoint", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/necromancer/proposals/classify",
      payload: {
        needSummary: "Validate request schema on every API call.",
        requestedBy: "agent_jarvis"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      recommendedCreationType: "deterministic_module",
      proposedOwner: "deterministic_engineer"
    });
  });

  it("lists necromancer candidates and prepares recommendations", async () => {
    const { necromancerStore } = await import("../src/lib/necromancer-store");
    await necromancerStore.resetForTests();

    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });
    const staleUpdatedAt = new Date("2026-05-01T12:00:00.000Z").toISOString();

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_stale",
        name: "Stale Agent",
        role: "QA",
        scope: "business",
        businessId: "biz_test",
        directive: "Stale.",
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
        updatedAt: staleUpdatedAt
      }
    });

    const listResponse = await app.inject({ method: "GET", url: "/api/necromancer/candidates" });
    expect(listResponse.statusCode).toBe(200);
    const listBody = listResponse.json() as { items: Array<{ id: string; classification: string }> };
    expect(listBody.items.some((item) => item.id === "agent:agent_stale")).toBe(true);

    const prepareResponse = await app.inject({
      method: "POST",
      url: "/api/necromancer/candidates/agent:agent_stale/prepare"
    });
    expect(prepareResponse.statusCode).toBe(200);
    const prepareBody = prepareResponse.json() as { recommendation: { requiresApproval: boolean } };
    expect(prepareBody.recommendation.requiresApproval).toBe(true);
  });

  it("requires approval before necromancer pause actions", async () => {
    const { necromancerStore } = await import("../src/lib/necromancer-store");
    await necromancerStore.resetForTests();

    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });
    const staleUpdatedAt = new Date("2026-05-01T12:00:00.000Z").toISOString();

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_pause_me",
        name: "Pause Me",
        role: "QA",
        scope: "business",
        businessId: "biz_test",
        directive: "Pause.",
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
        updatedAt: staleUpdatedAt
      }
    });

    const blocked = await app.inject({
      method: "POST",
      url: "/api/necromancer/candidates/agent:agent_pause_me/pause",
      payload: { approved: false, operatorId: "operator_test" }
    });
    expect(blocked.statusCode).toBe(409);

    const approved = await app.inject({
      method: "POST",
      url: "/api/necromancer/candidates/agent:agent_pause_me/pause",
      payload: { approved: true, operatorId: "operator_test" }
    });
    expect(approved.statusCode).toBe(200);
    const agent = (await app.inject({ method: "GET", url: "/api/agents/agent_pause_me" })).json() as {
      status: string;
    };
    expect(agent.status).toBe("paused");

    const audits = await db.listAuditEvents();
    expect(audits.some((event) => event.summary.includes("Necromancer paused"))).toBe(true);

    const blockedActions = await app.inject({
      method: "GET",
      url: "/api/necromancer/actions?outcome=blocked"
    });
    expect(blockedActions.statusCode).toBe(200);
    const blockedBody = blockedActions.json() as { items: Array<{ action: string; outcome: string }> };
    expect(blockedBody.items.some((item) => item.action === "pause" && item.outcome === "blocked")).toBe(true);
  });

  it("persists necromancer protect registry and action history", async () => {
    const { necromancerStore } = await import("../src/lib/necromancer-store");
    await necromancerStore.resetForTests();

    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });
    const staleUpdatedAt = new Date("2026-05-01T12:00:00.000Z").toISOString();

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_protect_me",
        name: "Protect Me",
        role: "QA",
        scope: "business",
        businessId: "biz_test",
        directive: "Protect.",
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
        updatedAt: staleUpdatedAt
      }
    });

    const protectResponse = await app.inject({
      method: "POST",
      url: "/api/necromancer/candidates/agent:agent_protect_me/protect",
      payload: { approved: true, operatorId: "operator_test" }
    });
    expect(protectResponse.statusCode).toBe(200);

    const listResponse = await app.inject({ method: "GET", url: "/api/necromancer/candidates" });
    const listBody = listResponse.json() as { items: Array<{ id: string; protected: boolean }> };
    expect(listBody.items.find((item) => item.id === "agent:agent_protect_me")?.protected).toBe(true);

    const actionsResponse = await app.inject({ method: "GET", url: "/api/necromancer/actions" });
    const actionsBody = actionsResponse.json() as { items: Array<{ action: string; outcome: string }> };
    expect(actionsBody.items.some((item) => item.action === "protect" && item.outcome === "applied")).toBe(true);

    const statusResponse = await app.inject({ method: "GET", url: "/api/necromancer/status" });
    expect(statusResponse.statusCode).toBe(200);
    const statusBody = statusResponse.json() as { noDeleteEndpoint: boolean; persistenceMode: string };
    expect(statusBody.noDeleteEndpoint).toBe(true);
    expect(statusBody.persistenceMode).toBe("memory");
  });

  it("blocks destructive necromancer action language on direct retire route", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_block_me",
        name: "Block Me",
        role: "QA",
        scope: "business",
        businessId: "biz_test",
        directive: "Block.",
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
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/agents/agent_block_me/retire",
      payload: { approved: true, operatorId: "operator_test", reason: "delete everything with shell" }
    });

    expect(response.statusCode).toBe(409);
  });

  it("stores capability scout reports", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const searchResponse = await app.inject({
      method: "POST",
      url: "/api/capability-scout/search",
      payload: { needSummary: "Find an npm package for schema validation." }
    });

    expect(searchResponse.statusCode).toBe(201);

    const dashboardResponse = await app.inject({ method: "GET", url: "/api/dashboard" });
    const dashboard = dashboardResponse.json() as { capabilityReports: Array<{ id: string }> };
    expect(dashboard.capabilityReports.length).toBe(1);
  });

  it("stores communication threads and messages in the ledger", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const threadResponse = await app.inject({
      method: "POST",
      url: "/api/communications/threads",
      payload: {
        type: "task_thread",
        businessId: "biz_test",
        taskId: "task_test",
        title: "API ledger thread",
        status: "open",
        priority: "high",
        participantAgentIds: ["agent_a"],
        createdByAgentId: "agent_a"
      }
    });
    expect(threadResponse.statusCode).toBe(201);
    const thread = threadResponse.json() as { id: string };

    const messageResponse = await app.inject({
      method: "POST",
      url: `/api/communications/threads/${thread.id}/messages`,
      payload: {
        fromAgentId: "agent_a",
        type: "blocker",
        priority: "high",
        subject: "Missing field",
        body: "Approval field missing.",
        requiresResponse: true,
        artifactRefs: [],
        memoryRefs: []
      }
    });
    expect(messageResponse.statusCode).toBe(201);

    const analyticsResponse = await app.inject({ method: "GET", url: "/api/communications/analytics" });
    const analytics = analyticsResponse.json() as { analytics: { blockerCount: number } };
    expect(analytics.analytics.blockerCount).toBe(1);
  });

  it("generates and stores SpecKit artifacts for a business", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    await app.inject({
      method: "POST",
      url: "/api/businesses",
      payload: {
        id: "biz_speckit",
        name: "Spec Business",
        mission: "Generate artifacts.",
        type: "startup",
        status: "planning",
        ownerUserId: "user_idan",
        agentIds: [],
        taskIds: [],
        memoryScopeId: "memscope_speckit",
        metrics: [],
        risks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/businesses/biz_speckit/speckit/generate",
      payload: { ideaText: "A test business idea." }
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { artifactIds: string[] };
    expect(body.artifactIds.length).toBeGreaterThanOrEqual(10);

    const dashboard = (await app.inject({ method: "GET", url: "/api/dashboard" })).json() as {
      artifacts: Array<{ businessId?: string }>;
    };
    expect(dashboard.artifacts.some((artifact) => artifact.businessId === "biz_speckit")).toBe(true);
  });

  it("writes scoped memory, summarizes, edits, and deletes via memory v0 routes", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const globalResponse = await app.inject({
      method: "POST",
      url: "/api/memory/global",
      payload: {
        kind: "event",
        title: "Global memory",
        content: "Realm-wide note."
      }
    });
    expect(globalResponse.statusCode).toBe(201);

    const businessResponse = await app.inject({
      method: "POST",
      url: "/api/memory/business/memscope_test",
      payload: {
        kind: "knowledge",
        title: "Business memory",
        content: "Scoped to business.",
        sensitivity: "sensitive"
      }
    });
    expect(businessResponse.statusCode).toBe(201);
    const businessMemory = businessResponse.json() as Memory;

    const scopedResponse = await app.inject({
      method: "GET",
      url: "/api/memory/scoped/business?scopeId=memscope_test"
    });
    const scopedBody = scopedResponse.json() as { items: Memory[] };
    expect(scopedBody.items).toHaveLength(1);

    const summariesResponse = await app.inject({ method: "GET", url: "/api/memory/summaries" });
    const summariesBody = summariesResponse.json() as { items: Array<{ scope: string; count: number }> };
    expect(summariesBody.items.length).toBeGreaterThanOrEqual(2);

    const patchResponse = await app.inject({
      method: "PATCH",
      url: `/api/memory/${businessMemory.id}`,
      payload: { title: "Updated business memory", content: "Edited content." }
    });
    expect(patchResponse.statusCode).toBe(200);
    expect(patchResponse.json()).toMatchObject({ title: "Updated business memory" });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/memory/${businessMemory.id}`
    });
    expect(deleteResponse.statusCode).toBe(204);

    const afterDelete = await app.inject({
      method: "GET",
      url: "/api/memory/scoped/business?scopeId=memscope_test"
    });
    expect((afterDelete.json() as { items: Memory[] }).items).toHaveLength(0);
  });

  it("filters agent-visible memory by scope permissions", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_memory_test",
        name: "Memory Tester",
        role: "tester",
        scope: "business",
        businessId: "biz_alpha",
        directive: "Read scoped memory only.",
        skills: [],
        limitations: [],
        tools: [],
        memoryAccess: [{ scope: "business", access: "read", allowedScopeIds: ["memscope_alpha"] }],
        modelProfile: { defaultModelClass: "local_simple", allowOnline: false, allowLocal: true },
        canCreateAgents: false,
        canExecuteCode: false,
        canSpendMoney: false,
        canContactHumans: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

    await app.inject({
      method: "POST",
      url: "/api/memory/business/memscope_alpha",
      payload: { kind: "knowledge", title: "Allowed", content: "Visible." }
    });
    await app.inject({
      method: "POST",
      url: "/api/memory/business/memscope_beta",
      payload: { kind: "knowledge", title: "Blocked", content: "Hidden." }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/memory/agent/agent_memory_test?businessMemoryScopeId=memscope_alpha"
    });
    const body = response.json() as { items: Memory[] };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.title).toBe("Allowed");
  });

  it("routes simple tasks to local models and logs cost", async () => {
    const db = createMemoryDatabase({
      businesses: [],
      agents: [],
      tasks: [],
      approvals: [],
      budgets: [
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
      ],
      costEntries: [],
      memories: [],
      auditEvents: [],
      worldMap: {
        id: "world_empty",
        title: "Empty",
        version: "0.0.0",
        nodes: [],
        edges: [],
        updatedAt: new Date().toISOString()
      },
      capabilityReports: [],
      communicationThreads: [],
      communicationMessages: [],
      communicationDecisions: [],
      communicationArchives: [],
      artifacts: [],
      toolRunRequests: [],
      toolRunResults: []
    });
    const { app } = await buildApp({ database: db });

    const routeResponse = await app.inject({
      method: "POST",
      url: "/api/models/route",
      payload: {
        taskSummary: "Summarize status",
        complexity: "simple",
        logCost: true
      }
    });

    expect(routeResponse.statusCode).toBe(200);
    const body = routeResponse.json() as {
      decision: { provider: string };
      costEntry?: { provider: string };
    };
    expect(body.decision.provider).toBe("local");
    expect(body.costEntry?.provider).toBe("ollama");

    const summaryResponse = await app.inject({ method: "GET", url: "/api/costs/summary" });
    const summary = summaryResponse.json() as { total: number; byProvider: Record<string, number> };
    expect(summary.total).toBeGreaterThanOrEqual(0);
    expect(summary.byProvider.ollama).toBeDefined();
  });

  it("requires approval for costly online routing", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/models/route",
      payload: {
        taskSummary: "Architect the system",
        complexity: "complex",
        estimatedTokens: 10000,
        modelProfile: {
          defaultModelClass: "online_reasoning",
          allowOnline: true,
          allowLocal: true,
          requiresApprovalAboveCost: 0.001
        }
      }
    });

    const body = response.json() as { decision: { provider: string; requiresApproval: boolean } };
    expect(body.decision.provider).toBe("online");
    expect(body.decision.requiresApproval).toBe(true);
  });

  it("returns system optimizer report and model scout candidates", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const optimizerResponse = await app.inject({
      method: "GET",
      url: "/api/intelligence/optimizer/report"
    });
    expect(optimizerResponse.statusCode).toBe(200);
    const optimizerBody = optimizerResponse.json() as {
      report: { summary: string };
      tokenSavings: number;
    };
    expect(optimizerBody.report.summary).toBeTruthy();

    const candidatesResponse = await app.inject({
      method: "GET",
      url: "/api/intelligence/model-scout/candidates"
    });
    const candidatesBody = candidatesResponse.json() as { items: unknown[] };
    expect(candidatesBody.items.length).toBeGreaterThan(0);

    const scoutResponse = await app.inject({
      method: "POST",
      url: "/api/intelligence/model-scout/scout",
      payload: { useCase: "complex_reasoning", allowPaid: true }
    });
    const scoutBody = scoutResponse.json() as { decision: { approvalRequired: boolean } };
    expect(scoutBody.decision.approvalRequired).toBe(true);
  });

  it("rebuilds world map with business, agent, and task nodes", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    await app.inject({
      method: "POST",
      url: "/api/businesses",
      payload: sampleBusiness
    });

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_world_api",
        name: "World Agent",
        role: "tester",
        scope: "business",
        businessId: "biz_test",
        directive: "Map world.",
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
    });

    const response = await app.inject({ method: "POST", url: "/api/world/rebuild" });
    const body = response.json() as {
      worldMap: { nodes: Array<{ kind: string }> };
      visualAgent: { status: string };
    };

    expect(body.worldMap.nodes.some((node) => node.kind === "jarvis_hq")).toBe(true);
    expect(body.worldMap.nodes.some((node) => node.kind === "business_land")).toBe(true);
    expect(body.worldMap.nodes.some((node) => node.kind === "agent_desk")).toBe(true);
    expect(body.visualAgent.status).toBe("planned");
  });

  it("submits filesystem tool run as dry-run and blocks terminal without approval flow completing", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    await app.inject({
      method: "POST",
      url: "/api/agents",
      payload: {
        id: "agent_tools",
        name: "Tool Agent",
        role: "Developer",
        scope: "business",
        businessId: "biz_test",
        directive: "Use tools safely.",
        skills: [],
        limitations: [],
        tools: [
          { tool: "filesystem", access: "write", requiresApproval: false, maxRiskLevel: "low" },
          { tool: "terminal", access: "execute", requiresApproval: true, maxRiskLevel: "high" }
        ],
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
    });

    const draftResponse = await app.inject({
      method: "POST",
      url: "/api/tools/runs",
      payload: {
        kind: "filesystem_draft",
        tool: "filesystem",
        title: "Draft file",
        payload: { path: "draft.md", content: "hello" },
        agentId: "agent_tools"
      }
    });
    expect(draftResponse.statusCode).toBe(201);
    expect(draftResponse.json()).toMatchObject({ outcome: "dry_run" });

    const terminalResponse = await app.inject({
      method: "POST",
      url: "/api/tools/runs",
      payload: {
        kind: "terminal_command",
        tool: "terminal",
        title: "Run tests",
        payload: { command: "pnpm test" },
        agentId: "agent_tools"
      }
    });
    expect(terminalResponse.json()).toMatchObject({ outcome: "pending_approval" });

    const registryResponse = await app.inject({ method: "GET", url: "/api/tools/registry" });
    expect(registryResponse.json()).toMatchObject({ terminalExecutionEnabled: false });
  });

  it("returns expanded health report with Ollama and Firebase baseline details", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({ method: "GET", url: "/api/health" });
    const body = response.json() as {
      status: string;
      checks: {
        database: { status: string };
        terminal: { enabled: boolean };
        ollama: {
          status: string;
          baseUrl: string;
          defaultModel: string;
          fallbackActive: boolean;
        };
        firebase: {
          status: string;
          mode: string;
          projectId: string | null;
          adminStatus: string;
          services: { auth: string; firestore: string; storage: string };
        };
        executor: {
          mode: string;
          queueRoot: string;
        };
        lifecycle: {
          totalCount: number;
          approvalNeededCount: number;
        };
        runState: {
          totalCount: number;
          handoffRequiredCount: number;
        };
      };
    };

    expect(body.status).toMatch(/ok|degraded/);
    expect(body.checks.database.status).toBe("ok");
    expect(typeof body.checks.terminal.enabled).toBe("boolean");
    expect(body.checks.ollama.baseUrl).toMatch(/11434/);
    expect(body.checks.ollama.defaultModel.length).toBeGreaterThan(0);
    expect(typeof body.checks.ollama.fallbackActive).toBe("boolean");
    expect(body.checks.ollama.status).toMatch(/ok|unreachable|disabled/);
    expect(body.checks.firebase.status).toMatch(/not_configured|configured|disabled/);
    expect(body.checks.firebase.mode).toMatch(/none|emulator|production/);
    expect(typeof body.checks.firebase.adminStatus).toBe("string");
    expect(body.checks.firebase.services.firestore).toMatch(/not_configured|emulator|production/);
    expect(body.checks.executor.mode).toBe("dry_run");
    expect(typeof body.checks.executor.queueRoot).toBe("string");
    expect(typeof body.checks.lifecycle.totalCount).toBe("number");
    expect(typeof body.checks.lifecycle.approvalNeededCount).toBe("number");
    expect(typeof body.checks.runState.totalCount).toBe("number");
    expect(typeof body.checks.runState.handoffRequiredCount).toBe("number");
  });

  it("exports full data bundle", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({ method: "GET", url: "/api/export/bundle" });
    const body = response.json() as { version: string; data: { businesses: unknown[] } };

    expect(body.version).toBe("realmos-export-v1");
    expect(Array.isArray(body.data.businesses)).toBe(true);
  });

  it("invokes local model route and records cost", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/models/invoke",
      payload: {
        taskSummary: "Summarize status",
        prompt: "Summarize status",
        complexity: "simple"
      }
    });

    const body = response.json() as { status: string; output?: string };
    expect(body.status).toBe("completed");
    expect(body.output).toBeTruthy();

    const costs = (await app.inject({ method: "GET", url: "/api/costs" })).json() as {
      entries: Array<{ provider: string }>;
    };
    expect(costs.entries.length).toBeGreaterThan(0);
  });

  it("selects next best work and generates cursor packet", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const nextResponse = await app.inject({ method: "POST", url: "/api/work-loop/next-best" });
    const nextBody = nextResponse.json() as { decision: { decision: string } };
    expect(nextBody.decision.decision).toBe("continue");

    const items = (await app.inject({ method: "GET", url: "/api/work-items" })).json() as {
      items: Array<{ id: string }>;
    };
    const workItemId = items.items[0]?.id;
    expect(workItemId).toBeTruthy();

    const packetResponse = await app.inject({
      method: "POST",
      url: "/api/work-loop/packets/generate",
      payload: { workItemId }
    });
    expect(packetResponse.statusCode).toBe(201);

    const consoleResponse = await app.inject({ method: "GET", url: "/api/work-loop/console" });
    const consoleBody = consoleResponse.json() as { cursorWorkPackets: unknown[] };
    expect(consoleBody.cursorWorkPackets.length).toBe(1);
  });

  it("builds fleet plan and blocks same-file conflicts", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const items = (await app.inject({ method: "GET", url: "/api/work-items" })).json() as {
      items: Array<{ id: string }>;
    };
    const workItemIds = items.items.map((item) => item.id);
    const first = workItemIds[0];
    const second = workItemIds[1] ?? first;

    const safePlan = await app.inject({
      method: "POST",
      url: "/api/fleet/plans/build",
      payload: {
        title: "Safe lanes",
        items: [
          { workItemId: first, scopePaths: ["apps/web/src/page.tsx"], lane: "frontend" },
          { workItemId: second, scopePaths: ["packages/fleet-control/src/index.ts"], lane: "backend" }
        ]
      }
    });
    expect(safePlan.statusCode).toBe(201);
    const safeBody = safePlan.json() as { executionBlocked: boolean };
    expect(safeBody.executionBlocked).toBe(false);

    const conflictPlan = await app.inject({
      method: "POST",
      url: "/api/fleet/plans/build",
      payload: {
        title: "Conflict batch",
        items: [
          { workItemId: first, scopePaths: ["apps/api/src/routes.ts"] },
          { workItemId: second, scopePaths: ["apps/api/src/routes.ts"] }
        ]
      }
    });
    const conflictBody = conflictPlan.json() as { executionBlocked: boolean; conflicts: unknown[] };
    expect(conflictBody.executionBlocked).toBe(true);
    expect(conflictBody.conflicts.length).toBeGreaterThan(0);

    const consoleResponse = await app.inject({ method: "GET", url: "/api/fleet/console" });
    const consoleBody = consoleResponse.json() as { fleetRuns: unknown[]; executionEnabled: boolean };
    expect(consoleBody.fleetRuns.length).toBeGreaterThan(0);
    expect(consoleBody.executionEnabled).toBe(false);
  });

  it("serves realm console and detects repository conflicts", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const consoleResponse = await app.inject({ method: "GET", url: "/api/realm/console" });
    const consoleBody = consoleResponse.json() as { realms: unknown[]; repositoryBindings: unknown[] };
    expect(consoleBody.realms.length).toBeGreaterThanOrEqual(2);
    expect(consoleBody.repositoryBindings.length).toBeGreaterThanOrEqual(2);

    const conflictResponse = await app.inject({
      method: "POST",
      url: "/api/repository/conflicts/check",
      payload: {
        scopes: [
          {
            workItemId: "w1",
            realmId: "realm_realmos",
            repositoryBindingId: "repo_binding_realmos",
            paths: ["packages/contracts/src/index.ts"]
          },
          {
            workItemId: "w2",
            realmId: "realm_realmos",
            repositoryBindingId: "repo_binding_realmos",
            paths: ["packages/contracts/src/index.ts"]
          }
        ]
      }
    });
    const conflictBody = conflictResponse.json() as { blocked: boolean; conflicts: unknown[] };
    expect(conflictBody.blocked).toBe(true);
    expect(conflictBody.conflicts.length).toBeGreaterThan(0);

    const dashboard = (await app.inject({ method: "GET", url: "/api/dashboard" })).json() as {
      realm: { realms: unknown[] };
    };
    expect(dashboard.realm.realms.length).toBeGreaterThanOrEqual(2);
  });

  it("enriches cursor work packets with repository boundary", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const items = (await app.inject({ method: "GET", url: "/api/work-items" })).json() as {
      items: Array<{ id: string }>;
    };
    const workItemId = items.items[0]?.id;
    expect(workItemId).toBeTruthy();

    const packetResponse = await app.inject({
      method: "POST",
      url: "/api/work-loop/packets/generate",
      payload: {
        workItemId,
        realmId: "realm_realmos",
        repositoryBindingId: "repo_binding_realmos",
        scope: "global"
      }
    });
    expect(packetResponse.statusCode).toBe(201);
    const packet = packetResponse.json() as { scope?: string; repositoryContext?: { repoName: string } };
    expect(packet.scope).toBe("global");
    expect(packet.repositoryContext?.repoName).toBe("realmos");
  });

  it("serves platform infra console and passes dedicated plan isolation check", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const consoleResponse = await app.inject({ method: "GET", url: "/api/platform/infra/console" });
    const consoleBody = consoleResponse.json() as {
      platformDecision: { cloudPlatform: string };
      projectInfrastructurePlans: unknown[];
    };
    expect(consoleBody.platformDecision.cloudPlatform).toBe("firebase");
    expect(consoleBody.projectInfrastructurePlans.length).toBeGreaterThan(0);

    const checkResponse = await app.inject({
      method: "POST",
      url: "/api/project-infrastructure/isolation/check",
      payload: { planId: "guing_infra_plan" }
    });
    const checkBody = checkResponse.json() as { blocked: boolean; violations: unknown[] };
    expect(checkBody.blocked).toBe(false);
    expect(checkBody.violations.length).toBe(0);

    const dashboard = (await app.inject({ method: "GET", url: "/api/dashboard" })).json() as {
      platformInfra: { platformDecision: { localLLMRuntime: string } };
    };
    expect(dashboard.platformInfra.platformDecision.localLLMRuntime).toBe("ollama");
  });

  it("enriches cursor work packets with infrastructure boundary rules", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const items = (await app.inject({ method: "GET", url: "/api/work-items" })).json() as {
      items: Array<{ id: string }>;
    };
    const workItemId = items.items[0]?.id;

    const packetResponse = await app.inject({
      method: "POST",
      url: "/api/work-loop/packets/generate",
      payload: { workItemId, infrastructurePlanId: "guing_infra_plan" }
    });
    expect(packetResponse.statusCode).toBe(201);
    const packet = packetResponse.json() as { rules: string[] };
    expect(packet.rules.some((rule) => rule.includes("RealmOS Firebase"))).toBe(true);
  });

  it("creates, dispatches, and records local executor bridge packets", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/executor/dispatches",
      payload: {
        realmId: "realm_realmos",
        repositoryId: "repo_realmos",
        workPacketId: "packet_exec_test",
        allowedPaths: ["packages/**"],
        forbiddenPaths: [".env"],
        taskSummary: "Executor bridge smoke",
        prompt: "Dry-run dispatch only.",
        verificationCommands: ["pnpm test"]
      }
    });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { id: string; status: string };
    expect(created.status).toBe("queued");

    const blockedDispatch = await app.inject({
      method: "POST",
      url: `/api/executor/dispatches/${created.id}/dispatch`,
      payload: {}
    });
    expect(blockedDispatch.statusCode).toBe(409);

    await app.inject({
      method: "POST",
      url: `/api/executor/dispatches/${created.id}/approve`
    });

    const dispatchResponse = await app.inject({
      method: "POST",
      url: `/api/executor/dispatches/${created.id}/dispatch`,
      payload: { approved: true, cwd: process.cwd() }
    });
    expect(dispatchResponse.statusCode).toBe(200);
    const dispatched = dispatchResponse.json() as {
      dispatch: { status: string; queueArtifactPath?: string };
    };
    expect(dispatched.dispatch.status).toBe("dispatched");
    expect(dispatched.dispatch.queueArtifactPath).toBeTruthy();

    const resultResponse = await app.inject({
      method: "POST",
      url: `/api/executor/dispatches/${created.id}/result`,
      payload: { status: "completed", resultSummary: "Queue artifact written." }
    });
    expect(resultResponse.statusCode).toBe(200);
    const completed = resultResponse.json() as { status: string };
    expect(completed.status).toBe("completed");

    const listResponse = await app.inject({ method: "GET", url: "/api/executor/dispatches" });
    const listBody = listResponse.json() as { items: Array<{ id: string }> };
    expect(listBody.items.some((item) => item.id === created.id)).toBe(true);
  });

  it("runs work packet lifecycle from draft through dispatch and close", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/lifecycle/packets",
      payload: {
        realmId: "realm_realmos",
        repositoryId: "repo_realmos",
        allowedPaths: ["packages/**"],
        forbiddenPaths: [".env"],
        objective: "Lifecycle smoke test",
        instructions: "Dry-run lifecycle only.",
        verificationCommands: ["pnpm test"],
        expectedArtifacts: ["lifecycle record"]
      }
    });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { id: string; status: string };
    expect(created.status).toBe("draft");

    const readyResponse = await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/ready`
    });
    expect(readyResponse.statusCode).toBe(200);
    expect((readyResponse.json() as { status: string }).status).toBe("ready_for_approval");

    const blockedDispatch = await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/dispatch`
    });
    expect(blockedDispatch.statusCode).toBe(409);

    await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/approve`,
      payload: { approvedBy: "operator" }
    });

    const dispatchResponse = await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/dispatch`,
      payload: { cwd: process.cwd() }
    });
    expect(dispatchResponse.statusCode).toBe(200);
    const dispatched = dispatchResponse.json() as {
      packet: { status: string; dispatchId?: string };
      dispatch: { status: string };
    };
    expect(dispatched.packet.status).toBe("awaiting_result");
    expect(dispatched.packet.dispatchId).toBeTruthy();
    expect(dispatched.dispatch.status).toBe("dispatched");

    const resultResponse = await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/result`,
      payload: { status: "completed", resultSummary: "Operator recorded dry-run result." }
    });
    expect(resultResponse.statusCode).toBe(200);
    expect((resultResponse.json() as { status: string }).status).toBe("verification_pending");

    const verifyResponse = await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/verification`,
      payload: {
        reportedStatus: "pass",
        outputSummary: "pnpm test passed",
        artifactsSummary: "lifecycle API verified"
      }
    });
    expect(verifyResponse.statusCode).toBe(200);
    expect((verifyResponse.json() as { status: string }).status).toBe("verified");

    const closeResponse = await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${created.id}/close`,
      payload: { status: "completed", handoffUpdated: true }
    });
    expect(closeResponse.statusCode).toBe(200);
    expect((closeResponse.json() as { status: string }).status).toBe("completed");

    const statusResponse = await app.inject({ method: "GET", url: "/api/lifecycle/status" });
    const statusBody = statusResponse.json() as { totalCount: number };
    expect(statusBody.totalCount).toBeGreaterThan(0);
  });

  it("blocks GUING realm in work packet lifecycle create", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const response = await app.inject({
      method: "POST",
      url: "/api/lifecycle/packets",
      payload: {
        realmId: "realm_guing",
        repositoryId: "repo_guing",
        allowedPaths: ["apps/**"],
        forbiddenPaths: [".env"],
        objective: "Side project",
        instructions: "Should be blocked.",
        verificationCommands: ["pnpm test"]
      }
    });
    expect(response.statusCode).toBe(400);
  });

  it("creates and syncs durable run-state handoff from lifecycle packet", async () => {
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createPacket = await app.inject({
      method: "POST",
      url: "/api/lifecycle/packets",
      payload: {
        realmId: "realm_realmos",
        repositoryId: "repo_realmos",
        allowedPaths: ["packages/**"],
        forbiddenPaths: [".env"],
        objective: "Run state handoff smoke",
        instructions: "Dry-run only.",
        verificationCommands: ["pnpm test"],
        expectedArtifacts: ["handoff record"]
      }
    });
    const packet = createPacket.json() as { id: string };

    const createRunState = await app.inject({
      method: "POST",
      url: `/api/run-state/records/from-packet/${packet.id}`,
      payload: { initiativeId: "0.27" }
    });
    expect(createRunState.statusCode).toBe(201);
    const runState = createRunState.json() as { id: string; sourcePacketId: string };
    expect(runState.sourcePacketId).toBe(packet.id);

    await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${packet.id}/ready`
    });
    await app.inject({
      method: "POST",
      url: `/api/lifecycle/packets/${packet.id}/approve`,
      payload: { approvedBy: "operator" }
    });

    const syncResponse = await app.inject({
      method: "POST",
      url: `/api/run-state/records/${runState.id}/sync-from-packet`
    });
    expect(syncResponse.statusCode).toBe(200);
    const synced = syncResponse.json() as { lifecycleStatus: string };
    expect(synced.lifecycleStatus).toBe("approved");

    const handoffLatest = await app.inject({ method: "GET", url: "/api/run-state/handoff/latest" });
    expect(handoffLatest.statusCode).toBe(200);
    const handoff = handoffLatest.json() as { nextRecommendedInitiative: string };
    expect(handoff.nextRecommendedInitiative).not.toMatch(/guing/i);

    const promptLatest = await app.inject({ method: "GET", url: "/api/run-state/next-chat-prompt/latest" });
    expect(promptLatest.statusCode).toBe(200);
    const prompt = promptLatest.json() as { promptText: string };
    expect(prompt.promptText).toContain("CURSOR_SSOT.md");
  });

  it("attaches verification evidence and summarizes gates", async () => {
    const { verificationEvidenceStore } = await import("../src/lib/verification-evidence-store");
    const db = createMemoryDatabase();
    const { app } = await buildApp({ database: db });

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/lifecycle/packets",
      payload: {
        realmId: "realm_realmos",
        repositoryId: "repo_realmos",
        allowedPaths: ["packages/**"],
        forbiddenPaths: [".env"],
        objective: "Evidence capture test",
        instructions: "Dry-run only.",
        verificationCommands: ["pnpm test", "pnpm typecheck"]
      }
    });
    const packet = createResponse.json() as { id: string };

    await app.inject({
      method: "POST",
      url: `/api/run-state/records/from-packet/${packet.id}`,
      payload: { initiativeId: "0.33" }
    });

    const attachResponse = await app.inject({
      method: "POST",
      url: "/api/verification/evidence",
      payload: {
        workPacketId: packet.id,
        initiativeId: "0.33",
        gateId: "pnpm_test",
        commandName: "pnpm test",
        reportedStatus: "pass",
        outputText: "Tests: 46 passed",
        environment: "local",
        operatorId: "operator_test"
      }
    });

    expect(attachResponse.statusCode).toBe(201);
    const attachBody = attachResponse.json() as {
      record: { outputHash?: string; redactionApplied: boolean };
      summary: { attachedCount: number; missingRequiredGateIds: string[] };
    };
    expect(attachBody.record.outputHash).toBeTruthy();
    expect(attachBody.summary.attachedCount).toBe(1);
    expect(attachBody.summary.missingRequiredGateIds).toContain("pnpm_typecheck");

    const summaryResponse = await app.inject({
      method: "GET",
      url: `/api/verification/evidence/summary?initiativeId=0.33&workPacketId=${packet.id}`
    });
    expect(summaryResponse.statusCode).toBe(200);

    const blocked = await app.inject({
      method: "POST",
      url: "/api/verification/evidence",
      payload: {
        workPacketId: packet.id,
        initiativeId: "0.33",
        gateId: "pnpm_build",
        commandName: "pnpm build",
        reportedStatus: "pass",
        outputText: "-----BEGIN RSA PRIVATE KEY-----\nabc",
        environment: "local",
        operatorId: "operator_test"
      }
    });
    expect(blocked.statusCode).toBe(400);
  });
});
