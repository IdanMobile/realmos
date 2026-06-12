import type { RiskLevel } from "@realmos/contracts";
import type { ProposedAction, ProposedActionType } from "./action";

const APPROVAL_REQUIRED_TYPES = new Set<ProposedActionType>([
  "create_subscription",
  "spend_money",
  "send_message",
  "delete_data",
  "terminal_command",
  "access_camera",
  "access_microphone",
  "financial_trade",
  "change_permissions",
  "use_online_model",
  "open_pr",
  "deploy"
]);

export function isApprovalRequiredType(type: ProposedActionType): boolean {
  return APPROVAL_REQUIRED_TYPES.has(type);
}

export function classifyRisk(action: ProposedAction): RiskLevel {
  if (action.type === "hide_audit_logs") return "critical";
  if (action.type === "financial_trade" || action.type === "change_permissions") return "high";
  if (action.type === "create_subscription" || action.type === "terminal_command") return "medium";
  if (action.type === "other" && action.summary) return "low";
  return "medium";
}

export function getApprovalReason(action: ProposedAction): string {
  return `Action "${action.title}" (${action.type}) requires human approval before execution.`;
}
