import type { CapabilityCandidate } from "@realmos/contracts";

const SENSITIVE_PERMISSIONS = new Set([
  "camera",
  "microphone",
  "filesystem_write",
  "terminal",
  "email_send",
  "browser_automation",
  "financial_access",
  "contacts",
  "location"
]);

export function inferPermissionsFromNeed(needSummary: string): string[] {
  const text = needSummary.toLowerCase();
  return [...SENSITIVE_PERMISSIONS].filter((permission) => {
    if (permission === "browser_automation") {
      return text.includes("browser automation") || text.includes("browser_automation");
    }
    return text.includes(permission.replace("_", " ")) || text.includes(permission);
  });
}

export function applyCapabilityApprovalRules(candidate: CapabilityCandidate): CapabilityCandidate {
  const sensitivePermissions = candidate.permissionsRequired.filter((permission) =>
    SENSITIVE_PERMISSIONS.has(permission.toLowerCase())
  );

  const requiresApproval =
    candidate.requiresSubscription ||
    candidate.costProfile === "paid" ||
    sensitivePermissions.length > 0 ||
    candidate.riskLevel === "high" ||
    candidate.riskLevel === "critical";

  return {
    ...candidate,
    requiresApproval,
    permissionsRequired: sensitivePermissions.length > 0 ? sensitivePermissions : candidate.permissionsRequired
  };
}

export function applyApprovalRulesToCandidates(candidates: CapabilityCandidate[]): CapabilityCandidate[] {
  return candidates.map(applyCapabilityApprovalRules);
}

export function createPaidToolCandidate(input: {
  name: string;
  summary: string;
  permissionsRequired?: string[];
}): CapabilityCandidate {
  return applyCapabilityApprovalRules({
    id: `cap_paid_${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name: input.name,
    source: "api_saas",
    summary: input.summary,
    fitScore: 70,
    costProfile: "paid",
    requiresSubscription: true,
    requiresApproval: false,
    permissionsRequired: input.permissionsRequired ?? [],
    integrationEffort: "medium",
    riskLevel: "medium",
    maintenanceSignal: "unknown",
    recommendation: "integrate_api",
    reasoning: "Paid SaaS tools require explicit approval before adoption."
  });
}
