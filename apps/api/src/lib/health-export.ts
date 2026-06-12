import type { RealmOSDatabase } from "../db/types";
import { buildOllamaHealthSnapshot, probeOllama } from "@realmos/llm-router";
import { isTerminalExecutionEnabled } from "@realmos/tool-runner";

export type OllamaHealthCheck = {
  status: "ok" | "unreachable" | "disabled";
  baseUrl: string;
  defaultModel: string;
  fallbackActive: boolean;
  defaultModelAvailable?: boolean;
  models?: string[];
};

export type HealthReport = {
  status: "ok" | "degraded";
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: { status: "ok" | "error"; detail?: string };
    ollama: OllamaHealthCheck;
    terminal: { enabled: boolean };
    onlineModels: { enabled: boolean; configured: boolean };
  };
};

export async function buildHealthReport(db: RealmOSDatabase): Promise<HealthReport> {
  let databaseStatus: HealthReport["checks"]["database"] = { status: "ok" };
  try {
    await db.listBusinesses();
  } catch (error) {
    databaseStatus = {
      status: "error",
      detail: error instanceof Error ? error.message : "Database check failed."
    };
  }

  const ollamaStatus = await buildOllamaHealthSnapshot(probeOllama);

  const onlineEnabled = process.env.REALMOS_ALLOW_ONLINE_MODELS === "true";
  const onlineConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  const degraded = databaseStatus.status === "error";

  return {
    status: degraded ? "degraded" : "ok",
    service: "realmos-api",
    version: "0.22.0",
    timestamp: new Date().toISOString(),
    checks: {
      database: databaseStatus,
      ollama: ollamaStatus,
      terminal: { enabled: isTerminalExecutionEnabled() },
      onlineModels: { enabled: onlineEnabled, configured: onlineConfigured }
    }
  };
}

export async function buildExportBundle(db: RealmOSDatabase) {
  const [
    businesses,
    agents,
    tasks,
    approvals,
    budgets,
    costEntries,
    memories,
    auditEvents,
    worldMap,
    capabilityReports,
    communicationThreads,
    communicationMessages,
    communicationDecisions,
    communicationArchives,
    artifacts,
    toolRunRequests,
    toolRunResults
  ] = await Promise.all([
    db.listBusinesses(),
    db.listAgents(),
    db.listTasks(),
    db.listApprovals(),
    db.listBudgets(),
    db.listCostEntries(),
    db.listMemories(),
    db.listAuditEvents(),
    db.getWorldMap(),
    db.listCapabilityReports(),
    db.listCommunicationThreads(),
    db.listCommunicationMessages(),
    db.listCommunicationDecisions(),
    db.listCommunicationArchives(),
    db.listArtifacts(),
    db.listToolRunRequests(),
    db.listToolRunResults()
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: "realmos-export-v1",
    counts: {
      businesses: businesses.length,
      agents: agents.length,
      tasks: tasks.length,
      approvals: approvals.length,
      memories: memories.length,
      artifacts: artifacts.length,
      auditEvents: auditEvents.length
    },
    data: {
      businesses,
      agents,
      tasks,
      approvals,
      budgets,
      costEntries,
      memories,
      auditEvents,
      worldMap,
      capabilityReports,
      communicationThreads,
      communicationMessages,
      communicationDecisions,
      communicationArchives,
      artifacts,
      toolRunRequests,
      toolRunResults
    }
  };
}
