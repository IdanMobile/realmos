import type { ModelProvider, ModelRoutingDecision } from "@realmos/contracts";

function nowIso(): string {
  return new Date().toISOString();
}

export function createModelRoutingDecision(input: {
  useCase: string;
  selectedProvider: ModelProvider;
  selectedModel: string;
  fallbackModels?: string[];
  reason: string;
  approvalRequired?: boolean;
  maxCostPerRun?: number;
  revisitAfterDays?: number;
  id?: string;
}): ModelRoutingDecision {
  return {
    id: input.id ?? `route_${Date.now().toString(36)}`,
    useCase: input.useCase,
    selectedProvider: input.selectedProvider,
    selectedModel: input.selectedModel,
    fallbackModels: input.fallbackModels ?? [],
    reason: input.reason,
    approvalRequired: input.approvalRequired ?? false,
    maxCostPerRun: input.maxCostPerRun,
    revisitAfterDays: input.revisitAfterDays ?? 30,
    createdAt: nowIso()
  };
}

export function requiresModelChangeApproval(input: {
  currentProvider: ModelProvider;
  nextProvider: ModelProvider;
  nextCostProfile: "free_local" | "low" | "medium" | "high" | "unknown";
  sendsSensitiveData?: boolean;
}): boolean {
  if (input.sendsSensitiveData && input.nextProvider !== "local_ollama") {
    return true;
  }
  if (input.currentProvider === "local_ollama" && input.nextProvider !== "local_ollama") {
    return true;
  }
  if (input.nextCostProfile === "high") {
    return true;
  }
  return false;
}
