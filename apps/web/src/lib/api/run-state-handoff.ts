import type { HandoffSummaryObject, NextChatPromptObject, RealmOSRunState } from "@realmos/contracts";
import { getApiBaseUrl } from "./client";

export type RunStateHandoffStatus = {
  totalCount: number;
  handoffRequiredCount: number;
  handoffUpdatedCount: number;
  latestRunStateId: string | null;
  latestHandoffRequired: boolean | null;
  latestNextRecommendedInitiative: string | null;
};

export async function fetchRunStateStatus(baseUrl = getApiBaseUrl()): Promise<RunStateHandoffStatus | null> {
  try {
    const response = await fetch(`${baseUrl}/api/run-state/status`, { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      totalCount: number;
      handoffRequiredCount: number;
      handoffUpdatedCount: number;
      latestRunState: RealmOSRunState | null;
    };
    return {
      totalCount: body.totalCount,
      handoffRequiredCount: body.handoffRequiredCount,
      handoffUpdatedCount: body.handoffUpdatedCount,
      latestRunStateId: body.latestRunState?.id ?? null,
      latestHandoffRequired: body.latestRunState?.handoffRequired ?? null,
      latestNextRecommendedInitiative: body.latestRunState?.nextRecommendedInitiative ?? null
    };
  } catch {
    return null;
  }
}

export async function fetchLatestHandoffSummary(
  baseUrl = getApiBaseUrl()
): Promise<HandoffSummaryObject | null> {
  try {
    const response = await fetch(`${baseUrl}/api/run-state/handoff/latest`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as HandoffSummaryObject;
  } catch {
    return null;
  }
}

export async function fetchLatestNextChatPrompt(
  baseUrl = getApiBaseUrl()
): Promise<NextChatPromptObject | null> {
  try {
    const response = await fetch(`${baseUrl}/api/run-state/next-chat-prompt/latest`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as NextChatPromptObject;
  } catch {
    return null;
  }
}

export async function createRunStateFromPacket(
  packetId: string,
  baseUrl = getApiBaseUrl()
): Promise<{ ok: true; data: RealmOSRunState } | { ok: false; message: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/run-state/records/from-packet/${packetId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      return { ok: false, message: body.error ?? `Request failed (${response.status})` };
    }
    return { ok: true, data: (await response.json()) as RealmOSRunState };
  } catch {
    return { ok: false, message: "API unavailable" };
  }
}

export async function markRunStateHandoffUpdatedApi(
  runStateId: string,
  baseUrl = getApiBaseUrl()
): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/run-state/records/${runStateId}/handoff-updated`, {
      method: "POST"
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      return { ok: false, message: body.error };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "API unavailable" };
  }
}
