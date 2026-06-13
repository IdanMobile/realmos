import { getApiBaseUrl } from "./client";
import type {
  VerificationCiMetadataInput,
  VerificationEvidenceInput,
  VerificationEvidenceRecord,
  VerificationEvidenceSummary
} from "@realmos/contracts";

export type VerificationEvidenceApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; details?: Array<{ field: string; message: string }> };

async function parseResponse<T>(response: Response): Promise<VerificationEvidenceApiResult<T>> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok) {
    return { ok: true, data: body as T };
  }

  const err = (body ?? {}) as { error?: string; details?: Array<{ field: string; message: string }> };
  return {
    ok: false,
    status: response.status,
    message: err.error ?? `Request failed (${response.status})`,
    details: err.details
  };
}

export async function fetchVerificationEvidence(query: {
  workPacketId?: string;
  runStateId?: string;
  initiativeId?: string;
}, baseUrl = getApiBaseUrl()): Promise<VerificationEvidenceApiResult<{ items: VerificationEvidenceRecord[] }>> {
  const params = new URLSearchParams();
  if (query.workPacketId) params.set("workPacketId", query.workPacketId);
  if (query.runStateId) params.set("runStateId", query.runStateId);
  if (query.initiativeId) params.set("initiativeId", query.initiativeId);

  try {
    const response = await fetch(`${baseUrl}/api/verification/evidence?${params.toString()}`, {
      cache: "no-store"
    });
    return parseResponse(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function fetchVerificationEvidenceSummary(
  query: { workPacketId?: string; runStateId?: string; initiativeId: string },
  baseUrl = getApiBaseUrl()
): Promise<VerificationEvidenceApiResult<VerificationEvidenceSummary>> {
  const params = new URLSearchParams({ initiativeId: query.initiativeId });
  if (query.workPacketId) params.set("workPacketId", query.workPacketId);
  if (query.runStateId) params.set("runStateId", query.runStateId);

  try {
    const response = await fetch(`${baseUrl}/api/verification/evidence/summary?${params.toString()}`, {
      cache: "no-store"
    });
    return parseResponse(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function attachVerificationEvidence(
  input: VerificationEvidenceInput,
  baseUrl = getApiBaseUrl()
): Promise<
  VerificationEvidenceApiResult<{ record: VerificationEvidenceRecord; summary: VerificationEvidenceSummary }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/verification/evidence`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseResponse(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}

export async function attachCiVerificationEvidence(
  input: VerificationCiMetadataInput,
  baseUrl = getApiBaseUrl()
): Promise<
  VerificationEvidenceApiResult<{ record: VerificationEvidenceRecord; summary: VerificationEvidenceSummary }>
> {
  try {
    const response = await fetch(`${baseUrl}/api/verification/evidence/ci`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseResponse(response);
  } catch {
    return { ok: false, status: 0, message: "API unavailable" };
  }
}
