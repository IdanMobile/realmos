# Model / Platform Scout Contract

```ts
type ModelPlatformCandidate = {
  id: string;
  provider: "openai" | "anthropic" | "google" | "kimi" | "local_ollama" | "other";
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

type ModelRoutingDecision = {
  id: string;
  useCase: string;
  selectedProvider: string;
  selectedModel: string;
  fallbackModels: string[];
  reason: string;
  approvalRequired: boolean;
  maxCostPerRun?: number;
  revisitAfterDays: number;
  createdAt: string;
};
```
