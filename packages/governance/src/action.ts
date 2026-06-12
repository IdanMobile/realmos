import type { ActionType } from "@realmos/contracts";

export type ForbiddenActionType = "hide_audit_logs";

export type ProposedActionType = ActionType | ForbiddenActionType;

export type ProposedAction = {
  type: ProposedActionType;
  title: string;
  description?: string;
  summary?: string;
  amountUsd?: number;
  requestedByAgentId?: string;
  businessId?: string;
  payload?: unknown;
};
