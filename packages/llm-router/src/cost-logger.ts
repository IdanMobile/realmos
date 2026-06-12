import type { Budget, CostEntry, CostSummary } from "@realmos/contracts";
import { estimateTokenCost } from "./cost-estimator";
import type { CostLoggerStore } from "./types";

export function findApplicableBudget(budgets: Budget[]): Budget | undefined {
  return budgets.find((budget) => budget.scope === "global") ?? budgets[0];
}

export function estimateAndCheckApproval(input: {
  provider: "local" | "online";
  tokens: number;
  budget?: Budget;
  modelProfileThreshold?: number;
}): { amountUsd: number; requiresApproval: boolean } {
  const providerKey = input.provider === "local" ? "ollama" : "openai";
  const amountUsd = estimateTokenCost({ provider: providerKey, tokens: input.tokens });

  const budgetThreshold = input.budget?.requiresApprovalAbove;
  const profileThreshold = input.modelProfileThreshold;
  const threshold = profileThreshold ?? budgetThreshold ?? 0.5;

  if (input.provider === "local") {
    return { amountUsd, requiresApproval: false };
  }

  return {
    amountUsd,
    requiresApproval: amountUsd >= threshold
  };
}

export async function logCostEntry(
  store: CostLoggerStore,
  input: {
    amountUsd: number;
    provider: string;
    model?: string;
    businessId?: string;
    agentId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<CostEntry> {
  const entry: CostEntry = {
    id: `cost_${Date.now().toString(36)}`,
    businessId: input.businessId,
    agentId: input.agentId,
    provider: input.provider,
    model: input.model,
    amount: input.amountUsd,
    currency: "USD",
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString()
  };

  return store.createCostEntry(entry);
}

export function summarizeRecordedCost(entries: CostEntry[]): CostSummary {
  const summary: CostSummary = {
    total: 0,
    currency: "USD",
    byProvider: {},
    byBusiness: {},
    byAgent: {}
  };

  for (const entry of entries) {
    summary.total += entry.amount;
    summary.byProvider[entry.provider] = (summary.byProvider[entry.provider] ?? 0) + entry.amount;
    if (entry.businessId) {
      summary.byBusiness[entry.businessId] =
        (summary.byBusiness[entry.businessId] ?? 0) + entry.amount;
    }
    if (entry.agentId) {
      summary.byAgent[entry.agentId] = (summary.byAgent[entry.agentId] ?? 0) + entry.amount;
    }
  }

  summary.total = Number(summary.total.toFixed(4));
  return summary;
}
