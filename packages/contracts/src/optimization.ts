export type OptimizationScope =
  | "global"
  | "business"
  | "agent"
  | "workflow"
  | "tool"
  | "memory"
  | "model";

export type OptimizationFinding = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  evidence: string[];
};

export type OptimizationRecommendation = {
  id: string;
  title: string;
  recommendationType:
    | "reduce_tokens"
    | "reduce_cost"
    | "improve_quality"
    | "replace_agent_with_deterministic"
    | "replace_custom_with_tool"
    | "archive_memory"
    | "switch_model"
    | "add_tests"
    | "retire_agent"
    | "create_automation";
  expectedImpact: string;
  requiresApproval: boolean;
};

export type OptimizationReport = {
  id: string;
  scope: OptimizationScope;
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
