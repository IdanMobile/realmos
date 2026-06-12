export type CapabilitySource =
  | "internal"
  | "mcp_server"
  | "cursor_skill"
  | "chatgpt_skill"
  | "npm_package"
  | "python_package"
  | "github_repo"
  | "api_saas"
  | "n8n_node"
  | "n8n_template"
  | "browser_extension"
  | "cli_tool"
  | "local_app"
  | "macos_shortcut"
  | "third_party_app"
  | "custom_build";

export type CapabilityRecommendation =
  | "reuse_as_is"
  | "configure_existing"
  | "integrate_api"
  | "wrap_with_tool_adapter"
  | "automate_with_n8n"
  | "build_custom_deterministic"
  | "build_custom_agentic"
  | "reject"
  | "ask_user";

export type CapabilityCandidate = {
  id: string;
  name: string;
  source: CapabilitySource;
  url?: string;
  summary: string;
  fitScore: number;
  costProfile: "free" | "freemium" | "paid" | "unknown";
  requiresSubscription: boolean;
  requiresApproval: boolean;
  permissionsRequired: string[];
  integrationEffort: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high" | "critical";
  maintenanceSignal: "unknown" | "low" | "medium" | "high";
  recommendation: CapabilityRecommendation;
  reasoning: string;
};

export type CapabilitySearchReport = {
  id: string;
  needSummary: string;
  creationProposalId?: string;
  searchedSources: CapabilitySource[];
  candidates: CapabilityCandidate[];
  recommendation?: CapabilityCandidate;
  buildVsBuyDecision: "use_existing" | "build_custom" | "hybrid" | "ask_user";
  createdAt: string;
};
