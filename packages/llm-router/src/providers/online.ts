export class OnlineModelBlockedError extends Error {
  constructor(message = "Online models are disabled for this profile.") {
    super(message);
    this.name = "OnlineModelBlockedError";
  }
}

export type OnlineModelResult = {
  provider: "openai";
  model: string;
  output: string;
  tokensUsed: number;
  estimatedCostUsd: number;
  source: "openai" | "stub";
};

function normalizeOpenAiModel(model: string): string {
  return model.replace(/^openai\//, "").trim() || "gpt-4.1-mini";
}

function isOnlineGloballyAllowed(): boolean {
  return process.env.REALMOS_ALLOW_ONLINE_MODELS === "true";
}

export async function invokeOnlineModelStub(input: {
  model: string;
  prompt: string;
  allowOnline: boolean;
}): Promise<OnlineModelResult> {
  if (!input.allowOnline) {
    throw new OnlineModelBlockedError();
  }

  const tokensUsed = Math.max(80, Math.ceil(input.prompt.length / 3));
  return {
    provider: "openai",
    model: normalizeOpenAiModel(input.model),
    output: `[online-stub] ${input.prompt.slice(0, 120)}`,
    tokensUsed,
    estimatedCostUsd: Number(((tokensUsed / 1000) * 0.002).toFixed(4)),
    source: "stub"
  };
}

export async function invokeOnlineModel(input: {
  model: string;
  prompt: string;
  allowOnline: boolean;
  apiKey?: string;
}): Promise<OnlineModelResult> {
  if (!input.allowOnline || !isOnlineGloballyAllowed()) {
    throw new OnlineModelBlockedError();
  }

  const apiKey = input.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return invokeOnlineModelStub(input);
  }

  const model = normalizeOpenAiModel(input.model);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: input.prompt }],
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(60_000)
  });

  if (!response.ok) {
    throw new Error(`OpenAI responded with ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };
  const tokensUsed = data.usage?.total_tokens ?? Math.max(80, Math.ceil(input.prompt.length / 3));

  return {
    provider: "openai",
    model,
    output: (data.choices?.[0]?.message?.content ?? "").trim(),
    tokensUsed,
    estimatedCostUsd: Number(((tokensUsed / 1000) * 0.002).toFixed(4)),
    source: "openai"
  };
}
