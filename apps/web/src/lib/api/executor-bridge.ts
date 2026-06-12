import type { LocalExecutorDispatch } from "@realmos/contracts";
import { getApiBaseUrl } from "./client";

export type ExecutorBridgeStatus = {
  enabled: boolean;
  mode: "dry_run";
  queueRoot: string;
  queuedCount: number;
  dispatchedCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  blockedCount: number;
  lastDispatch: LocalExecutorDispatch | null;
};

export async function fetchExecutorBridgeStatus(baseUrl = getApiBaseUrl()): Promise<ExecutorBridgeStatus | null> {
  try {
    const response = await fetch(`${baseUrl}/api/executor/status`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as ExecutorBridgeStatus;
  } catch {
    return null;
  }
}

export async function fetchExecutorDispatches(baseUrl = getApiBaseUrl()): Promise<LocalExecutorDispatch[]> {
  try {
    const response = await fetch(`${baseUrl}/api/executor/dispatches`, { cache: "no-store" });
    if (!response.ok) return [];
    const body = (await response.json()) as { items: LocalExecutorDispatch[] };
    return body.items ?? [];
  } catch {
    return [];
  }
}
