import type { ModelPlatformCandidate } from "@realmos/contracts";
import { DEFAULT_MODEL_CANDIDATES } from "../contracts/model-platform-candidate";
import {
  createModelRoutingDecision,
  requiresModelChangeApproval
} from "../contracts/model-routing-decision";

export type ModelScoutInput = {
  useCase: string;
  preferLocal?: boolean;
  allowPaid?: boolean;
  sendsSensitiveData?: boolean;
  currentProvider?: ModelPlatformCandidate["provider"];
};

export function listModelPlatformCandidates(): ModelPlatformCandidate[] {
  return [...DEFAULT_MODEL_CANDIDATES];
}

export function scoutModelForUseCase(input: ModelScoutInput) {
  const candidates = listModelPlatformCandidates().filter((candidate) => {
    if (candidate.status === "blocked" || candidate.status === "deprecated") {
      return false;
    }
    if (input.preferLocal && candidate.provider !== "local_ollama") {
      return false;
    }
    if (!input.allowPaid && candidate.costProfile !== "free_local" && candidate.costProfile !== "low") {
      return false;
    }
    if (input.useCase && candidate.useCases.length > 0) {
      return candidate.useCases.some((useCase) => input.useCase.includes(useCase.split("_")[0] ?? useCase));
    }
    return true;
  });

  const ranked = [...candidates].sort((a, b) => {
    if (a.status === "approved" && b.status !== "approved") return -1;
    if (b.status === "approved" && a.status !== "approved") return 1;
    return a.riskLevel.localeCompare(b.riskLevel);
  });

  const selected = ranked[0] ?? DEFAULT_MODEL_CANDIDATES[0];
  const approvalRequired = requiresModelChangeApproval({
    currentProvider: input.currentProvider ?? "local_ollama",
    nextProvider: selected.provider,
    nextCostProfile: selected.costProfile,
    sendsSensitiveData: input.sendsSensitiveData
  });

  const decision = createModelRoutingDecision({
    useCase: input.useCase,
    selectedProvider: selected.provider,
    selectedModel: selected.modelName,
    fallbackModels: ranked.slice(1, 3).map((item) => item.modelName),
    reason: approvalRequired
      ? "Model/platform change requires approval before activation."
      : `Selected ${selected.provider}/${selected.modelName} for ${input.useCase}.`,
    approvalRequired,
    maxCostPerRun: selected.costProfile === "high" ? 2 : 0.5
  });

  return { candidates: ranked, decision, selected };
}
