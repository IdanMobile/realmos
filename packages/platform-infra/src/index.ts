export {
  FIREBASE_BASELINE_CONFIG,
  GITHUB_SOURCE_CONTROL_CONFIG,
  M1_PRO_LOCAL_NODE_CONFIG,
  OLLAMA_LOCAL_LLM_CONFIG,
  buildFirebaseBaselineConfigFromEnv,
  buildLocalNodeConfigFromEnv,
  buildOllamaRuntimeConfigFromEnv,
  type FirebaseBaselineConfig,
  type GitHubSourceControlConfig,
  type LocalNodeConfig,
  type OllamaRuntimeConfig
} from "./platform-configs";
export {
  buildFirebaseBaselineHealthSnapshot,
  getFirebaseAdminHandle,
  resetFirebaseAdminCache,
  type FirebaseAdminHandle
} from "./firebase-admin";
export {
  buildFirebaseHealthSnapshot,
  buildFirebaseRuntimeConfigFromEnv,
  buildFirebaseWebPublicConfigFromEnv,
  isFirebaseEmulatorMode,
  isFirebaseExplicitlyDisabled,
  isFirebaseWebClientConfigured,
  type FirebaseHealthSnapshot,
  type FirebaseRuntimeConfig,
  type FirebaseRuntimeMode,
  type FirebaseRuntimeStatus,
  type FirebaseServiceAvailability,
  type FirebaseWebPublicConfig
} from "./firebase-config";
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
