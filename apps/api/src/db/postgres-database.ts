import type {
  Agent,
  AgentMessage,
  ApprovalRequest,
  AuditEvent,
  Budget,
  Business,
  CapabilitySearchReport,
  CommunicationArchiveEntry,
  CommunicationDecision,
  CommunicationThread,
  CostEntry,
  Memory,
  Task,
  ToolRunRequest,
  ToolRunResult,
  WorldMap,
  Artifact
} from "@realmos/contracts";
import type pg from "pg";
import type { RealmOSDatabase, SeedBundle } from "./types";
import { workLoopStore } from "../lib/work-loop-store";

async function readTable<T>(pool: pg.Pool, table: string): Promise<T[]> {
  const result = await pool.query<{ payload: T }>(`SELECT payload FROM ${table}`);
  return result.rows.map((row) => row.payload);
}

async function readOne<T>(pool: pg.Pool, table: string, id: string): Promise<T | null> {
  const result = await pool.query<{ payload: T }>(`SELECT payload FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0]?.payload ?? null;
}

async function upsertOne<T extends { id: string }>(pool: pg.Pool, table: string, value: T): Promise<T> {
  await pool.query(
    `INSERT INTO ${table} (id, payload) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
    [value.id, value]
  );
  return value;
}

async function replaceTable<T extends { id: string }>(pool: pg.Pool, table: string, values: T[]): Promise<void> {
  await pool.query(`DELETE FROM ${table}`);
  for (const value of values) {
    await upsertOne(pool, table, value);
  }
}

