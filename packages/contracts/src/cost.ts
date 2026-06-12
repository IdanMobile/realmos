export type CostEntry = {
  id: string;
  businessId?: string;
  agentId?: string;
  runId?: string;
  provider: string;
  model?: string;
  tool?: string;
  amount: number;
  currency: "USD" | "ILS" | string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CostSummary = {
  total: number;
  currency: string;
  byProvider: Record<string, number>;
  byBusiness: Record<string, number>;
  byAgent: Record<string, number>;
};
