import type {
  Realm,
  RealmAccessPolicy,
  RealmEnvironment,
  RepositoryBinding,
  RepositoryConflict
} from "@realmos/contracts";

export type RepositoryConsoleData = {
  realms: Realm[];
  environments: RealmEnvironment[];
  accessPolicies: RealmAccessPolicy[];
  repositoryBindings: RepositoryBinding[];
  repositoryConflicts: RepositoryConflict[];
  globalShellRoutes: Array<{ path: string; label: string; scope: string }>;
  projectShellRoutes: Array<{ path: string; label: string; scope: string; realmId?: string }>;
};

export function RepositoryBoundaryPanel({
  realms,
  repositoryBindings,
  repositoryConflicts,
  globalShellRoutes,
  projectShellRoutes,
  accessPolicies
}: RepositoryConsoleData) {
  return (
    <section className="card lg:col-span-2" aria-label="Repository boundary panel">
      <h3 className="panel-title">Repository Boundaries</h3>
      <p className="mb-3 text-sm text-textSecondary">
        Global RealmOS orchestration is separate from project realm repositories. Cross-realm edits require
        approval.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Realms</p>
          <p className="text-lg font-semibold">{realms.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Bindings</p>
          <p className="text-lg font-semibold">{repositoryBindings.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Conflicts</p>
          <p className="text-lg font-semibold">{repositoryConflicts.length}</p>
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Realms</h4>
          <ul className="space-y-2">
            {realms.map((realm) => (
              <li key={realm.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{realm.name}</span>
                  <span className="badge bg-slate-500/15 text-slate-200">{realm.type}</span>
                </div>
                <p className="mt-1 text-textSecondary">{realm.mission}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Repository bindings</h4>
          <ul className="space-y-2">
            {repositoryBindings.map((binding) => (
              <li key={binding.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{binding.repoName}</span>
                  <span className="badge bg-emerald-500/15 text-emerald-200">{binding.provider}</span>
                </div>
                <p className="mt-1 text-textSecondary">
                  {binding.localPath ?? binding.repoUrl} · {binding.defaultBranch}
                </p>
                <p className="mt-1 text-xs text-textSecondary">
                  Protected: {binding.protectedPaths.join(", ") || "none"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold">Shell routes</h4>
        <div className="grid gap-4 lg:grid-cols-2">
          <ul className="space-y-1 text-sm text-textSecondary">
            {globalShellRoutes.map((route) => (
              <li key={route.path}>
                <span className="font-medium text-textPrimary">{route.path}</span> — {route.label}
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-sm text-textSecondary">
            {projectShellRoutes.map((route) => (
              <li key={route.path}>
                <span className="font-medium text-textPrimary">{route.path}</span> — {route.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {accessPolicies.some((policy) => policy.crossRealmAccess.length > 0) ? (
        <p className="text-xs text-amber-200">Cross-realm access policies require approval before edits.</p>
      ) : null}
    </section>
  );
}
