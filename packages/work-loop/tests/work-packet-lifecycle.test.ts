import { describe, expect, it } from "vitest";
import {
  approveWorkPacketLifecycle,
  attachWorkPacketVerification,
  buildExecutorDispatchInputFromLifecycle,
  buildWorkPacketLifecycle,
  canTransitionWorkPacketLifecycle,
  closeWorkPacketLifecycle,
  markWorkPacketDispatched,
  markWorkPacketReadyForApproval,
  recordWorkPacketExecutorResult,
  validateWorkPacketLifecycleInput,
  validateWorkPacketLifecycleReadiness
} from "../src/work-packet-lifecycle";
import { canDispatchLocalExecutor, buildLocalExecutorDispatch, validateLocalExecutorDispatchInput } from "../src/executor-bridge";

const validInput = {
  realmId: "realm_realmos",
  repositoryId: "repo_realmos",
  allowedPaths: ["packages/**"],
  forbiddenPaths: [".env"],
  objective: "Wire work packet lifecycle",
  instructions: "Implement safe dry-run lifecycle orchestration.",
  verificationCommands: ["pnpm test", "pnpm typecheck"],
  expectedArtifacts: ["lifecycle service", "API routes"]
};

function readyPacket() {
  const packet = buildWorkPacketLifecycle(validInput, "wpl_test");
  const { packet: ready } = markWorkPacketReadyForApproval({
    ...packet,
    expectedArtifacts: validInput.expectedArtifacts
  });
  return ready;
}

function approvedPacket() {
  const ready = readyPacket();
  const { packet: approved } = approveWorkPacketLifecycle(ready);
  return approved;
}

describe("work packet lifecycle", () => {
  it("requires repository boundary and verification fields on create", () => {
    const errors = validateWorkPacketLifecycleInput({
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
    const errors = validateWorkPacketLifecycleInput({
      ...validInput,
      realmId: "realm_guing"
    });

    expect(errors.some((error) => error.message.includes("GUING"))).toBe(true);
  });

  it("rejects secret-like content in instructions", () => {
    const errors = validateWorkPacketLifecycleInput({
      ...validInput,
      instructions: "Use api_key: super-secret-value"
    });

    expect(errors.some((error) => error.field === "instructions")).toBe(true);
  });

  it("blocks production deployment verification commands", () => {
    const errors = validateWorkPacketLifecycleInput({
      ...validInput,
      verificationCommands: ["firebase deploy"]
    });

    expect(errors.some((error) => error.field === "verificationCommands")).toBe(true);
  });

  it("fails readiness without expected artifacts", () => {
    const packet = buildWorkPacketLifecycle(
      {
        realmId: validInput.realmId,
        repositoryId: validInput.repositoryId,
        allowedPaths: validInput.allowedPaths,
        forbiddenPaths: validInput.forbiddenPaths,
        objective: validInput.objective,
        instructions: validInput.instructions,
        verificationCommands: validInput.verificationCommands
      },
      "wpl_readiness"
    );
    const errors = validateWorkPacketLifecycleReadiness(packet);
    expect(errors.some((error) => error.field === "expectedArtifacts")).toBe(true);
  });

  it("marks packet ready for approval when valid", () => {
    const packet = buildWorkPacketLifecycle(
      { ...validInput, expectedArtifacts: validInput.expectedArtifacts },
      "wpl_ready"
    );
    const { packet: ready, errors } = markWorkPacketReadyForApproval(packet);
    expect(errors).toHaveLength(0);
    expect(ready.status).toBe("ready_for_approval");
  });

  it("requires approval before dispatch through executor bridge", () => {
    const ready = readyPacket();
    expect(ready.status).toBe("ready_for_approval");

    const dispatchInput = buildExecutorDispatchInputFromLifecycle(ready);
    const validationErrors = validateLocalExecutorDispatchInput(dispatchInput);
    expect(validationErrors).toHaveLength(0);

    const dispatch = buildLocalExecutorDispatch(dispatchInput);
    expect(canDispatchLocalExecutor(dispatch).allowed).toBe(false);

    const approved = approvedPacket();
    const approvedDispatchInput = buildExecutorDispatchInputFromLifecycle(approved);
    const approvedDispatch = buildLocalExecutorDispatch(approvedDispatchInput);
    expect(canDispatchLocalExecutor(approvedDispatch, { approved: true }).allowed).toBe(true);
  });

  it("rejects invalid lifecycle transitions", () => {
    const packet = buildWorkPacketLifecycle(validInput, "wpl_transition");
    expect(canTransitionWorkPacketLifecycle(packet, "completed").allowed).toBe(false);
    expect(canTransitionWorkPacketLifecycle(packet, "ready_for_approval").allowed).toBe(true);
  });

  it("records executor result and moves to verification pending", () => {
    let packet = approvedPacket();
    packet = markWorkPacketDispatched(packet, "exec_lifecycle_test");
    expect(packet.status).toBe("awaiting_result");

    const { packet: withResult, errors } = recordWorkPacketExecutorResult(packet, {
      status: "completed",
      resultSummary: "Dry-run queue artifact written."
    });
    expect(errors).toHaveLength(0);
    expect(withResult.status).toBe("verification_pending");
    expect(withResult.resultId).toBeTruthy();
  });

  it("attaches verification and closes as completed", () => {
    let packet = approvedPacket();
    packet = markWorkPacketDispatched(packet, "exec_verify_test");
    const { packet: withResult } = recordWorkPacketExecutorResult(packet, {
      status: "completed",
      resultSummary: "Done."
    });

    const { packet: verified, errors: verifyErrors } = attachWorkPacketVerification(withResult, {
      reportedStatus: "pass",
      outputSummary: "pnpm test passed",
      artifactsSummary: "lifecycle service added"
    });
    expect(verifyErrors).toHaveLength(0);
    expect(verified.status).toBe("verified");

    const { packet: closed, errors: closeErrors } = closeWorkPacketLifecycle(verified, {
      status: "completed",
      handoffUpdated: true
    });
    expect(closeErrors).toHaveLength(0);
    expect(closed.status).toBe("completed");
    expect(closed.handoffUpdated).toBe(true);
  });

  it("does not invoke shell execution in lifecycle helpers", () => {
    const packet = approvedPacket();
    const dispatchInput = buildExecutorDispatchInputFromLifecycle(packet);
    expect(dispatchInput.prompt).toContain("Dry-run queue only");
    expect(JSON.stringify(dispatchInput)).not.toContain('"shellExecution": true');
  });
});
