import { describe, expect, it } from "vitest";
import type { AgentMessage, CommunicationArchiveEntry, CommunicationDecision, CommunicationThread } from "@realmos/contracts";
import {
  appendAgentMessage,
  archiveCommunicationThread,
  createCommunicationThread,
  extractDecisionsFromMessages,
  filterMessagesByType,
  persistExtractedDecisions
} from "../src/index";
import type { CommunicationLedgerStore } from "../src/communication-ledger/types";

function createStore(): CommunicationLedgerStore & {
  snapshot: () => {
    threads: CommunicationThread[];
    messages: AgentMessage[];
  };
} {
  const threads: CommunicationThread[] = [];
  const messages: AgentMessage[] = [];
  const decisions: CommunicationDecision[] = [];
  const archives: CommunicationArchiveEntry[] = [];

  return {
    listThreads: async () => [...threads],
    getThread: async (id) => threads.find((item) => item.id === id) ?? null,
    createThread: async (thread) => {
      threads.push(structuredClone(thread));
      return thread;
    },
    updateThread: async (id, patch) => {
      const index = threads.findIndex((item) => item.id === id);
      if (index === -1) return null;
      threads[index] = { ...threads[index], ...patch, updatedAt: new Date().toISOString() };
      return threads[index];
    },
    listMessages: async () => [...messages],
    listMessagesByThread: async (threadId) => messages.filter((item) => item.threadId === threadId),
    createMessage: async (message) => {
      messages.push(structuredClone(message));
      return message;
    },
    listDecisions: async () => [...decisions],
    listDecisionsByThread: async (threadId) => decisions.filter((item) => item.threadId === threadId),
    createDecision: async (decision) => {
      decisions.push(structuredClone(decision));
      return decision;
    },
    listArchives: async () => [...archives],
    createArchive: async (entry) => {
      archives.push(structuredClone(entry));
      return entry;
    },
    snapshot: () => ({ threads, messages })
  };
}

describe("communication ledger", () => {
  it("requires messages to belong to an existing thread", async () => {
    const store = createStore();

    await expect(
      appendAgentMessage(store, {
        threadId: "missing_thread",
        fromAgentId: "agent_a",
        type: "progress_update",
        priority: "normal",
        subject: "Update",
        body: "Working",
        requiresResponse: false,
        artifactRefs: [],
        memoryRefs: []
      })
    ).rejects.toThrow(/does not exist/);
  });

  it("links threads to business, task, run, and approval", async () => {
    const store = createStore();
    const thread = await createCommunicationThread(store, {
      type: "approval_flow",
      businessId: "biz_test",
      taskId: "task_test",
      runId: "run_test",
      approvalRequestId: "approval_test",
      title: "Approval discussion",
      status: "open",
      priority: "high",
      participantAgentIds: ["agent_a", "agent_b"],
      createdByAgentId: "agent_a"
    });

    expect(thread.businessId).toBe("biz_test");
    expect(thread.taskId).toBe("task_test");
    expect(thread.runId).toBe("run_test");
    expect(thread.approvalRequestId).toBe("approval_test");
  });

  it("extracts decisions that reference the thread", async () => {
    const store = createStore();
    const thread = await createCommunicationThread(store, {
      type: "task_thread",
      businessId: "biz_test",
      taskId: "task_test",
      title: "Decision thread",
      status: "open",
      priority: "normal",
      participantAgentIds: ["agent_a"],
      createdByAgentId: "agent_a"
    });

    await appendAgentMessage(store, {
      threadId: thread.id,
      fromAgentId: "agent_a",
      businessId: "biz_test",
      taskId: "task_test",
      type: "decision_accepted",
      priority: "normal",
      subject: "Use memory DB default",
      body: "Default to memory DB for local dev.",
      requiresResponse: false,
      artifactRefs: [],
      memoryRefs: []
    });

    const messages = await store.listMessagesByThread(thread.id);
    const extracted = extractDecisionsFromMessages(thread.id, messages, thread.businessId, thread.taskId);
    const persisted = await persistExtractedDecisions(store, extracted);

    expect(persisted[0]?.threadId).toBe(thread.id);
    expect(persisted[0]?.decision).toContain("memory DB");
  });

  it("keeps raw thread reference in archive entries", async () => {
    const store = createStore();
    const thread = await createCommunicationThread(store, {
      type: "incident",
      title: "Incident thread",
      status: "open",
      priority: "critical",
      participantAgentIds: ["agent_a"],
      createdByAgentId: "agent_a"
    });

    await appendAgentMessage(store, {
      threadId: thread.id,
      fromAgentId: "agent_a",
      type: "blocker",
      priority: "high",
      subject: "Blocked deploy",
      body: "Missing approval.",
      requiresResponse: true,
      artifactRefs: [],
      memoryRefs: []
    });

    const archived = await archiveCommunicationThread(store, thread.id);
    expect(archived?.archive.threadId).toBe(thread.id);
    expect(archived?.markdown).toContain("Blocked deploy");
    expect(archived?.archive.summary).toContain("raw messages preserved");
  });

  it("filters blocker and error messages by type", async () => {
    const messages: AgentMessage[] = [
      {
        id: "m1",
        threadId: "t1",
        fromAgentId: "agent_a",
        type: "blocker",
        priority: "high",
        subject: "Blocker",
        body: "Blocked",
        requiresResponse: false,
        artifactRefs: [],
        memoryRefs: [],
        createdAt: new Date().toISOString()
      },
      {
        id: "m2",
        threadId: "t1",
        fromAgentId: "agent_a",
        type: "error_report",
        priority: "high",
        subject: "Error",
        body: "Failed",
        requiresResponse: false,
        artifactRefs: [],
        memoryRefs: [],
        createdAt: new Date().toISOString()
      }
    ];

    expect(filterMessagesByType(messages, ["blocker"]).length).toBe(1);
    expect(filterMessagesByType(messages, ["error_report"]).length).toBe(1);
  });
});
