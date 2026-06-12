import { describe, expect, it } from "vitest";
import type { ProposedAction } from "../src/action";
import {
  createApprovalRequestFromAction,
  createGovernanceAuditEvent,
  evaluateAction
} from "../src/kernel";

describe("governance kernel safety", () => {
  it("requires approval for subscription creation", () => {
    const decision = evaluateAction({ type: "create_subscription", title: "New SaaS plan" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for spending money", () => {
    const decision = evaluateAction({ type: "spend_money", amountUsd: 0.5, title: "Buy credits" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for sending message", () => {
    const decision = evaluateAction({ type: "send_message", title: "Email customer" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for deleting data", () => {
    const decision = evaluateAction({ type: "delete_data", title: "Delete records" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for camera access", () => {
    const decision = evaluateAction({ type: "access_camera", title: "Enable camera" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for microphone access", () => {
    const decision = evaluateAction({ type: "access_microphone", title: "Enable microphone" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for financial trade", () => {
    const decision = evaluateAction({ type: "financial_trade", title: "Paper trade" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("requires approval for permission change", () => {
    const decision = evaluateAction({ type: "change_permissions", title: "Grant terminal access" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("blocks hiding audit logs", () => {
    const decision = evaluateAction({ type: "hide_audit_logs", title: "Hide audit trail" });
    expect(decision.outcome).toBe("blocked");
  });

  it("requires approval for terminal command in MVP", () => {
    const decision = evaluateAction({ type: "terminal_command", title: "Run npm test" });
    expect(decision.outcome).toBe("requires_approval");
  });

  it("allows low-risk summary actions to pass", () => {
    const decision = evaluateAction({
      type: "other",
      title: "Summarize dashboard state",
      summary: "Read-only briefing"
    });
    expect(decision.outcome).toBe("allowed");
  });

  it("creates approval requests from gated actions", () => {
    const decision = evaluateAction({ type: "create_subscription", title: "Enable tool" });
    if (decision.outcome !== "requires_approval") throw new Error("expected approval");

    const approval = createApprovalRequestFromAction(
      { type: "create_subscription", title: "Enable tool", requestedByAgentId: "agent_jarvis" },
      decision
    );

    expect(approval.actionType).toBe("create_subscription");
    expect(approval.status).toBe("pending");
    expect(approval.requestedByAgentId).toBe("agent_jarvis");
  });

  it("creates audit events for governance decisions", () => {
    const decision = evaluateAction({ type: "hide_audit_logs", title: "Hide audit trail" });
    const audit = createGovernanceAuditEvent(decision, {
      actorType: "agent",
      actorId: "agent_jarvis"
    });

    expect(audit.eventType).toBe("policy_blocked");
    expect(audit.summary).toMatch(/blocked/i);
  });
});

describe("budget policy", () => {
  it("requires approval when spend exceeds configured threshold", () => {
    const action: ProposedAction = { type: "spend_money", amountUsd: 5, title: "Paid API call" };
    const decision = evaluateAction(action, { requiresApprovalAboveUsd: 1 });
    expect(decision.outcome).toBe("requires_approval");
  });
});
