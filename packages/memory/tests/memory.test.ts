import { describe, expect, it } from "vitest";
import type { Agent, Memory } from "@realmos/contracts";
import {
  buildMemorySummaries,
  deleteMemory,
  editMemory,
  filterMemoriesForAgent,
  listBusinessMemories,
  listGlobalMemories,
  retrieveMemoriesForAgent,
  writeAgentMemory,
  writeBusinessMemory,
  writeGlobalMemory,
  writeMemory,
  type MemoryStore
} from "../src/index";

function createTestStore(): MemoryStore {
  const memories: Memory[] = [];

  return {
    listMemories: async () => [...memories],
    getMemory: async (id) => memories.find((memory) => memory.id === id) ?? null,
    createMemory: async (memory) => {
      memories.push(structuredClone(memory));
      return memory;
    },
    updateMemory: async (id, patch) => {
      const index = memories.findIndex((memory) => memory.id === id);
      if (index === -1) return null;
      memories[index] = { ...memories[index], ...patch };
      return memories[index];
    },
    deleteMemory: async (id) => {
      const index = memories.findIndex((memory) => memory.id === id);
      if (index === -1) return false;
      memories.splice(index, 1);
      return true;
    }
  };
}

function sampleAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent_alpha",
    name: "Alpha",
    role: "PM",
    scope: "business",
    businessId: "biz_alpha",
    directive: "Plan work.",
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
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

describe("@realmos/memory", () => {
  it("keeps global memory separate from business memory", async () => {
    const store = createTestStore();

    await writeGlobalMemory(store, {
      kind: "event",
      title: "Global note",
      content: "Applies everywhere."
    });
    await writeBusinessMemory(store, "memscope_alpha", {
      kind: "knowledge",
      title: "Business note",
      content: "Only for alpha."
    });

    const globalMemories = await listGlobalMemories(store);
    const businessMemories = await listBusinessMemories(store, "memscope_alpha");

    expect(globalMemories).toHaveLength(1);
    expect(globalMemories[0]?.scope).toBe("global");
    expect(businessMemories).toHaveLength(1);
    expect(businessMemories[0]?.scope).toBe("business");
    expect(globalMemories[0]?.id).not.toBe(businessMemories[0]?.id);
  });

  it("prevents an agent from reading unrelated business memory", async () => {
    const store = createTestStore();
    const agent = sampleAgent();

    await writeBusinessMemory(store, "memscope_alpha", {
      kind: "knowledge",
      title: "Allowed",
      content: "Alpha scope."
    });
    await writeBusinessMemory(store, "memscope_beta", {
      kind: "knowledge",
      title: "Blocked",
      content: "Beta scope."
    });

    const visible = await retrieveMemoriesForAgent(store, { agent, businessMemoryScopeId: "memscope_alpha" });

    expect(visible).toHaveLength(1);
    expect(visible[0]?.title).toBe("Allowed");
  });

  it("allows sensitive memory to be marked and filtered by default", async () => {
    const store = createTestStore();
    const agent = sampleAgent({
      memoryAccess: [{ scope: "business", access: "read", allowedScopeIds: ["memscope_alpha"] }]
    });

    await writeBusinessMemory(store, "memscope_alpha", {
      kind: "risk",
      title: "Sensitive risk",
      content: "Do not expose broadly.",
      sensitivity: "sensitive"
    });

    const filtered = await retrieveMemoriesForAgent(store, { agent, businessMemoryScopeId: "memscope_alpha" });
    expect(filtered).toHaveLength(0);

    const included = await retrieveMemoriesForAgent(
      store,
      { agent, businessMemoryScopeId: "memscope_alpha" },
      { includeSensitive: true }
    );
    expect(included).toHaveLength(1);
    expect(included[0]?.sensitivity).toBe("sensitive");
  });

  it("deletes memory entries", async () => {
    const store = createTestStore();
    const created = await writeAgentMemory(store, "agent_alpha", {
      kind: "lesson",
      title: "Temporary note",
      content: "Remove me."
    });

    const deleted = await deleteMemory(store, created.id);
    expect(deleted).toBe(true);
    expect(await store.getMemory(created.id)).toBeNull();
  });

  it("builds grouped memory summaries", async () => {
    const store = createTestStore();
    await writeGlobalMemory(store, { kind: "summary", title: "Global summary", content: "One." });
    await writeBusinessMemory(store, "memscope_alpha", {
      kind: "summary",
      title: "Business summary",
      content: "Two."
    });

    const summaries = buildMemorySummaries(await store.listMemories());
    expect(summaries).toHaveLength(2);
    expect(summaries.some((summary) => summary.scope === "global")).toBe(true);
    expect(summaries.some((summary) => summary.scope === "business")).toBe(true);
  });

  it("edits memory content in place", async () => {
    const store = createTestStore();
    const created = await writeMemory(store, {
      scope: "task",
      scopeId: "task_1",
      kind: "decision",
      title: "Original",
      content: "Before edit."
    });

    const updated = await editMemory(store, created.id, {
      title: "Updated",
      content: "After edit."
    });

    expect(updated?.title).toBe("Updated");
    expect(updated?.content).toBe("After edit.");
  });

  it("filters memories for agent using filterMemoriesForAgent", async () => {
    const store = createTestStore();
    const agent = sampleAgent();
    const memories = await Promise.all([
      writeBusinessMemory(store, "memscope_alpha", {
        kind: "knowledge",
        title: "In scope",
        content: "ok"
      }),
      writeBusinessMemory(store, "memscope_beta", {
        kind: "knowledge",
        title: "Out of scope",
        content: "blocked"
      })
    ]);

    const visible = filterMemoriesForAgent({ agent, businessMemoryScopeId: "memscope_alpha" }, memories);
    expect(visible).toHaveLength(1);
    expect(visible[0]?.title).toBe("In scope");
  });
});
