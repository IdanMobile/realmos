const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = "llama3.2:3b";

export function getOllamaBaseUrl(): string {
  return (process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
}

/** Preferred env: OLLAMA_DEFAULT_MODEL; legacy alias: REALMOS_LOCAL_MODEL */
export function getOllamaDefaultModel(): string {
  const raw =
    process.env.OLLAMA_DEFAULT_MODEL?.trim() ||
    process.env.REALMOS_LOCAL_MODEL?.trim() ||
    DEFAULT_OLLAMA_MODEL;
  return raw.replace(/^ollama\//, "");
}

export function getDefaultLocalRoutingModel(): string {
  return `ollama/${getOllamaDefaultModel()}`;
}

export function isOllamaEnabled(): boolean {
  return process.env.REALMOS_OLLAMA_ENABLED !== "false";
}

export function isOllamaOfflineFallbackEnabled(): boolean {
  return process.env.REALMOS_OLLAMA_OFFLINE_FALLBACK !== "false";
}

export function normalizeOllamaModelName(model: string): string {
  const trimmed = model.replace(/^ollama\//, "").trim();
  return trimmed || getOllamaDefaultModel();
}

export function isOllamaModelInstalled(model: string, installed: string[]): boolean {
  const normalized = normalizeOllamaModelName(model);
  const base = normalized.split(":")[0];
  return installed.some((name) => {
    if (name === normalized) return true;
    if (name.startsWith(`${normalized}:`)) return true;
    return name.split(":")[0] === base;
  });
}

export type OllamaHealthSnapshot = {
  status: "ok" | "unreachable" | "disabled";
  baseUrl: string;
  defaultModel: string;
  fallbackActive: boolean;
  defaultModelAvailable?: boolean;
  models?: string[];
};

export async function buildOllamaHealthSnapshot(
  probe: (baseUrl: string) => Promise<{ reachable: boolean; models: string[] }>
): Promise<OllamaHealthSnapshot> {
  const baseUrl = getOllamaBaseUrl();
  const defaultModel = getOllamaDefaultModel();
  const offlineFallback = isOllamaOfflineFallbackEnabled();

  if (!isOllamaEnabled()) {
    return {
      status: "disabled",
      baseUrl,
      defaultModel,
      fallbackActive: true,
      defaultModelAvailable: false,
      models: []
    };
  }

  const result = await probe(baseUrl);
  if (!result.reachable) {
    return {
      status: "unreachable",
      baseUrl,
      defaultModel,
      fallbackActive: offlineFallback,
      defaultModelAvailable: false,
      models: []
    };
  }

  const defaultModelAvailable = isOllamaModelInstalled(defaultModel, result.models);
  return {
    status: "ok",
    baseUrl,
    defaultModel,
    fallbackActive: offlineFallback && !defaultModelAvailable,
    defaultModelAvailable,
    models: result.models.slice(0, 8)
  };
}
