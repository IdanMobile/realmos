import type { ProposedActionType } from "./action";

export const FORBIDDEN_ACTION_TYPES = new Set<ProposedActionType>(["hide_audit_logs"]);

export function isForbiddenAction(type: ProposedActionType): boolean {
  return FORBIDDEN_ACTION_TYPES.has(type);
}

export function getForbiddenReason(type: ProposedActionType): string {
  if (type === "hide_audit_logs") {
    return "Hiding or tampering with audit logs is forbidden.";
  }
  return "This action is forbidden by governance policy.";
}
