import type {
  InfrastructureIsolationViolation,
  ProjectInfrastructurePlan,
  RealmOSPlatformDecision,
  TemporaryPrototypeInfrastructureApproval
} from "@realmos/contracts";
import {
  createDefaultGuingInfrastructurePlan,
  createDefaultPlatformDecision,
  createRealmOSPlatformResources,
  FIREBASE_BASELINE_CONFIG,
  GITHUB_SOURCE_CONTROL_CONFIG,
  M1_PRO_LOCAL_NODE_CONFIG,
  OLLAMA_LOCAL_LLM_CONFIG
} from "@realmos/platform-infra";

export function createDefaultPlatformInfraSeed() {
  return {
    platformDecision: createDefaultPlatformDecision(),
    realmOSPlatformResources: createRealmOSPlatformResources(),
    projectInfrastructurePlans: [createDefaultGuingInfrastructurePlan()],
    prototypeApprovals: [] as TemporaryPrototypeInfrastructureApproval[],
    isolationViolations: [] as InfrastructureIsolationViolation[],
    firebaseConfig: FIREBASE_BASELINE_CONFIG,
    localNodeConfig: M1_PRO_LOCAL_NODE_CONFIG,
    githubConfig: GITHUB_SOURCE_CONTROL_CONFIG,
    ollamaConfig: OLLAMA_LOCAL_LLM_CONFIG
  };
}

export type PlatformInfraStoreState = ReturnType<typeof createDefaultPlatformInfraSeed>;

export { platformInfraStore } from "./persistence/configure-operational-stores";
export type { RealmOSPlatformDecision, ProjectInfrastructurePlan };
