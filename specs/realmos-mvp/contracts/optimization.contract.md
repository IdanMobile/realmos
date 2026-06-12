# Optimization Report Contract

```ts
type OptimizationReport = {
  id: string;
  scope: "global" | "business" | "agent" | "workflow" | "tool" | "memory" | "model";
  scopeId?: string;
  summary: string;
  findings: OptimizationFinding[];
  recommendations: OptimizationRecommendation[];
  estimatedSavings?: {
    tokens?: number;
    costUsd?: number;
    timeMinutes?: number;
  };
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  createdAt: string;
};
```
