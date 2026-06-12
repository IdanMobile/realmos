import type { ProposedAction } from "./action";

export type BudgetPolicy = {
  requiresApprovalAboveUsd?: number;
};

export function requiresBudgetApproval(action: ProposedAction, policy: BudgetPolicy): boolean {
  if (action.type !== "spend_money") return false;
  const threshold = policy.requiresApprovalAboveUsd ?? 1;
  const amount = action.amountUsd ?? 0;
  return amount >= threshold;
}
