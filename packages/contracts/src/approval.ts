export type ActionType =
  | "spend_money"
  | "create_subscription"
  | "send_message"
  | "delete_data"
  | "terminal_command"
  | "access_camera"
  | "access_microphone"
  | "financial_trade"
  | "change_permissions"
  | "open_pr"
  | "deploy"
  | "use_online_model"
  | "other";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export type ApprovalRequest = {
  id: string;
  requestedByAgentId?: string;
  businessId?: string;
  actionType: ActionType;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  payload: unknown;
  status: ApprovalStatus;
  createdAt: string;
  resolvedAt?: string;
};
