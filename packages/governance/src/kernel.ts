import type { ApprovalRequest, AuditEvent } from "@realmos/contracts";
import { randomUUID } from "node:crypto";
import type { ProposedAction } from "./action";
import { requiresBudgetApproval, type BudgetPolicy } from "./budget-policy";
import { getForbiddenReason, isForbiddenAction } from "./forbidden-actions";
import { classifyRisk, getApprovalReason, isApprovalRequiredType } from "./risk-classifier";

export type GovernanceContext = BudgetPolicy;

export type GovernanceDecision =
  | { outcome: "allowed"; riskLevel: ReturnType<typeof classifyRisk> }
  | {
      outcome: "requires_approval";
      riskLevel: ReturnType<typeof classifyRisk>;
      reason: string;
    }
  | { outcome: "blocked"; reason: string };

export function evaluateAction(action: ProposedAction, context: GovernanceContext = {}): GovernanceDecision {
  if (isForbiddenAction(action.type)) {
    return { outcome: "blocked", reason: getForbiddenReason(action.type) };
  }

  const riskLevel = classifyRisk(action);

  if (isApprovalRequiredType(action.type) || requiresBudgetApproval(action, context)) {
    return {
      outcome: "requires_approval",
      riskLevel,
      reason: getApprovalReason(action)
    };
  }

  if (action.type === "other" && riskLevel === "low") {
    return { outcome: "allowed", riskLevel };
  }

  if (action.type === "other") {
    return {
      outcome: "requires_approval",
      riskLevel,
      reason: getApprovalReason(action)
    };
  }

  return { outcome: "allowed", riskLevel };
}

export function createApprovalRequestFromAction(
  action: ProposedAction,
  decision: Extract<GovernanceDecision, { outcome: "requires_approval" }>
): ApprovalRequest {
  return {
    id: `approval_${randomUUID()}`,
    requestedByAgentId: action.requestedByAgentId,
    businessId: action.businessId,
    actionType: action.type === "hide_audit_logs" ? "other" : action.type,
    riskLevel: decision.riskLevel,
    title: action.title,
    description: action.description ?? decision.reason,
    payload: action.payload ?? {},
    status: "pending",
    createdAt: new Date().toISOString()
  };
}

export function createGovernanceAuditEvent(
  decision: GovernanceDecision,
  actor: Pick<AuditEvent, "actorType" | "actorId" | "businessId" | "taskId">
): AuditEvent {
  const summary =
    decision.outcome === "blocked"
      ? `Governance blocked action: ${decision.reason}`
      : decision.outcome === "requires_approval"
        ? `Governance requires approval: ${decision.reason}`
        : "Governance allowed low-risk action";

  return {
    id: `audit_${randomUUID()}`,
    actorType: actor.actorType,
    actorId: actor.actorId,
    businessId: actor.businessId,
    taskId: actor.taskId,
    eventType: decision.outcome === "blocked" ? "policy_blocked" : "approval_requested",
    summary,
    payload: { outcome: decision.outcome },
    createdAt: new Date().toISOString()
  };
}
