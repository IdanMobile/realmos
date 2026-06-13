import { describe, expect, it } from "vitest";
import { buildJarvisOperatorPrompt, buildJarvisOperatorSystemPrompt } from "../src/jarvis/operator-prompt";
import { detectUnsafeJarvisRequest } from "../src/jarvis/safety";

describe("Jarvis operator safety", () => {
  it("blocks shell execution requests", () => {
    const result = detectUnsafeJarvisRequest("Please run shell command rm -rf /");
    expect(result.blocked).toBe(true);
    expect(result.reason).toMatch(/Shell execution/i);
  });

  it("blocks Cursor CLI requests", () => {
    const result = detectUnsafeJarvisRequest("Invoke cursor cli to fix this");
    expect(result.blocked).toBe(true);
  });

  it("blocks work packet dispatch from chat", () => {
    const result = detectUnsafeJarvisRequest("Dispatch this work packet now");
    expect(result.blocked).toBe(true);
  });

  it("blocks starting GUING or side projects", () => {
    expect(detectUnsafeJarvisRequest("Start GUING now").blocked).toBe(true);
    expect(detectUnsafeJarvisRequest("Bootstrap a side project for sync agent").blocked).toBe(true);
  });

  it("allows questions about blocked side projects", () => {
    const result = detectUnsafeJarvisRequest("Are side projects blocked right now?");
    expect(result.blocked).toBe(false);
  });

  it("allows general RealmOS status questions", () => {
    expect(detectUnsafeJarvisRequest("What is the next recommended initiative?").blocked).toBe(false);
  });
});

describe("Jarvis operator prompt", () => {
  it("includes governance and no side-project rule", () => {
    const prompt = buildJarvisOperatorSystemPrompt({
      projectVersion: "0.31.0",
      nextRecommendedInitiative: "0.32 — Necromancer Verification",
      ollamaStatus: "ok",
      defaultModel: "llama3.2:3b",
      fallbackActive: false,
      executorMode: "dry_run",
      terminalEnabled: false,
      sideProjectsBlocked: true
    });

    expect(prompt).toMatch(/GUING\/side projects/i);
    expect(prompt).toMatch(/must NOT/i);
    expect(prompt).toMatch(/0\.32/);
  });

  it("wraps user message for local model prompt", () => {
    const full = buildJarvisOperatorPrompt("SYSTEM", "Hello Jarvis");
    expect(full).toContain("SYSTEM");
    expect(full).toContain("Operator: Hello Jarvis");
    expect(full).toContain("Jarvis:");
  });
});
