import { getApiBaseUrl } from "./client";

export type JarvisChatRouting = {
  provider: "ollama";
  source: "ollama" | "stub";
  model: string;
  fallbackActive: boolean;
  executeAllowed: boolean;
  blocked?: boolean;
  blockReason?: string;
};

export type JarvisChatApiResponse = {
  mode?: "operator" | "legacy";
  reply: string;
  actions: Array<{ type: string }>;
  routing?: JarvisChatRouting;
  result?: unknown;
};

export type JarvisChatResult =
  | { ok: true; data: JarvisChatApiResponse }
  | { ok: false; status: number; message: string };

export async function sendJarvisOperatorChat(
  message: string,
  baseUrl = getApiBaseUrl()
): Promise<JarvisChatResult> {
  try {
    const response = await fetch(`${baseUrl}/api/jarvis/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message,
        mode: "operator",
        execute: false
      })
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: (body as { error?: string })?.error ?? `Jarvis chat failed (${response.status})`
      };
    }

    return { ok: true, data: body as JarvisChatApiResponse };
  } catch {
    return { ok: false, status: 0, message: "API unavailable — start @realmos/api on :4100" };
  }
}
