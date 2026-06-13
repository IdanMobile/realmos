import { getApiBaseUrl } from "./client";

export type NecromancerCandidate = {
  id: string;
  kind: "agent" | "task" | "work_packet";
  entityId: string;
  classification: "stale" | "failed" | "orphaned" | "blocked";
  riskLevel: "low" | "medium" | "high";
  title: string;
  currentStatus: string;
  realmId?: string;
  repositoryId?: string;
  businessId?: string;
  workItemId?: string;
  reason: string;
  protected: boolean;
  sideProjectBlocked: boolean;
  recommendedAction: "observe" | "pause" | "retire" | "protect" | "review";
};

export type NecromancerRecommendation = {
  candidateId: string;
  summary: string;
  recommendation: string;
  allowedActions: Array<"prepare" | "pause" | "retire" | "protect">;
  requiresApproval: boolean;
  safetyNotes: string[];
  blockedActions: string[];
};

export type NecromancerActionRecord = {
  id: string;
  candidateId: string;
  action: "pause" | "retire" | "protect" | "prepare";
  operatorId: string;
  approved: boolean;
  outcome: "applied" | "blocked";
  summary: string;
  createdAt: string;
  timestamp?: string;
  evidenceId?: string;
  evidenceStatus?: "linked" | "missing" | "invalid";
  blockReason?: string;
};

export type NecromancerPersistenceStatus = {
  persistenceMode: "memory" | "postgres";
  durable: boolean;
  safetyNotice: string;
  noDeleteEndpoint?: boolean;
  noAutomaticCleanup?: boolean;
};

export type NecromancerApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

async function parseJson<T>(response: Response): Promise<NecromancerApiResult<T>> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok) {
    return { ok: true, data: body as T };
  }

  const err = (body ?? {}) as { error?: string };
  return { ok: false, status: response.status, message: err.error ?? `Request failed (${response.status})` };
}

export async function fetchNecromancerCandidates(baseUrl = getApiBaseUrl()): Promise<
  NecromancerApiResult<{
    items: NecromancerCandidate[];
    totalCount: number;
    protectedCount: number;
    safetyNotice: string;
    persistenceMode: "memory" | "postgres";
    durable: boolean;
  }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/necromancer/candidates`, { cache: "no-store" });
    return parseJson(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function fetchNecromancerCandidate(
  id: string,
  baseUrl = getApiBaseUrl()
): Promise<
  NecromancerApiResult<{ candidate: NecromancerCandidate; recommendation: NecromancerRecommendation }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/necromancer/candidates/${encodeURIComponent(id)}`, {
      cache: "no-store"
    });
    return parseJson(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function prepareNecromancerCandidate(
  id: string,
  baseUrl = getApiBaseUrl()
): Promise<
  NecromancerApiResult<{
    candidate: NecromancerCandidate;
    recommendation: NecromancerRecommendation;
    actionRecord: NecromancerActionRecord;
  }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/necromancer/candidates/${encodeURIComponent(id)}/prepare`, {
      method: "POST"
    });
    return parseJson(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function runNecromancerCandidateAction(
  id: string,
  action: "pause" | "retire" | "protect",
  input: { approved: boolean; operatorId: string; reason?: string; evidenceId?: string },
  baseUrl = getApiBaseUrl()
): Promise<NecromancerApiResult<{ candidate: NecromancerCandidate; actionRecord: NecromancerActionRecord }>> {
  try {
    const response = await fetch(
      `${baseUrl}/api/necromancer/candidates/${encodeURIComponent(id)}/${action}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      }
    );
    return parseJson(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function fetchNecromancerStatus(baseUrl = getApiBaseUrl()): Promise<
  NecromancerApiResult<NecromancerPersistenceStatus>
> {
  try {
    const response = await fetch(`${baseUrl}/api/necromancer/status`, { cache: "no-store" });
    return parseJson(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function fetchNecromancerActions(baseUrl = getApiBaseUrl()): Promise<
  NecromancerApiResult<{ items: NecromancerActionRecord[]; persistenceMode: "memory" | "postgres"; durable: boolean }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/necromancer/actions`, { cache: "no-store" });
    return parseJson(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}
