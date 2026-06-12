import type { CapabilitySearchReport, CreationProposal, CreationType, CapabilityCandidate } from "@realmos/contracts";
import { applyApprovalRulesToCandidates, inferPermissionsFromNeed } from "./approval-rules";
import { runCapabilityScout } from "./search";

function createSensitiveNeedCandidate(needSummary: string, permissions: string[]): CapabilityCandidate {
  return {
    id: "cap_sensitive_tool",
    name: "Third-party sensitive capability",
    source: "third_party_app",
    summary: "External tool requiring sensitive permissions.",
    fitScore: 50,
    costProfile: "unknown",
    requiresSubscription: false,
    requiresApproval: false,
    permissionsRequired: permissions,
    integrationEffort: "high",
    riskLevel: "high",
    maintenanceSignal: "unknown",
    recommendation: "ask_user",
    reasoning: `Need mentions sensitive permissions: ${permissions.join(", ")}.`
  };
}

export function finalizeCapabilitySearchReport(input: {
  needSummary: string;
  creationProposalId?: string;
}): CapabilitySearchReport {
  const report = runCapabilityScout(input);
  const inferredPermissions = inferPermissionsFromNeed(input.needSummary);
  const extraCandidates =
    inferredPermissions.length > 0
      ? [createSensitiveNeedCandidate(input.needSummary, inferredPermissions)]
      : [];

  const candidates = applyApprovalRulesToCandidates([...report.candidates, ...extraCandidates]);
  const recommendation = candidates.sort((a, b) => b.fitScore - a.fitScore)[0];

  return {
    ...report,
    candidates,
    recommendation
  };
}

export function refineCreationProposalWithCapabilityScout(
  proposal: CreationProposal,
  report: CapabilitySearchReport
): CreationProposal {
  if (report.buildVsBuyDecision === "use_existing" && report.recommendation?.source === "internal") {
    return {
      ...proposal,
      recommendedCreationType: mapInternalCapabilityToCreationType(report.recommendation.id),
      proposedOwner: "deterministic_engineer",
      whyNotSimpler: `Capability Scout found internal fit: ${report.recommendation.name}.`,
      approvalRequired: report.recommendation.requiresApproval,
      updatedAt: new Date().toISOString()
    };
  }

  if (report.recommendation?.requiresApproval) {
    return {
      ...proposal,
      approvalRequired: true,
      updatedAt: new Date().toISOString()
    };
  }

  return proposal;
}

function mapInternalCapabilityToCreationType(capabilityId: string): CreationType {
  if (capabilityId === "cap_necromancer") return "ai_agent";
  if (capabilityId === "cap_business_creation") return "agentic_workflow";
  return "deterministic_module";
}
