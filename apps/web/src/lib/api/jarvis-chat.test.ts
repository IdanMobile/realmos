import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { sendJarvisOperatorChat } from "./jarvis-chat";

describe("Jarvis chat API client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends operator mode with execute false", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          mode: "operator",
          reply: "Hello operator",
          actions: [],
          routing: {
            provider: "ollama",
            source: "ollama",
            model: "llama3.2:3b",
            fallbackActive: false,
            executeAllowed: false
          }
        }),
        { status: 200 }
      )
    );

    const result = await sendJarvisOperatorChat("What is next?", "http://localhost:4100");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.reply).toBe("Hello operator");
      expect(result.data.routing?.source).toBe("ollama");
    }

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4100/api/jarvis/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "What is next?", mode: "operator", execute: false })
      })
    );
  });

  it("returns API unavailable on network error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const result = await sendJarvisOperatorChat("Hi");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/API unavailable/i);
    }
  });
});
