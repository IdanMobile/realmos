import type {
  OptimizationFinding,
  OptimizationRecommendation,
  OptimizationReport,
  OptimizationScope
} from "@realmos/contracts";

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createOptimizationReport(input: {
  scope: OptimizationScope;
  scopeId?: string;
  summary: string;
  findings?: OptimizationFinding[];
  recommendations?: OptimizationRecommendation[];
  estimatedSavings?: OptimizationReport["estimatedSavings"];
  riskLevel?: OptimizationReport["riskLevel"];
  id?: string;
}): OptimizationReport {
  const recommendations = input.recommendations ?? [];
  const requiresApproval =
    recommendations.some((item) => item.requiresApproval) ||
    input.riskLevel === "high" ||
    input.riskLevel === "critical";

  return {
    id: input.id ?? makeId("opt"),
    scope: input.scope,
    scopeId: input.scopeId,
    summary: input.summary,
    findings: input.findings ?? [],
    recommendations,
    estimatedSavings: input.estimatedSavings,
    riskLevel: input.riskLevel ?? "low",
    requiresApproval,
    createdAt: nowIso()
  };
}

export function createOptimizationFinding(input: {
  title: string;
  severity: OptimizationFinding["severity"];
  evidence: string[];
  id?: string;
}): OptimizationFinding {
  return {
    id: input.id ?? makeId("finding"),
    title: input.title,
    severity: input.severity,
    evidence: input.evidence
  };
}

export function createOptimizationRecommendation(input: {
  title: string;
  recommendationType: OptimizationRecommendation["recommendationType"];
  expectedImpact: string;
  requiresApproval?: boolean;
  id?: string;
}): OptimizationRecommendation {
  return {
    id: input.id ?? makeId("rec"),
    title: input.title,
    recommendationType: input.recommendationType,
    expectedImpact: input.expectedImpact,
    requiresApproval: input.requiresApproval ?? false
  };
}
