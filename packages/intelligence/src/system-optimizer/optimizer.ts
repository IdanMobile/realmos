import type { OptimizationReport } from "@realmos/contracts";
import {
  createOptimizationFinding,
  createOptimizationRecommendation,
  createOptimizationReport
} from "../contracts/optimization-report";

export type OptimizerInput = {
  scope: OptimizationReport["scope"];
  scopeId?: string;
  communicationBlockerCount?: number;
  communicationErrorCount?: number;
  openThreadCount?: number;
  tokenBaseline?: number;
  tokenPackEstimate?: number;
  onlineCostUsd?: number;
};

export function runSystemOptimizer(input: OptimizerInput): OptimizationReport {
  const findings = [];
  const recommendations = [];

  if ((input.communicationBlockerCount ?? 0) > 0) {
    findings.push(
      createOptimizationFinding({
        title: "Communication blockers detected",
        severity: "medium",
        evidence: [`blocker_count=${input.communicationBlockerCount}`]
      })
    );
    recommendations.push(
      createOptimizationRecommendation({
        title: "Resolve blocker threads before expanding agent work",
        recommendationType: "improve_quality",
        expectedImpact: "Reduces stalled workflows and duplicate agent effort.",
        requiresApproval: false
      })
    );
  }

  if ((input.tokenBaseline ?? 0) > 0 && (input.tokenPackEstimate ?? 0) > 0) {
    const savings = Math.max(0, (input.tokenBaseline ?? 0) - (input.tokenPackEstimate ?? 0));
    if (savings > 100) {
      findings.push(
        createOptimizationFinding({
          title: "Context pack reduces token usage",
          severity: "low",
          evidence: [
            `baseline_tokens=${input.tokenBaseline}`,
            `pack_tokens=${input.tokenPackEstimate}`,
            `savings=${savings}`
          ]
        })
      );
      recommendations.push(
        createOptimizationRecommendation({
          title: "Prefer context packs over full memory dumps",
          recommendationType: "reduce_tokens",
          expectedImpact: `Estimated ${savings} token savings per run.`,
          requiresApproval: false
        })
      );
    }
  }

  if ((input.onlineCostUsd ?? 0) >= 0.5) {
    findings.push(
      createOptimizationFinding({
        title: "Online model spend elevated",
        severity: "high",
        evidence: [`online_cost_usd=${input.onlineCostUsd}`]
      })
    );
    recommendations.push(
      createOptimizationRecommendation({
        title: "Review online model routing thresholds",
        recommendationType: "switch_model",
        expectedImpact: "May reduce recurring online inference cost.",
        requiresApproval: true
      })
    );
  }

  const estimatedSavings =
    input.tokenBaseline && input.tokenPackEstimate
      ? {
          tokens: Math.max(0, input.tokenBaseline - input.tokenPackEstimate),
          costUsd: input.onlineCostUsd
        }
      : undefined;

  return createOptimizationReport({
    scope: input.scope,
    scopeId: input.scopeId,
    summary:
      recommendations.length > 0
        ? `System Optimizer found ${findings.length} findings and ${recommendations.length} recommendations.`
        : "System Optimizer found no actionable improvements.",
    findings,
    recommendations,
    estimatedSavings,
    riskLevel: recommendations.some((item) => item.requiresApproval) ? "medium" : "low"
  });
}
