# Governance Kernel — Pseudocode

## Core Function

```ts
export function evaluateAction(action: ActionRequest, actor: Agent | "user", context: ActionContext): GovernanceDecision {
  const risk = classifyActionRisk(action);

  if (isBlockedAction(action)) {
    return {
      status: "blocked",
      risk,
      reason: "Action is forbidden by RealmOS constitution."
    };
  }

  if (requiresApproval(action, risk, actor, context)) {
    return {
      status: "requires_approval",
      risk,
      approvalRequest: createApprovalRequest(action, actor, context)
    };
  }

  const budgetDecision = checkBudget(action, context.budget);

  if (budgetDecision.status !== "allowed") {
    return {
      status: "requires_approval",
      risk,
      reason: budgetDecision.reason,
      approvalRequest: createBudgetApproval(action, actor, context)
    };
  }

  return {
    status: "allowed",
    risk
  };
}
```

## Hard-Coded MVP Rules

```ts
const ALWAYS_APPROVAL_ACTIONS = [
  "spend_money",
  "create_subscription",
  "send_message",
  "delete_data",
  "access_camera",
  "access_microphone",
  "financial_trade",
  "change_permissions",
  "deploy"
];

const ALWAYS_BLOCKED_ACTIONS = [
  "hide_logs",
  "disable_audit",
  "self_grant_permissions",
  "bypass_approval_queue"
];
```

## Terminal Rule

In MVP:

```ts
terminal_command => requires approval
```

Later:

```ts
safe allowlisted commands may run after policy approval
```
