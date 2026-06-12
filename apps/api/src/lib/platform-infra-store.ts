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
  buildFirebaseBaselineConfigFromEnv,
  GITHUB_SOURCE_CONTROL_CONFIG,
  buildLocalNodeConfigFromEnv,
  buildOllamaRuntimeConfigFromEnv
} from "@realmos/platform-infra";

export function createDefaultPlatformInfraSeed() {
  return {
    platformDecision: createDefaultPlatformDecision(),
    realmOSPlatformResources: createRealmOSPlatformResources(),
    projectInfrastructurePlans: [createDefaultGuingInfrastructurePlan()],
    prototypeApprovals: [] as TemporaryPrototypeInfrastructureApproval[],
    isolationViolations: [] as InfrastructureIsolationViolation[],
    firebaseConfig: buildFirebaseBaselineConfigFromEnv(),
    localNodeConfig: buildLocalNodeConfigFromEnv(),
    githubConfig: GITHUB_SOURCE_CONTROL_CONFIG,
    ollamaConfig: buildOllamaRuntimeConfigFromEnv()
  };
}

export type PlatformInfraStoreState = ReturnType<typeof createDefaultPlatformInfraSeed>;

export { platformInfraStore } from "./persistence/configure-operational-stores";
export type { RealmOSPlatformDecision, ProjectInfrastructurePlan };
