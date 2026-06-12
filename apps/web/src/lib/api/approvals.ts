import type { ApprovalRequest } from "@realmos/contracts";
import { getApiBaseUrl } from "./client";

type ApproveResponse = {
  approval?: ApprovalRequest;
  toolOutcome?: {
    outcome?: string;
    result?: { output?: string; status?: string };
  };
};

export async function approveRequestViaApi(id: string): Promise<ApproveResponse | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/approvals/${id}/approve`, { method: "POST" });
    if (!response.ok) return null;
    return (await response.json()) as ApproveResponse;
  } catch {
    return null;
  }
}

export async function rejectRequestViaApi(id: string): Promise<ApprovalRequest | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/approvals/${id}/reject`, { method: "POST" });
    if (!response.ok) return null;
    return (await response.json()) as ApprovalRequest;
  } catch {
    return null;
  }
}