async function deleteOne(pool: pg.Pool, table: string, id: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export function createPostgresDatabase(pool: pg.Pool): RealmOSDatabase {
  return {
    listBusinesses: () => readTable<Business>(pool, "businesses"),
    getBusiness: (id) => readOne<Business>(pool, "businesses", id),
    createBusiness: (business) => upsertOne(pool, "businesses", business),
    updateBusiness: async (id, patch) => {
      const current = await readOne<Business>(pool, "businesses", id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return upsertOne(pool, "businesses", updated);
    },

    listAgents: () => readTable<Agent>(pool, "agents"),
    getAgent: (id) => readOne<Agent>(pool, "agents", id),
    createAgent: (agent) => upsertOne(pool, "agents", agent),
    updateAgent: async (id, patch) => {
      const current = await readOne<Agent>(pool, "agents", id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return upsertOne(pool, "agents", updated);
    },

    listTasks: () => readTable<Task>(pool, "tasks"),
    getTask: (id) => readOne<Task>(pool, "tasks", id),
    createTask: (task) => upsertOne(pool, "tasks", task),
    updateTask: async (id, patch) => {
      const current = await readOne<Task>(pool, "tasks", id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return upsertOne(pool, "tasks", updated);
    },

    listMemories: () => readTable<Memory>(pool, "memories"),
    getMemory: (id) => readOne<Memory>(pool, "memories", id),
    createMemory: (memory) => upsertOne(pool, "memories", memory),
    updateMemory: async (id, patch) => {
      const current = await readOne<Memory>(pool, "memories", id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return upsertOne(pool, "memories", updated);
    },
    deleteMemory: (id) => deleteOne(pool, "memories", id),

    listApprovals: () => readTable<ApprovalRequest>(pool, "approvals"),
    getApproval: (id) => readOne<ApprovalRequest>(pool, "approvals", id),
    createApproval: (approval) => upsertOne(pool, "approvals", approval),
    updateApproval: async (id, patch) => {
      const current = await readOne<ApprovalRequest>(pool, "approvals", id);
      if (!current) return null;
      const updated = {
        ...current,
        ...patch,
        resolvedAt:
          patch.status && patch.status !== "pending"
            ? new Date().toISOString()
            : current.resolvedAt
      };
      return upsertOne(pool, "approvals", updated);
    },

    listAuditEvents: async () => {
      const result = await pool.query<{ payload: AuditEvent }>(
        `SELECT payload FROM audit_events ORDER BY created_at DESC`
      );
      return result.rows.map((row) => row.payload);
    },
    appendAuditEvent: async (event) => {
      await pool.query(`INSERT INTO audit_events (id, payload, created_at) VALUES ($1, $2, $3)`, [
        event.id,
        event,
        event.createdAt
      ]);
      return event;
    },

    listCostEntries: () => readTable<CostEntry>(pool, "cost_entries"),
    createCostEntry: (entry) => upsertOne(pool, "cost_entries", entry),
    listBudgets: () => readTable<Budget>(pool, "budgets"),
    getWorldMap: async () => {
      const result = await pool.query<{ payload: WorldMap }>(`SELECT payload FROM world_map LIMIT 1`);
      return result.rows[0]?.payload ?? {
        id: "world_empty",
        title: "Empty World",
        version: "0.0.0",
        nodes: [],
        edges: [],
        updatedAt: new Date().toISOString()
      };
    },
    saveWorldMap: (worldMap) => upsertOne(pool, "world_map", worldMap),

    listCapabilityReports: () => readTable<CapabilitySearchReport>(pool, "capability_reports"),
    appendCapabilityReport: (report) => upsertOne(pool, "capability_reports", report),

    listCommunicationThreads: () => readTable<CommunicationThread>(pool, "communication_threads"),
    getCommunicationThread: (id) => readOne<CommunicationThread>(pool, "communication_threads", id),
    createCommunicationThread: (thread) => upsertOne(pool, "communication_threads", thread),
    updateCommunicationThread: async (id, patch) => {
      const current = await readOne<CommunicationThread>(pool, "communication_threads", id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return upsertOne(pool, "communication_threads", updated);
    },

    listCommunicationMessages: () => readTable<AgentMessage>(pool, "communication_messages"),
    listCommunicationMessagesByThread: async (threadId) => {
      const messages = await readTable<AgentMessage>(pool, "communication_messages");
      return messages.filter((message) => message.threadId === threadId);
    },
    createCommunicationMessage: (message) => upsertOne(pool, "communication_messages", message),

    listCommunicationDecisions: () => readTable<CommunicationDecision>(pool, "communication_decisions"),
    listCommunicationDecisionsByThread: async (threadId) => {
      const decisions = await readTable<CommunicationDecision>(pool, "communication_decisions");
      return decisions.filter((decision) => decision.threadId === threadId);
    },
    createCommunicationDecision: (decision) => upsertOne(pool, "communication_decisions", decision),

    listCommunicationArchives: () => readTable<CommunicationArchiveEntry>(pool, "communication_archives"),
    createCommunicationArchive: (entry) => upsertOne(pool, "communication_archives", entry),

    listArtifacts: () => readTable<Artifact>(pool, "artifacts"),
    listArtifactsByBusiness: async (businessId) => {
      const artifacts = await readTable<Artifact>(pool, "artifacts");
      return artifacts.filter((artifact) => artifact.businessId === businessId);
    },
    createArtifact: (artifact) => upsertOne(pool, "artifacts", artifact),

    listToolRunRequests: () => readTable<ToolRunRequest>(pool, "tool_run_requests"),
    getToolRunRequest: (id) => readOne<ToolRunRequest>(pool, "tool_run_requests", id),
    createToolRunRequest: (request) => upsertOne(pool, "tool_run_requests", request),
    updateToolRunRequest: async (id, patch) => {
      const current = await readOne<ToolRunRequest>(pool, "tool_run_requests", id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return upsertOne(pool, "tool_run_requests", updated);
    },
    listToolRunResults: () => readTable<ToolRunResult>(pool, "tool_run_results"),
    createToolRunResult: (result) => upsertOne(pool, "tool_run_results", result),

    getContinuousWorkPolicy: () => workLoopStore.getContinuousWorkPolicy(),
    saveContinuousWorkPolicy: (policy) => workLoopStore.saveContinuousWorkPolicy(policy),
    listWorkItems: () => workLoopStore.listWorkItems(),
    getWorkItem: (id) => workLoopStore.getWorkItem(id),
    createWorkItem: (item) => workLoopStore.createWorkItem(item),
    updateWorkItem: (id, patch) => workLoopStore.updateWorkItem(id, patch),
    listCursorWorkPackets: () => workLoopStore.listCursorWorkPackets(),
    getCursorWorkPacket: (id) => workLoopStore.getCursorWorkPacket(id),
    createCursorWorkPacket: (packet) => workLoopStore.createCursorWorkPacket(packet),
    updateCursorWorkPacket: (id, patch) => workLoopStore.updateCursorWorkPacket(id, patch),
    listCursorCompletionReports: () => workLoopStore.listCursorCompletionReports(),
    createCursorCompletionReport: (report) => workLoopStore.createCursorCompletionReport(report),
    listNextBestWorkDecisions: () => workLoopStore.listNextBestWorkDecisions(),
    appendNextBestWorkDecision: (decision) => workLoopStore.appendNextBestWorkDecision(decision),

    loadSeed: async (bundle: SeedBundle) => {
      await replaceTable(pool, "businesses", bundle.businesses);
      await replaceTable(pool, "agents", bundle.agents);
      await replaceTable(pool, "tasks", bundle.tasks);
      await replaceTable(pool, "approvals", bundle.approvals);
      await replaceTable(pool, "budgets", bundle.budgets);
      await replaceTable(pool, "cost_entries", bundle.costEntries);
      await replaceTable(pool, "memories", bundle.memories);
      await pool.query(`DELETE FROM audit_events`);
      for (const event of bundle.auditEvents) {
        await pool.query(`INSERT INTO audit_events (id, payload, created_at) VALUES ($1, $2, $3)`, [
          event.id,
          event,
          event.createdAt
        ]);
      }
      await upsertOne(pool, "world_map", bundle.worldMap);
      await replaceTable(pool, "capability_reports", bundle.capabilityReports ?? []);
      await replaceTable(pool, "communication_threads", bundle.communicationThreads ?? []);
      await replaceTable(pool, "communication_messages", bundle.communicationMessages ?? []);
      await replaceTable(pool, "communication_decisions", bundle.communicationDecisions ?? []);
      await replaceTable(pool, "communication_archives", bundle.communicationArchives ?? []);
      await replaceTable(pool, "artifacts", bundle.artifacts ?? []);
      await replaceTable(pool, "tool_run_requests", bundle.toolRunRequests ?? []);
      await replaceTable(pool, "tool_run_results", bundle.toolRunResults ?? []);
      await workLoopStore.resetFromSeed(bundle);
    }
  };
}
