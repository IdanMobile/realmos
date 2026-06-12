import { getApiBaseUrl } from "./client";

export type HealthReport = {
  status: "ok" | "degraded";
  service: string;
  version: string;
  timestamp: string;
  checks: {
    database: { status: "ok" | "error"; detail?: string };
    ollama: { status: "ok" | "unreachable" | "disabled"; models?: string[] };
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
