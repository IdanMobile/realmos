import type { ModelPlatformCandidate, ModelProvider } from "@realmos/contracts";

export function createModelPlatformCandidate(input: {
  provider: ModelProvider;
  modelName: string;
  useCases?: string[];
  strengths?: string[];
  weaknesses?: string[];
  costProfile?: ModelPlatformCandidate["costProfile"];
  privacyProfile?: ModelPlatformCandidate["privacyProfile"];
  riskLevel?: ModelPlatformCandidate["riskLevel"];
  status?: ModelPlatformCandidate["status"];
  id?: string;
}): ModelPlatformCandidate {
  return {
    id: input.id ?? `model_${input.provider}_${input.modelName.replace(/[^a-z0-9]+/gi, "_")}`,
    provider: input.provider,
    modelName: input.modelName,
    useCases: input.useCases ?? [],
    strengths: input.strengths ?? [],
    weaknesses: input.weaknesses ?? [],
    toolSupport: [],
    costProfile: input.costProfile ?? "unknown",
    privacyProfile: input.privacyProfile ?? "unknown",
    riskLevel: input.riskLevel ?? "medium",
    status: input.status ?? "candidate"
  };
}

export const DEFAULT_MODEL_CANDIDATES: ModelPlatformCandidate[] = [
  createModelPlatformCandidate({
    id: "model_local_ollama_qwen",
    provider: "local_ollama",
    modelName: "qwen3.5:latest",
    useCases: ["simple_tasks", "local_privacy"],
    strengths: ["free", "local", "private"],
    weaknesses: ["limited_reasoning"],
    costProfile: "free_local",
    privacyProfile: "local",
    riskLevel: "low",
    status: "approved"
  }),
  createModelPlatformCandidate({
    id: "model_openai_gpt41_mini",
    provider: "openai",
    modelName: "gpt-4.1-mini",
    useCases: ["complex_reasoning", "coding"],
    strengths: ["quality", "tooling"],
    weaknesses: ["cost", "cloud"],
    costProfile: "medium",
    privacyProfile: "cloud_standard",
    riskLevel: "medium",
    status: "candidate"
  })
];
