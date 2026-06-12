import type {
  Realm,
  RealmAccessPolicy,
  RealmEnvironment,
  RepositoryBinding,
  RepositoryConflict
} from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";
import { createDefaultRealmSeed, type RealmStoreState } from "../realm-store";

export type RealmStore = {
  listRealms(): Promise<Realm[]>;
  getRealm(id: string): Promise<Realm | null>;
  listRepositoryBindings(): Promise<RepositoryBinding[]>;
  getRepositoryBinding(id: string): Promise<RepositoryBinding | null>;
  listRepositoryConflicts(): Promise<RepositoryConflict[]>;
  appendRepositoryConflicts(conflicts: RepositoryConflict[]): Promise<RepositoryConflict[]>;
  getRealmConsole(): Promise<{
    realms: Realm[];
    environments: RealmEnvironment[];
    accessPolicies: RealmAccessPolicy[];
    repositoryBindings: RepositoryBinding[];
    repositoryConflicts: RepositoryConflict[];
    globalShellRoutes: RealmStoreState["globalShellRoutes"];
    projectShellRoutes: RealmStoreState["projectShellRoutes"];
  }>;
  resetFromSeed(seed: Partial<RealmStoreState>): Promise<void>;
};

export function createRealmStore(adapter: OperationalPersistenceAdapter): RealmStore {
  async function ensureDefaults(): Promise<RealmStoreState> {
    const defaults = createDefaultRealmSeed();
    const realms = await adapter.readTable<Realm>(OperationalTables.realms);
    if (realms.length > 0) {
      return {
        realms,
        environments: await adapter.readTable<RealmEnvironment>(OperationalTables.realmEnvironments),
        accessPolicies: await adapter.readTable<RealmAccessPolicy>(OperationalTables.realmAccessPolicies),
        repositoryBindings: await adapter.readTable<RepositoryBinding>(OperationalTables.repositoryBindings),
        repositoryConflicts: await adapter.readTable<RepositoryConflict>(OperationalTables.repositoryConflicts),
        globalShellRoutes: defaults.globalShellRoutes,
        projectShellRoutes: defaults.projectShellRoutes
      };
    }
    await adapter.replaceTable(OperationalTables.realms, defaults.realms);
    await adapter.replaceTable(OperationalTables.realmEnvironments, defaults.environments);
    await adapter.replaceTable(OperationalTables.realmAccessPolicies, defaults.accessPolicies);
    await adapter.replaceTable(OperationalTables.repositoryBindings, defaults.repositoryBindings);
    return defaults;
  }

  return {
    async listRealms() {
      const realms = await adapter.readTable<Realm>(OperationalTables.realms);
      return realms.length > 0 ? realms : (await ensureDefaults()).realms;
    },
    async getRealm(id) {
      const realm = await adapter.readOne<Realm>(OperationalTables.realms, id);
      if (realm) return realm;
      return (await ensureDefaults()).realms.find((item) => item.id === id) ?? null;
    },
    async listRepositoryBindings() {
      const bindings = await adapter.readTable<RepositoryBinding>(OperationalTables.repositoryBindings);
      return bindings.length > 0 ? bindings : (await ensureDefaults()).repositoryBindings;
    },
    getRepositoryBinding: (id) => adapter.readOne<RepositoryBinding>(OperationalTables.repositoryBindings, id),
    listRepositoryConflicts: () => adapter.readTable<RepositoryConflict>(OperationalTables.repositoryConflicts),
    async appendRepositoryConflicts(conflicts) {
      for (const conflict of conflicts) {
        await adapter.upsertOne(OperationalTables.repositoryConflicts, conflict);
      }
      return conflicts;
    },
    async getRealmConsole() {
      const defaults = createDefaultRealmSeed();
      const seeded = await ensureDefaults();
      return {
        realms: [...seeded.realms],
        environments: [...seeded.environments],
        accessPolicies: [...seeded.accessPolicies],
        repositoryBindings: [...seeded.repositoryBindings],
        repositoryConflicts: [...seeded.repositoryConflicts],
        globalShellRoutes: [...defaults.globalShellRoutes],
        projectShellRoutes: [...defaults.projectShellRoutes]
      };
    },
    async resetFromSeed(seed) {
      const defaults = createDefaultRealmSeed();
      await adapter.replaceTable(OperationalTables.realms, seed.realms ?? defaults.realms);
      await adapter.replaceTable(OperationalTables.realmEnvironments, seed.environments ?? defaults.environments);
      await adapter.replaceTable(
        OperationalTables.realmAccessPolicies,
        seed.accessPolicies ?? defaults.accessPolicies
      );
      await adapter.replaceTable(
        OperationalTables.repositoryBindings,
        seed.repositoryBindings ?? defaults.repositoryBindings
      );
      await adapter.replaceTable(OperationalTables.repositoryConflicts, seed.repositoryConflicts ?? []);
    }
  };
}
