export type Budget = {
  id: string;
  scope: "global" | "business" | "agent" | "tool" | "model";
  scopeId: string;
  monthlyLimit?: number;
  hardLimit?: number;
  currency: "USD" | "ILS" | string;
  requiresApprovalAbove?: number;
  createdAt: string;
  updatedAt: string;
};
