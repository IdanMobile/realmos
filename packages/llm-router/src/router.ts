import type { ModelClass } from "@realmos/contracts";
import { estimateRoutingCost } from "./cost-estimator";
import { estimateAndCheckApproval, findApplicableBudget, logCostEntry } from "./cost-logger";
import type { CostLoggerStore, RoutingDecision, RoutingRequest } from "./types";

function inferComplexity(taskSummary: string, explicit?: RoutingRequest["complexity"]): "simple" | "complex" {
  if (explicit) return explicit;
  const text = taskSummary.toLowerCase();
  if (/(summarize|label|classify|simple|route|status)/.test(text)) return "simple";
  if (/(architect|strategy|spec|reason|complex|design)/.test(text)) return "complex";
  return "simple";
}

function selectModelClass(complexity: "simple" | "complex", allowOnline: boolean): ModelClass {
  if (complexity === "complex" && allowOnline) return "online_reasoning";
  return "local_simple";
}

export function routeModelRequest(
  input: RoutingRequest,
  budgets: Parameters<typeof findApplicableBudget>[0] = []
): RoutingDecision {
  const complexity = inferComplexity(input.taskSummary, input.complexity);
  const budget = findApplicableBudget(budgets);
  const estimatedTokens = input.estimatedTokens ?? (complexity === "complex" ? 2000 : 600);

  if (complexity === "complex" && !input.modelProfile.allowOnline) {
    const amountUsd = estimateRoutingCost({ provider: "local", estimatedTokens });
    return {
      provider: "local",
      modelClass: "local_simple",
      model: "ollama/qwen3.5:latest",
      requiresApproval: false,
      estimatedCostUsd: amountUsd,
      reason: "Online models disabled; falling back to local model."
    };
  }

  const provider = complexity === "simple" || !input.modelProfile.allowOnline ? "local" : "online";
  const modelClass = selectModelClass(complexity, input.modelProfile.allowOnline);
  const model = provider === "local" ? "ollama/qwen3.5:latest" : "openai/gpt-4.1-mini";
  const { amountUsd, requiresApproval } = estimateAndCheckApproval({
    provider,
    tokens: estimatedTokens,
    budget,
    modelProfileThreshold: input.modelProfile.requiresApprovalAboveCost
  });

  return {
    provider,
    modelClass,
    model,
    requiresApproval,
    estimatedCostUsd: amountUsd,
    reason:
      provider === "local"
        ? "Simple or local-only task routed to local model."
        : "Complex task routed to online model with cost controls."
  };
}

export async function routeAndLogCost(
  store: CostLoggerStore,
  input: RoutingRequest & { businessId?: string; agentId?: string }
): Promise<{ decision: RoutingDecision; costEntry?: import("@realmos/contracts").CostEntry }> {
  const budgets = await store.listBudgets();
  const decision = routeModelRequest(input, budgets);

  if (decision.requiresApproval) {
    return { decision };
  }

  const costEntry = await logCostFromDecision(store, decision, input);
  return { decision, costEntry };
}

async function logCostFromDecision(
  store: CostLoggerStore,
  decision: RoutingDecision,
  input: { businessId?: string; agentId?: string; taskSummary: string }
) {
  return logCostEntry(store, {
    amountUsd: decision.estimatedCostUsd,
    provider: decision.provider === "local" ? "ollama" : "openai",
    model: decision.model,
    businessId: input.businessId,
    agentId: input.agentId,
    metadata: { taskSummary: input.taskSummary, modelClass: decision.modelClass }
  });
}

export { invokeLocalModelStub } from "./providers/local";
export { invokeOnlineModelStub, OnlineModelBlockedError } from "./providers/online";
