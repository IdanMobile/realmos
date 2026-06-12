import type { RealmOSDatabase } from "../db/types";
import { buildExecutorBridgeStatus } from "../executor-bridge-routes";
import { buildWorkPacketLifecycleStatus } from "../work-packet-lifecycle-routes";
import { buildRunStateHandoffStatus } from "../run-state-handoff-routes";
import { buildFirebaseBaselineHealthSnapshot } from "@realmos/platform-infra";
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

export type FirebaseHealthCheck = {
  status: "not_configured" | "configured" | "disabled";
  mode: "none" | "emulator" | "production";
  projectId: string | null;
  adminStatus: "ready" | "not_configured" | "disabled" | "init_error" | "not_initialized";
  services: {
    auth: "not_configured" | "emulator" | "production";
    firestore: "not_configured" | "emulator" | "production";
    storage: "not_configured" | "emulator" | "production";
  };
  emulatorHosts: {
    auth?: string;
    firestore?: string;
    storage?: string;
  };
};

export type ExecutorHealthCheck = {
  enabled: boolean;
  mode: "dry_run";
  queueRoot: string;
  queuedCount: number;
  dispatchedCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  blockedCount: number;
  lastDispatchId: string | null;
  lastDispatchStatus: string | null;
};

export type WorkPacketLifecycleHealthCheck = {
  totalCount: number;
  approvalNeededCount: number;
  dispatchedCount: number;
  awaitingResultCount: number;
  verificationPendingCount: number;
  latestPacketId: string | null;
  latestPacketStatus: string | null;
};

export type RunStateHandoffHealthCheck = {
  totalCount: number;
  handoffRequiredCount: number;
  handoffUpdatedCount: number;
  latestRunStateId: string | null;
  latestNextRecommendedInitiative: string | null;
};

export type HealthReport = {
  status: "ok" | "degraded";
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: { status: "ok" | "error"; detail?: string };
    ollama: OllamaHealthCheck;
    firebase: FirebaseHealthCheck;
    executor: ExecutorHealthCheck;
    lifecycle: WorkPacketLifecycleHealthCheck;
    runState: RunStateHandoffHealthCheck;
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
  const firebaseStatus = buildFirebaseBaselineHealthSnapshot();
  const executorSummary = await buildExecutorBridgeStatus();
  const executorStatus: ExecutorHealthCheck = {
    enabled: executorSummary.enabled,
    mode: executorSummary.mode,
    queueRoot: executorSummary.queueRoot,
    queuedCount: executorSummary.queuedCount,
    dispatchedCount: executorSummary.dispatchedCount,
    runningCount: executorSummary.runningCount,
    completedCount: executorSummary.completedCount,
    failedCount: executorSummary.failedCount,
    blockedCount: executorSummary.blockedCount,
    lastDispatchId: executorSummary.lastDispatch?.id ?? null,
    lastDispatchStatus: executorSummary.lastDispatch?.status ?? null
  };

  const lifecycleSummary = await buildWorkPacketLifecycleStatus();
  const lifecycleStatus: WorkPacketLifecycleHealthCheck = {
    totalCount: lifecycleSummary.totalCount,
    approvalNeededCount: lifecycleSummary.approvalNeededCount,
    dispatchedCount: lifecycleSummary.dispatchedCount,
    awaitingResultCount: lifecycleSummary.awaitingResultCount,
    verificationPendingCount: lifecycleSummary.verificationPendingCount,
    latestPacketId: lifecycleSummary.latestPacket?.id ?? null,
    latestPacketStatus: lifecycleSummary.latestPacket?.status ?? null
  };

  const runStateSummary = await buildRunStateHandoffStatus();
  const runStateStatus: RunStateHandoffHealthCheck = {
    totalCount: runStateSummary.totalCount,
    handoffRequiredCount: runStateSummary.handoffRequiredCount,
    handoffUpdatedCount: runStateSummary.handoffUpdatedCount,
    latestRunStateId: runStateSummary.latestRunState?.id ?? null,
    latestNextRecommendedInitiative: runStateSummary.latestRunState?.nextRecommendedInitiative ?? null
  };

  const onlineEnabled = process.env.REALMOS_ALLOW_ONLINE_MODELS === "true";
  const onlineConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  const degraded = databaseStatus.status === "error";

  return {
    status: degraded ? "degraded" : "ok",
    service: "realmos-api",
    version: "0.27.0",
    timestamp: new Date().toISOString(),
    checks: {
      database: databaseStatus,
      ollama: ollamaStatus,
      firebase: firebaseStatus,
      executor: executorStatus,
      lifecycle: lifecycleStatus,
      runState: runStateStatus,
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
