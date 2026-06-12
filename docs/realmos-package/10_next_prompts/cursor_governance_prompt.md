# Cursor Prompt — Implement Governance v0

Implement the first version of the RealmOS Governance Kernel.

Create:

```text
/packages/governance/src/risk-classifier.ts
/packages/governance/src/policies.ts
/packages/governance/src/approval-required.ts
/packages/governance/src/budget-policy.ts
/packages/governance/src/governance-kernel.ts
/packages/governance/src/index.ts
```

Behavior:

1. classifyActionRisk(action)
2. isActionForbiddenWithoutApproval(action)
3. requiresApproval(action, actor, context)
4. checkBudget(action, budget)
5. createApprovalRequestFromAction(action)

Hard rules:

- spending money requires approval unless already approved and under explicit budget
- creating subscriptions always requires explicit user approval
- messaging humans requires approval
- deleting data requires approval
- camera/mic access requires approval
- crypto/financial trading requires approval
- changing permissions requires approval
- disabling/hiding logs is blocked
- agents cannot grant themselves permissions

Add tests for:

- subscription always approval
- terminal command requires approval in MVP
- low-risk summary does not require approval
- permission change requires approval
- hiding logs is blocked
