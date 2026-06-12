import type { SeedBundle, RealmOSDatabase } from "./types";
import { workLoopStore } from "../lib/work-loop-store";

export function createMemoryDatabase(initial?: SeedBundle): RealmOSDatabase {
  const state: SeedBundle = initial
    ? structuredClone(initial)
    : {
        businesses: [],
        agents: [],
        tasks: [],
        approvals: [],
        budgets: [],
        costEntries: [],
        memories: [],
        auditEvents: [],
        worldMap: {
          id: "world_empty",
          title: "Empty World",
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
      };

  return {
    async listBusinesses() {
      return [...state.businesses];
    },
    async getBusiness(id) {
      return state.businesses.find((item) => item.id === id) ?? null;
    },
    async createBusiness(business) {
      state.businesses.push(structuredClone(business));
      return business;
    },
    async updateBusiness(id, patch) {
      const index = state.businesses.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.businesses[index] = { ...state.businesses[index], ...patch, updatedAt: new Date().toISOString() };
      return state.businesses[index];
    },

    async listAgents() {
      return [...state.agents];
    },
    async getAgent(id) {
      return state.agents.find((item) => item.id === id) ?? null;
    },
    async createAgent(agent) {
      state.agents.push(structuredClone(agent));
      return agent;
    },
    async updateAgent(id, patch) {
      const index = state.agents.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.agents[index] = { ...state.agents[index], ...patch, updatedAt: new Date().toISOString() };
      return state.agents[index];
    },

    async listTasks() {
      return [...state.tasks];
    },
    async getTask(id) {
      return state.tasks.find((item) => item.id === id) ?? null;
    },
    async createTask(task) {
      state.tasks.push(structuredClone(task));
      return task;
    },
    async updateTask(id, patch) {
      const index = state.tasks.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.tasks[index] = { ...state.tasks[index], ...patch, updatedAt: new Date().toISOString() };
      return state.tasks[index];
    },

    async listMemories() {
      return [...state.memories];
    },
    async getMemory(id) {
      return state.memories.find((item) => item.id === id) ?? null;
    },
    async createMemory(memory) {
      state.memories.push(structuredClone(memory));
      return memory;
    },
    async updateMemory(id, patch) {
      const index = state.memories.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.memories[index] = { ...state.memories[index], ...patch, updatedAt: new Date().toISOString() };
      return state.memories[index];
    },
    async deleteMemory(id) {
      const index = state.memories.findIndex((item) => item.id === id);
      if (index === -1) return false;
      state.memories.splice(index, 1);
      return true;
    },

    async listApprovals() {
      return [...state.approvals];
    },
    async getApproval(id) {
      return state.approvals.find((item) => item.id === id) ?? null;
    },
    async createApproval(approval) {
      state.approvals.push(structuredClone(approval));
      return approval;
    },
    async updateApproval(id, patch) {
      const index = state.approvals.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.approvals[index] = {
        ...state.approvals[index],
        ...patch,
        resolvedAt: patch.status && patch.status !== "pending" ? new Date().toISOString() : state.approvals[index].resolvedAt
      };
      return state.approvals[index];
    },

    async listAuditEvents() {
      return [...state.auditEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async appendAuditEvent(event) {
      state.auditEvents.push(structuredClone(event));
      return event;
    },

    async listCostEntries() {
      return [...state.costEntries];
    },
    async createCostEntry(entry) {
      state.costEntries.push(structuredClone(entry));
      return entry;
    },
    async listBudgets() {
      return [...state.budgets];
    },
    async getWorldMap() {
      return structuredClone(state.worldMap);
    },
    async saveWorldMap(worldMap) {
      state.worldMap = structuredClone(worldMap);
      return structuredClone(state.worldMap);
    },

    async listCapabilityReports() {
      return [...state.capabilityReports];
    },
    async appendCapabilityReport(report) {
      state.capabilityReports.push(structuredClone(report));
      return report;
    },

    async listCommunicationThreads() {
      return [...state.communicationThreads];
    },
    async getCommunicationThread(id) {
      return state.communicationThreads.find((item) => item.id === id) ?? null;
    },
    async createCommunicationThread(thread) {
      state.communicationThreads.push(structuredClone(thread));
      return thread;
    },
    async updateCommunicationThread(id, patch) {
      const index = state.communicationThreads.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.communicationThreads[index] = {
        ...state.communicationThreads[index],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      return state.communicationThreads[index];
    },

    async listCommunicationMessages() {
      return [...state.communicationMessages];
    },
    async listCommunicationMessagesByThread(threadId) {
      return state.communicationMessages.filter((item) => item.threadId === threadId);
    },
    async createCommunicationMessage(message) {
      state.communicationMessages.push(structuredClone(message));
      return message;
    },

    async listCommunicationDecisions() {
      return [...state.communicationDecisions];
    },
    async listCommunicationDecisionsByThread(threadId) {
      return state.communicationDecisions.filter((item) => item.threadId === threadId);
    },
    async createCommunicationDecision(decision) {
      state.communicationDecisions.push(structuredClone(decision));
      return decision;
    },

    async listCommunicationArchives() {
      return [...state.communicationArchives];
    },
    async createCommunicationArchive(entry) {
      state.communicationArchives.push(structuredClone(entry));
      return entry;
    },

    async listArtifacts() {
      return [...state.artifacts];
    },
    async listArtifactsByBusiness(businessId) {
      return state.artifacts.filter((item) => item.businessId === businessId);
    },
    async createArtifact(artifact) {
      const index = state.artifacts.findIndex((item) => item.id === artifact.id);
      if (index === -1) {
        state.artifacts.push(structuredClone(artifact));
      } else {
        state.artifacts[index] = structuredClone(artifact);
      }
      return artifact;
    },

    async listToolRunRequests() {
      return [...state.toolRunRequests];
    },
    async getToolRunRequest(id) {
      return state.toolRunRequests.find((item) => item.id === id) ?? null;
    },
    async createToolRunRequest(request) {
      state.toolRunRequests.push(structuredClone(request));
      return request;
    },
    async updateToolRunRequest(id, patch) {
      const index = state.toolRunRequests.findIndex((item) => item.id === id);
      if (index === -1) return null;
      state.toolRunRequests[index] = {
        ...state.toolRunRequests[index],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      return state.toolRunRequests[index];
    },
    async listToolRunResults() {
      return [...state.toolRunResults];
    },
    async createToolRunResult(result) {
      state.toolRunResults.push(structuredClone(result));
      return result;
    },

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

    async loadSeed(bundle) {
      state.businesses = structuredClone(bundle.businesses);
      state.agents = structuredClone(bundle.agents);
      state.tasks = structuredClone(bundle.tasks);
      state.approvals = structuredClone(bundle.approvals);
      state.budgets = structuredClone(bundle.budgets);
      state.costEntries = structuredClone(bundle.costEntries);
      state.memories = structuredClone(bundle.memories);
      state.auditEvents = structuredClone(bundle.auditEvents);
      state.worldMap = structuredClone(bundle.worldMap);
      state.capabilityReports = structuredClone(bundle.capabilityReports ?? []);
      state.communicationThreads = structuredClone(bundle.communicationThreads ?? []);
      state.communicationMessages = structuredClone(bundle.communicationMessages ?? []);
      state.communicationDecisions = structuredClone(bundle.communicationDecisions ?? []);
      state.communicationArchives = structuredClone(bundle.communicationArchives ?? []);
      state.artifacts = structuredClone(bundle.artifacts ?? []);
      state.toolRunRequests = structuredClone(bundle.toolRunRequests ?? []);
      state.toolRunResults = structuredClone(bundle.toolRunResults ?? []);
      await workLoopStore.resetFromSeed(bundle);
    }
  };
}
