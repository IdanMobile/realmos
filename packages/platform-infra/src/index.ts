export {
  FIREBASE_BASELINE_CONFIG,
  GITHUB_SOURCE_CONTROL_CONFIG,
  M1_PRO_LOCAL_NODE_CONFIG,
  OLLAMA_LOCAL_LLM_CONFIG,
  buildLocalNodeConfigFromEnv,
  buildOllamaRuntimeConfigFromEnv,
  type FirebaseBaselineConfig,
  type GitHubSourceControlConfig,
  type LocalNodeConfig,
  type OllamaRuntimeConfig
} from "./platform-configs";
export {
  createDefaultPlatformDecision,
  createRealmOSPlatformResources
} from "./platform-defaults";
export {
  createDefaultGuingInfrastructurePlan,
  createMockPrototypeInfrastructurePlan,
  listPlanResources
} from "./project-infra-defaults";
export {
  createTemporaryPrototypeApproval,
  detectInfrastructureIsolationViolations,
  hasBlockingInfrastructureViolations,
  validatePrototypeApprovalInput,
  type PrototypeApprovalInput
} from "./isolation-checks";
export {
  enrichCursorWorkPacketWithInfrastructureBoundary,
  INFRASTRUCTURE_BOUNDARY_PACKET_RULES,
  type EnrichInfraPacketInput
} from "./cursor-packet-infra";
export { makePlatformInfraId, nowIso } from "./id";
