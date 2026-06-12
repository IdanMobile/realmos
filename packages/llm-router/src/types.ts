import type { Budget, CostEntry, ModelClass, ModelProfile } from "@realmos/contracts";

export type RoutingRequest = {
  taskSummary: string;
  complexity?: "simple" | "complex";
  modelProfile: ModelProfile;
  estimatedTokens?: number;
};

export type RoutingDecision = {
  provider: "local" | "online";
  modelClass: ModelClass;
  model: string;
  requiresApproval: boolean;
  estimatedCostUsd: number;
  reason: string;
};

export type CostLoggerStore = {
  listBudgets(): Promise<Budget[]>;
  listCostEntries(): Promise<CostEntry[]>;
  createCostEntry(entry: CostEntry): Promise<CostEntry>;
};
