import type { CostEntry } from "@realmos/contracts";
import { invokeLocalModel } from "./providers/local";
import { invokeOnlineModel, OnlineModelBlockedError } from "./providers/online";
import { logCostEntry } from "./cost-logger";
import { routeModelRequest } from "./router";
import type { CostLoggerStore, RoutingDecision, RoutingRequest } from "./types";

export type ModelInvokeRequest = RoutingRequest & {
  prompt: string;
  businessId?: string;
  agentId?: string;
};

export type ModelInvokeOutcome =
  | { status: "pending_approval"; decision: RoutingDecision }
  | {
      status: "completed";
      decision: RoutingDecision;
      output: string;
      tokensUsed: number;
      estimatedCostUsd: number;
      source: "ollama" | "openai" | "stub";
      costEntry?: CostEntry;
    }
  | { status: "blocked"; decision: RoutingDecision; reason: string };

export async function invokeRoutedModel(
  store: CostLoggerStore,
  input: ModelInvokeRequest
): Promise<ModelInvokeOutcome> {
  const budgets = await store.listBudgets();
  const decision = routeModelRequest(input, budgets);

  if (decision.requiresApproval) {
    return { status: "pending_approval", decision };
  }

  try {
    if (decision.provider === "local") {
      const result = await invokeLocalModel({ model: decision.model, prompt: input.prompt });
      const costEntry = await logCostEntry(store, {
        amountUsd: decision.estimatedCostUsd,
        provider: "ollama",
        model: result.model,
        businessId: input.businessId,
        agentId: input.agentId,
        metadata: { taskSummary: input.taskSummary, modelClass: decision.modelClass, source: result.source }
      });

      return {
        status: "completed",
        decision,
        output: result.output,
        tokensUsed: result.tokensUsed,
        estimatedCostUsd: decision.estimatedCostUsd,
        source: result.source,
        costEntry
      };
    }

    const result = await invokeOnlineModel({
      model: decision.model,
      prompt: input.prompt,
      allowOnline: input.modelProfile.allowOnline
    });

    const costEntry = await logCostEntry(store, {
      amountUsd: result.estimatedCostUsd,
      provider: "openai",
      model: result.model,
      businessId: input.businessId,
      agentId: input.agentId,
      metadata: { taskSummary: input.taskSummary, modelClass: decision.modelClass, source: result.source }
    });

    return {
      status: "completed",
      decision,
      output: result.output,
      tokensUsed: result.tokensUsed,
      estimatedCostUsd: result.estimatedCostUsd,
      source: result.source,
      costEntry
    };
  } catch (error) {
    const reason =
      error instanceof OnlineModelBlockedError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Model invocation failed.";
    return { status: "blocked", decision, reason };
  }
}
