import { getApiBaseUrl } from "./client";

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

export async function fetchHealthFromApi(baseUrl = getApiBaseUrl()): Promise<HealthReport | null> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as HealthReport;
  } catch {
    return null;
  }
}
