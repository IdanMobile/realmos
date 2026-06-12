import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildOllamaHealthSnapshot,
  getDefaultLocalRoutingModel,
  getOllamaDefaultModel,
  invokeLocalModel,
  invokeLocalModelStub,
  isOllamaModelInstalled,
  probeOllama,
  routeModelRequest
} from "../src/index";
import { DEFAULT_MODEL_PROFILE } from "../src/model-profile";

describe("ollama config and local provider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.OLLAMA_BASE_URL = "http://localhost:11434";
    process.env.OLLAMA_DEFAULT_MODEL = "llama3.2:3b";
    delete process.env.REALMOS_LOCAL_MODEL;
    delete process.env.REALMOS_OLLAMA_ENABLED;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("reads default model from OLLAMA_DEFAULT_MODEL", () => {
    expect(getOllamaDefaultModel()).toBe("llama3.2:3b");
    expect(getDefaultLocalRoutingModel()).toBe("ollama/llama3.2:3b");
  });

  it("routes local tasks to configured default model", () => {
    const decision = routeModelRequest({
      taskSummary: "Summarize this status update",
      modelProfile: DEFAULT_MODEL_PROFILE,
      complexity: "simple"
    });

    expect(decision.provider).toBe("local");
    expect(decision.model).toBe("ollama/llama3.2:3b");
  });

  it("detects installed Ollama models by name prefix", () => {
    expect(isOllamaModelInstalled("llama3.2:3b", ["llama3.2:3b"])).toBe(true);
    expect(isOllamaModelInstalled("llama3.2:3b", ["llama3.2:latest"])).toBe(true);
    expect(isOllamaModelInstalled("llama3.2:3b", ["qwen2.5:7b"])).toBe(false);
  });

  it("probeOllama returns models when /api/tags succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ models: [{ name: "llama3.2:3b" }] })
      })) as unknown as typeof fetch
    );

    const result = await probeOllama("http://localhost:11434");
    expect(result.reachable).toBe(true);
    expect(result.models).toEqual(["llama3.2:3b"]);
  });

  it("probeOllama returns unreachable on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("connection refused");
    }) as typeof fetch);

    const result = await probeOllama("http://localhost:11434");
    expect(result.reachable).toBe(false);
    expect(result.models).toEqual([]);
  });

  it("invokeLocalModel uses live Ollama when generate succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ response: "Hello from Ollama", eval_count: 12 })
      })) as unknown as typeof fetch
    );

    const result = await invokeLocalModel({
      model: "ollama/llama3.2:3b",
      prompt: "Say hello"
    });

    expect(result.source).toBe("ollama");
    expect(result.output).toBe("Hello from Ollama");
  });

  it("invokeLocalModel falls back to stub when generate fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 404
      })) as unknown as typeof fetch
    );

    const result = await invokeLocalModel({
      model: "ollama/llama3.2:3b",
      prompt: "Say hello"
    });

    expect(result.source).toBe("stub");
    expect(result.output).toContain("[local-stub]");
  });

  it("buildOllamaHealthSnapshot marks fallback when server unreachable", async () => {
    const snapshot = await buildOllamaHealthSnapshot(async () => ({
      reachable: false,
      models: []
    }));

    expect(snapshot.status).toBe("unreachable");
    expect(snapshot.fallbackActive).toBe(true);
    expect(snapshot.baseUrl).toBe("http://localhost:11434");
    expect(snapshot.defaultModel).toBe("llama3.2:3b");
  });

  it("buildOllamaHealthSnapshot marks fallback when default model missing", async () => {
    const snapshot = await buildOllamaHealthSnapshot(async () => ({
      reachable: true,
      models: ["qwen2.5:7b"]
    }));

    expect(snapshot.status).toBe("ok");
    expect(snapshot.defaultModelAvailable).toBe(false);
    expect(snapshot.fallbackActive).toBe(true);
  });

  it("invokeLocalModelStub always returns stub source", async () => {
    const result = await invokeLocalModelStub({ model: "ollama/llama3.2:3b", prompt: "Hi" });
    expect(result.source).toBe("stub");
  });
});
