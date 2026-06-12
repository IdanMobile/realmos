export type RepositoryProvider = "github" | "gitlab" | "local" | "other";

export type RepositoryBinding = {
  id: string;
  realmId: string;
  provider: RepositoryProvider;
  repoName: string;
  repoUrl?: string;
  localPath?: string;
  defaultBranch: string;
  allowedBranches: string[];
  worktreeRoot?: string;
  packagePaths: string[];
  protectedPaths: string[];
  ownershipRules: RepositoryOwnershipRule[];
  createdAt: string;
  updatedAt: string;
};

export type RepositoryOwnershipRule = {
  id: string;
  repositoryBindingId: string;
  pathPattern: string;
  ownerScope: "global" | "realm";
  ownerRealmId?: string;
  allowedAgentIds: string[];
  requiresApproval: boolean;
};

export type CursorRepositoryContext = {
  repositoryBindingId: string;
  repoName: string;
  localPath?: string;
  branchName: string;
  worktreePath?: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  verificationCommands: string[];
};

export type RepositoryConflict = {
  id: string;
  repositoryBindingId: string;
  conflictType:
    | "same_branch"
    | "same_worktree"
    | "overlapping_paths"
    | "protected_path"
    | "cross_realm_boundary"
    | "same_package"
    | "same_migration"
    | "same_config";
  workItemIds: string[];
  severity: "low" | "medium" | "high" | "critical";
  resolution: "allow" | "serialize" | "new_branch" | "new_worktree" | "requires_approval" | "block";
  rationale: string;
  createdAt: string;
};
