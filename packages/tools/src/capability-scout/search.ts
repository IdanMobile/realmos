import type {
  CapabilityCandidate,
  CapabilitySearchReport,
  CapabilitySource
} from "@realmos/contracts";

type InternalCapability = {
  id: string;
  name: string;
  source: CapabilitySource;
  summary: string;
  keywords: string[];
  costProfile: CapabilityCandidate["costProfile"];
  permissionsRequired: string[];
  integrationEffort: CapabilityCandidate["integrationEffort"];
  recommendation: CapabilityCandidate["recommendation"];
};

const INTERNAL_CAPABILITIES: InternalCapability[] = [
  {
    id: "cap_governance",
    name: "Governance Kernel",
    source: "internal",
    summary: "Approval gates, forbidden actions, and audit for risky operations.",
    keywords: ["approval", "permission", "policy", "governance", "audit", "risk"],
    costProfile: "free",
    permissionsRequired: [],
    integrationEffort: "low",
    recommendation: "reuse_as_is"
  },
  {
    id: "cap_necromancer",
    name: "Necromancer Agent Templates",
    source: "internal",
    summary: "Default business agent team and lifecycle-managed custom agents.",
    keywords: ["agent", "team", "ceo", "pm", "necromancer", "lifecycle"],
    costProfile: "free",
    permissionsRequired: [],
    integrationEffort: "low",
    recommendation: "reuse_as_is"
  },
  {
    id: "cap_business_creation",
    name: "Business Creation Flow",
    source: "internal",
    summary: "Create ecosystem businesses from Jarvis ideas with tasks and memory.",
    keywords: ["business", "idea", "jarvis", "ecosystem", "startup"],
    costProfile: "free",
    permissionsRequired: [],
    integrationEffort: "low",
    recommendation: "reuse_as_is"
  },
  {
    id: "cap_memory",
    name: "Scoped Memory Store",
    source: "internal",
    summary: "Global, business, agent, and task scoped memory with audit trails.",
    keywords: ["memory", "remember", "decision", "summary", "knowledge"],
    costProfile: "free",
    permissionsRequired: [],
    integrationEffort: "low",
    recommendation: "reuse_as_is"
  }
];

function scoreFit(needSummary: string, capability: InternalCapability): number {
  const text = needSummary.toLowerCase();
  const hits = capability.keywords.filter((keyword) => text.includes(keyword)).length;
  if (hits === 0) return 0;
  return Math.min(100, 40 + hits * 15);
}

export function searchInternalCapabilities(needSummary: string): CapabilityCandidate[] {
  return INTERNAL_CAPABILITIES.map((capability) => {
    const fitScore = scoreFit(needSummary, capability);
    return {
      id: capability.id,
      name: capability.name,
      source: capability.source,
      summary: capability.summary,
      fitScore,
      costProfile: capability.costProfile,
      requiresSubscription: false,
      requiresApproval: false,
      permissionsRequired: capability.permissionsRequired,
      integrationEffort: capability.integrationEffort,
      riskLevel: "low" as const,
      maintenanceSignal: "low" as const,
      recommendation: capability.recommendation,
      reasoning:
        fitScore > 0
          ? `Internal capability matches ${fitScore}% of the stated need keywords.`
          : "No strong keyword overlap with this internal capability."
    };
  }).filter((candidate) => candidate.fitScore > 0);
}

export function createPackageCandidate(needSummary: string): CapabilityCandidate | undefined {
  const text = needSummary.toLowerCase();
  if (!/(package|npm|library|dependency|plugin)/.test(text)) {
    return undefined;
  }

  return {
    id: "cap_npm_package",
    name: "Evaluate npm package",
    source: "npm_package",
    summary: "Search npm for an existing package before building custom code.",
    fitScore: 55,
    costProfile: "unknown",
    requiresSubscription: false,
    requiresApproval: false,
    permissionsRequired: [],
    integrationEffort: "medium",
    riskLevel: "medium",
    maintenanceSignal: "unknown",
    recommendation: "integrate_api",
    reasoning: "Package-related need should evaluate existing libraries first."
  };
}

export function runCapabilityScout(input: {
  needSummary: string;
  creationProposalId?: string;
}): CapabilitySearchReport {
  const internalCandidates = searchInternalCapabilities(input.needSummary);
  const packageCandidate = createPackageCandidate(input.needSummary);
  const candidates = [...internalCandidates, ...(packageCandidate ? [packageCandidate] : [])].sort(
    (a, b) => b.fitScore - a.fitScore
  );

  const recommendation = candidates[0];
  const slug = input.needSummary.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24);

  return {
    id: `cap_report_${slug}_${Date.now().toString(36)}`,
    needSummary: input.needSummary,
    creationProposalId: input.creationProposalId,
    searchedSources: ["internal", "npm_package"],
    candidates,
    recommendation,
    buildVsBuyDecision: decideBuildVsBuy(candidates),
    createdAt: new Date().toISOString()
  };
}

function decideBuildVsBuy(
  candidates: CapabilityCandidate[]
): CapabilitySearchReport["buildVsBuyDecision"] {
  const top = candidates[0];
  if (!top) return "build_custom";
  if (top.source === "internal" && top.fitScore >= 75) return "use_existing";
  if (top.fitScore >= 60 && top.costProfile === "free") return "use_existing";
  if (top.fitScore >= 45) return "hybrid";
  return "build_custom";
}
