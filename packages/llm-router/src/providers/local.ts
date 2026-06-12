import {
  getOllamaBaseUrl,
  normalizeOllamaModelName
} from "../ollama-config";

export type LocalModelResult = {
  provider: "ollama";
  model: string;
  output: string;
  tokensUsed: number;
  source: "ollama" | "stub";
};

export async function invokeLocalModelStub(input: {
  model: string;
  prompt: string;
}): Promise<LocalModelResult> {
  return {
    provider: "ollama",
    model: normalizeOllamaModelName(input.model),
    output: `[local-stub] ${input.prompt.slice(0, 120)}`,
    tokensUsed: Math.max(40, Math.ceil(input.prompt.length / 4)),
    source: "stub"
  };
}

export async function invokeLocalModel(input: {
  model: string;
  prompt: string;
  baseUrl?: string;
}): Promise<LocalModelResult> {
  const model = normalizeOllamaModelName(input.model);
  const baseUrl = (input.baseUrl ?? getOllamaBaseUrl()).replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: input.prompt,
        stream: false
      }),
      signal: AbortSignal.timeout(30_000)
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    const data = (await response.json()) as { response?: string; eval_count?: number };
    return {
      provider: "ollama",
      model,
      output: (data.response ?? "").trim(),
      tokensUsed: data.eval_count ?? Math.max(40, Math.ceil(input.prompt.length / 4)),
      source: "ollama"
    };
  } catch {
    return invokeLocalModelStub({ model, prompt: input.prompt });
  }
}

export async function probeOllama(baseUrl = getOllamaBaseUrl()): Promise<{
  reachable: boolean;
  models: string[];
}> {
  const root = baseUrl.replace(/\/$/, "");
  try {
    const response = await fetch(`${root}/api/tags`, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return { reachable: false, models: [] };
    const data = (await response.json()) as { models?: Array<{ name?: string }> };
    return {
      reachable: true,
      models: (data.models ?? []).map((item) => item.name ?? "").filter(Boolean)
    };
  } catch {
    return { reachable: false, models: [] };
  }
}
