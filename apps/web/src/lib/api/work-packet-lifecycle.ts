import type {
  WorkPacketLifecycle,
  WorkPacketLifecycleCloseInput,
  WorkPacketLifecycleInput
} from "@realmos/contracts";
import { getApiBaseUrl } from "./client";

export type LifecycleApiError = {
  error?: string;
  details?: Array<{ field: string; message: string }>;
  status?: string;
};

export type LifecycleApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; details?: LifecycleApiError["details"] };

async function parseLifecycleResponse<T>(response: Response): Promise<LifecycleApiResult<T>> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok) {
    return { ok: true, data: body as T };
  }

  const err = (body ?? {}) as LifecycleApiError;
  return {
    ok: false,
    status: response.status,
    message: err.error ?? `Request failed (${response.status})`,
    details: err.details
  };
}

export async function fetchLifecycleStatus(baseUrl = getApiBaseUrl()) {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/status`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as {
      totalCount: number;
      approvalNeededCount: number;
      awaitingResultCount: number;
      verificationPendingCount: number;
      latestPacket: WorkPacketLifecycle | null;
    };
  } catch {
    return null;
  }
}

export async function fetchLifecyclePackets(baseUrl = getApiBaseUrl()): Promise<LifecycleApiResult<WorkPacketLifecycle[]>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets`, { cache: "no-store" });
    const parsed = await parseLifecycleResponse<{ items: WorkPacketLifecycle[] }>(response);
    if (!parsed.ok) return parsed;
    return { ok: true, data: parsed.data.items ?? [] };
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function fetchLifecyclePacket(
  id: string,
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}`, { cache: "no-store" });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function createLifecyclePacket(
  input: WorkPacketLifecycleInput,
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function markLifecyclePacketReady(
  id: string,
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}/ready`, { method: "POST" });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function approveLifecyclePacket(
  id: string,
  approvedBy = "operator",
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy })
    });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function dispatchLifecyclePacket(
  id: string,
  baseUrl = getApiBaseUrl()
): Promise<
  LifecycleApiResult<{
    packet: WorkPacketLifecycle;
    dispatch: { id: string; status: string; queueArtifactPath?: string };
  }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const parsed = await parseLifecycleResponse<{
      packet: WorkPacketLifecycle;
      dispatch: { id: string; status: string; queueArtifactPath?: string };
      artifacts?: { packetDir?: string };
    }>(response);
    if (!parsed.ok) return parsed;
    const dispatch = parsed.data.dispatch;
    if (!dispatch.queueArtifactPath && parsed.data.artifacts?.packetDir) {
      dispatch.queueArtifactPath = parsed.data.artifacts.packetDir;
    }
    return { ok: true, data: { packet: parsed.data.packet, dispatch } };
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function recordLifecyclePacketResult(
  id: string,
  input: { status: "completed" | "failed" | "running" | "blocked"; resultSummary?: string; errorMessage?: string },
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function attachLifecycleVerification(
  id: string,
  input: {
    reportedStatus: "pass" | "fail" | "blocked";
    outputSummary: string;
    artifactsSummary: string;
    blockReason?: string;
  },
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}/verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function closeLifecyclePacket(
  id: string,
  input: WorkPacketLifecycleCloseInput,
  baseUrl = getApiBaseUrl()
): Promise<LifecycleApiResult<WorkPacketLifecycle>> {
  try {
    const response = await fetch(`${baseUrl}/api/lifecycle/packets/${id}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseLifecycleResponse<WorkPacketLifecycle>(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}
