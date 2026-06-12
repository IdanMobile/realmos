import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CursorWorkPacket } from "@realmos/contracts";
import {
  applyExecutorResult,
  buildLocalExecutorDispatch,
  buildLocalExecutorDispatchFromWorkPacket,
  canDispatchLocalExecutor,
  markExecutorDispatched,
  validateLocalExecutorDispatchInput,
  writeExecutorQueueArtifacts
} from "../src/executor-bridge";

const validInput = {
  realmId: "realm_realmos",
  repositoryId: "repo_realmos",
  workPacketId: "packet_test",
  allowedPaths: ["packages/**"],
  forbiddenPaths: [".env"],
  taskSummary: "Wire executor bridge",
  prompt: "Implement safe dry-run dispatch.",
  verificationCommands: ["pnpm test"]
};

describe("local executor bridge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires repository boundary fields", () => {
    const errors = validateLocalExecutorDispatchInput({
      ...validInput,
      realmId: "",
      repositoryId: "",
      allowedPaths: [],
      forbiddenPaths: [],
      verificationCommands: []
    });

    expect(errors.some((error) => error.field === "realmId")).toBe(true);
    expect(errors.some((error) => error.field === "repositoryId")).toBe(true);
    expect(errors.some((error) => error.field === "allowedPaths")).toBe(true);
    expect(errors.some((error) => error.field === "forbiddenPaths")).toBe(true);
    expect(errors.some((error) => error.field === "verificationCommands")).toBe(true);
  });

  it("blocks GUING side-project realms", () => {
    const errors = validateLocalExecutorDispatchInput({
      ...validInput,
      realmId: "realm_guing"
    });

    expect(errors.some((error) => error.message.includes("GUING"))).toBe(true);
  });

  it("rejects secret-like content in prompt", () => {
    const errors = validateLocalExecutorDispatchInput({
      ...validInput,
      prompt: "Use api_key: super-secret-value"
    });

    expect(errors.some((error) => error.field === "prompt")).toBe(true);
  });

  it("requires approval before dispatch by default", () => {
    const dispatch = buildLocalExecutorDispatch(validInput);
    expect(dispatch.requiresApproval).toBe(true);
    expect(canDispatchLocalExecutor(dispatch).allowed).toBe(false);
    expect(canDispatchLocalExecutor(dispatch, { approved: true }).allowed).toBe(true);
  });

  it("writes safe queue artifacts without shell execution", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "realmos-exec-"));
    vi.stubEnv("REALMOS_EXECUTOR_QUEUE_DIR", tempRoot);

    const dispatch = buildLocalExecutorDispatch(validInput, "exec_test");
    const artifacts = await writeExecutorQueueArtifacts(dispatch, tempRoot);

    const packetJson = JSON.parse(await readFile(artifacts.packetJsonPath, "utf8")) as {
      safety: { shellExecution: boolean; mode: string };
    };
    expect(packetJson.safety.shellExecution).toBe(false);
    expect(packetJson.safety.mode).toBe("dry_run");

    const prompt = await readFile(artifacts.promptMdPath, "utf8");
    expect(prompt).toContain("Implement safe dry-run dispatch.");

    await rm(tempRoot, { recursive: true, force: true });
  });

  it("transitions status on dispatch and result", () => {
    const dispatch = buildLocalExecutorDispatch(validInput, "exec_status");
    const dispatched = markExecutorDispatched(dispatch, "/tmp/queue/exec_status");
    expect(dispatched.status).toBe("dispatched");

    const completed = applyExecutorResult(dispatched, {
      status: "completed",
      resultSummary: "Dry-run queue written."
    });
    expect(completed.status).toBe("completed");
    expect(completed.resultSummary).toBe("Dry-run queue written.");
  });

  it("builds dispatch input from cursor work packet", () => {
    const packet: CursorWorkPacket = {
      id: "packet_abc",
      workItemId: "work_abc",
      title: "Test packet",
      status: "ready_for_cursor",
      goal: "Validate bridge",
      filesToRead: ["CURSOR_SSOT.md"],
      filesToModify: ["packages/work-loop/src/executor-bridge.ts"],
      rules: ["Follow SSOT"],
      expectedOutput: ["Tests pass"],
      stopAfter: "Verification green",
      createdByAgentId: "agent_jarvis",
      createdAt: new Date().toISOString(),
      repositoryContext: {
        repositoryBindingId: "bind_realmos",
        repoName: "realmos",
        branchName: "main",
        allowedPaths: ["packages/**"],
        forbiddenPaths: [".env"],
        verificationCommands: ["pnpm test"]
      }
    };

    const input = buildLocalExecutorDispatchFromWorkPacket(packet, {
      realmId: "realm_realmos",
      repositoryId: "repo_realmos"
    });

    expect(input.workPacketId).toBe("packet_abc");
    expect(input.verificationCommands).toContain("pnpm test");
    expect(input.allowedPaths).toContain("packages/**");
  });
});
