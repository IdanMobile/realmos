import { getApiBaseUrl } from "./client";

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
    terminal: { enabled: boolean };
    onlineModels: { enabled: boolean; configured: boolean };
  };
};

export async function fetchHealthFromApi(baseUrl = getApiBaseUrl()): Promise<HealthReport | null> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as HealthReport;
  } catch {
    return null;
  }
}
