import type {
  Realm,
  RealmAccessPolicy,
  RealmEnvironment,
  RepositoryBinding,
  RepositoryConflict
} from "@realmos/contracts";
import {
  createDefaultGlobalRealm,
  createDefaultProjectRealm,
  createDefaultRealmAccessPolicy,
  createDefaultRealmBindings,
  createDefaultRealmEnvironment,
  GLOBAL_SHELL_ROUTES,
  projectShellRoutes
} from "@realmos/realm-scope";

export function createDefaultRealmSeed() {
  const globalRealm = createDefaultGlobalRealm();
  const projectRealm = createDefaultProjectRealm();
  const bindings = createDefaultRealmBindings();

  return {
    realms: [globalRealm, projectRealm],
    environments: [
      createDefaultRealmEnvironment(globalRealm),
      createDefaultRealmEnvironment(projectRealm)
    ],
    accessPolicies: [
      createDefaultRealmAccessPolicy(globalRealm.id),
      createDefaultRealmAccessPolicy(projectRealm.id)
    ],
    repositoryBindings: bindings,
    repositoryConflicts: [] as RepositoryConflict[],
    globalShellRoutes: GLOBAL_SHELL_ROUTES,
    projectShellRoutes: projectShellRoutes(projectRealm.id, projectRealm.name)
  };
}

export type RealmStoreState = ReturnType<typeof createDefaultRealmSeed> & {
  realms: Realm[];
  environments: RealmEnvironment[];
  accessPolicies: RealmAccessPolicy[];
  repositoryBindings: RepositoryBinding[];
  repositoryConflicts: RepositoryConflict[];
};

export { realmStore } from "./persistence/configure-operational-stores";
