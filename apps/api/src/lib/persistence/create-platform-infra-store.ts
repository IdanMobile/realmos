import type {
  InfrastructureIsolationViolation,
  InfrastructureResourceRef,
  ProjectInfrastructurePlan,
  RealmOSPlatformDecision,
  TemporaryPrototypeInfrastructureApproval
} from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";
import {
  createDefaultPlatformInfraSeed,
  type PlatformInfraStoreState
} from "../platform-infra-store";

export type PlatformInfraStore = {
  getPlatformDecision(): Promise<RealmOSPlatformDecision>;
  listProjectInfrastructurePlans(): Promise<ProjectInfrastructurePlan[]>;
  getProjectInfrastructurePlan(id: string): Promise<ProjectInfrastructurePlan | null>;
  getProjectInfrastructurePlanByRealm(realmId: string): Promise<ProjectInfrastructurePlan | null>;
  listPrototypeApprovals(): Promise<TemporaryPrototypeInfrastructureApproval[]>;
  appendPrototypeApproval(approval: TemporaryPrototypeInfrastructureApproval): Promise<TemporaryPrototypeInfrastructureApproval>;
  listIsolationViolations(): Promise<InfrastructureIsolationViolation[]>;
  setIsolationViolations(violations: InfrastructureIsolationViolation[]): Promise<InfrastructureIsolationViolation[]>;
  getPlatformInfraConsole(): Promise<PlatformInfraStoreState>;
  resetFromSeed(seed: Partial<PlatformInfraStoreState>): Promise<void>;
};

export function createPlatformInfraStore(adapter: OperationalPersistenceAdapter): PlatformInfraStore {
  async function ensureDefaults(): Promise<PlatformInfraStoreState> {
    const defaults = createDefaultPlatformInfraSeed();
    const decision = await adapter.readOne<RealmOSPlatformDecision>(
      OperationalTables.platformDecision,
      defaults.platformDecision.id
    );
    if (decision) {
      const resources = await adapter.readTable<InfrastructureResourceRef>(
        OperationalTables.platformResources
      );
      return {
        platformDecision: decision,
        realmOSPlatformResources: resources.length > 0 ? resources : defaults.realmOSPlatformResources,
        projectInfrastructurePlans: await adapter.readTable(OperationalTables.projectInfrastructurePlans),
        prototypeApprovals: await adapter.readTable(OperationalTables.prototypeApprovals),
        isolationViolations: await adapter.readTable(OperationalTables.isolationViolations),
        firebaseConfig: defaults.firebaseConfig,
        localNodeConfig: defaults.localNodeConfig,
        githubConfig: defaults.githubConfig,
        ollamaConfig: defaults.ollamaConfig
      };
    }
    await adapter.upsertOne(OperationalTables.platformDecision, defaults.platformDecision);
    await adapter.replaceTable(OperationalTables.platformResources, defaults.realmOSPlatformResources);
    await adapter.replaceTable(
      OperationalTables.projectInfrastructurePlans,
      defaults.projectInfrastructurePlans
    );
    return defaults;
  }

  return {
    async getPlatformDecision() {
      const defaults = createDefaultPlatformInfraSeed();
      const decision = await adapter.readOne<RealmOSPlatformDecision>(
        OperationalTables.platformDecision,
        defaults.platformDecision.id
      );
      return structuredClone(decision ?? (await ensureDefaults()).platformDecision);
    },
    async listProjectInfrastructurePlans() {
      const plans = await adapter.readTable<ProjectInfrastructurePlan>(
        OperationalTables.projectInfrastructurePlans
      );
      return structuredClone(plans.length > 0 ? plans : (await ensureDefaults()).projectInfrastructurePlans);
    },
    getProjectInfrastructurePlan: (id) =>
      adapter.readOne<ProjectInfrastructurePlan>(OperationalTables.projectInfrastructurePlans, id),
    async getProjectInfrastructurePlanByRealm(realmId) {
      const plans = await this.listProjectInfrastructurePlans();
      return plans.find((plan) => plan.realmId === realmId) ?? null;
    },
    listPrototypeApprovals: () =>
      adapter.readTable<TemporaryPrototypeInfrastructureApproval>(OperationalTables.prototypeApprovals),
    appendPrototypeApproval: (approval) =>
      adapter.upsertOne(OperationalTables.prototypeApprovals, approval),
    listIsolationViolations: () =>
      adapter.readTable<InfrastructureIsolationViolation>(OperationalTables.isolationViolations),
    async setIsolationViolations(violations) {
      await adapter.replaceTable(OperationalTables.isolationViolations, violations);
      return violations;
    },
    async getPlatformInfraConsole() {
      const state = await ensureDefaults();
      const [
        platformDecision,
        realmOSPlatformResources,
        projectInfrastructurePlans,
        prototypeApprovals,
        isolationViolations
      ] = await Promise.all([
        this.getPlatformDecision(),
        adapter.readTable<InfrastructureResourceRef>(OperationalTables.platformResources),
        this.listProjectInfrastructurePlans(),
        this.listPrototypeApprovals(),
        this.listIsolationViolations()
      ]);
      return {
        platformDecision: structuredClone(platformDecision),
        realmOSPlatformResources: structuredClone(
          realmOSPlatformResources.length > 0 ? realmOSPlatformResources : state.realmOSPlatformResources
        ),
        projectInfrastructurePlans: structuredClone(projectInfrastructurePlans),
        prototypeApprovals: structuredClone(prototypeApprovals),
        isolationViolations: structuredClone(isolationViolations),
        firebaseConfig: structuredClone(state.firebaseConfig),
        localNodeConfig: structuredClone(state.localNodeConfig),
        githubConfig: structuredClone(state.githubConfig),
        ollamaConfig: structuredClone(state.ollamaConfig)
      };
    },
    async resetFromSeed(seed) {
      const defaults = createDefaultPlatformInfraSeed();
      await adapter.upsertOne(
        OperationalTables.platformDecision,
        seed.platformDecision ?? defaults.platformDecision
      );
      await adapter.replaceTable(
        OperationalTables.platformResources,
        seed.realmOSPlatformResources ?? defaults.realmOSPlatformResources
      );
      await adapter.replaceTable(
        OperationalTables.projectInfrastructurePlans,
        seed.projectInfrastructurePlans ?? defaults.projectInfrastructurePlans
      );
      await adapter.replaceTable(OperationalTables.prototypeApprovals, seed.prototypeApprovals ?? []);
      await adapter.replaceTable(OperationalTables.isolationViolations, seed.isolationViolations ?? []);
    }
  };
}
