export type ModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "kimi"
  | "local_ollama"
  | "other";

export type ModelPlatformCandidate = {
  id: string;
  provider: ModelProvider;
  modelName: string;
  useCases: string[];
  strengths: string[];
  weaknesses: string[];
  toolSupport: string[];
  contextWindow?: number;
  costProfile: "free_local" | "low" | "medium" | "high" | "unknown";
  privacyProfile: "local" | "cloud_standard" | "enterprise" | "unknown";
  riskLevel: "low" | "medium" | "high";
  status: "candidate" | "approved" | "deprecated" | "blocked";
};

export type ModelRoutingDecision = {
  id: string;
  useCase: string;
  selectedProvider: ModelProvider;
  selectedModel: string;
  fallbackModels: string[];
  reason: string;
  approvalRequired: boolean;
  maxCostPerRun?: number;
  revisitAfterDays: number;
  createdAt: string;
};
