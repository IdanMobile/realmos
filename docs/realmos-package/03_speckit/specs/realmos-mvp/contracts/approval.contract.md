# Approval Request Contract

```ts
type ApprovalRequest = {
  id: string;
  requestedByAgentId?: string;
  businessId?: string;
  actionType:
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
    | "other";
  riskLevel: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  payload: unknown;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: string;
  resolvedAt?: string;
};
```
