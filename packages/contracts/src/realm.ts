export type RealmType =
  | "startup"
  | "software_project"
  | "life_domain"
  | "automation"
  | "client"
  | "research"
  | "company"
  | "personal"
  | "custom";

export type RealmStatus =
  | "idea"
  | "planning"
  | "building"
  | "active"
  | "paused"
  | "archived";

export type ScopeLevel = "global" | "realm";

export type ScopedRef = {
  scope: ScopeLevel;
  realmId?: string;
};

export type Realm = {
  id: string;
  name: string;
  type: RealmType;
  status: RealmStatus;
  mission: string;
  ownerUserId: string;
  settingsId?: string;
  governancePolicyId?: string;
  budgetId?: string;
  memoryScopeId: string;
  repositoryBindingIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type RealmEnvironment = {
  id: string;
  realmId: string;
  agentIds: string[];
  workflowIds: string[];
  taskIds: string[];
  memoryScopeId: string;
  communicationThreadIds: string[];
  artifactIds: string[];
  decisionIds: string[];
  repositoryBindingIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type RealmAccessPolicy = {
  id: string;
  realmId: string;
  allowedGlobalAgentIds: string[];
  allowedRealmAgentIds: string[];
  crossRealmAccess: Array<{
    fromRealmId: string;
    toRealmId: string;
    reason: string;
    requiresApproval: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};
