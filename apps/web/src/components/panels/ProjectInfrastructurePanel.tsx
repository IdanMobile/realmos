import type {
  FirebaseBaselineConfig,
  GitHubSourceControlConfig,
  LocalNodeConfig,
  OllamaRuntimeConfig
} from "@realmos/platform-infra";
import type {
  InfrastructureIsolationViolation,
  InfrastructureResourceRef,
  ProjectInfrastructurePlan,
  RealmOSPlatformDecision,
  TemporaryPrototypeInfrastructureApproval
} from "@realmos/contracts";

export type PlatformInfraConsoleData = {
  platformDecision: RealmOSPlatformDecision;
  realmOSPlatformResources: InfrastructureResourceRef[];
  projectInfrastructurePlans: ProjectInfrastructurePlan[];
  prototypeApprovals: TemporaryPrototypeInfrastructureApproval[];
  isolationViolations: InfrastructureIsolationViolation[];
  firebaseConfig: FirebaseBaselineConfig;
  localNodeConfig: LocalNodeConfig;
  githubConfig: GitHubSourceControlConfig;
  ollamaConfig: OllamaRuntimeConfig;
};

export function ProjectInfrastructurePanel({
  platformDecision,
  realmOSPlatformResources,
  projectInfrastructurePlans,
  prototypeApprovals,
  isolationViolations,
  firebaseConfig,
  localNodeConfig,
  githubConfig,
  ollamaConfig
}: PlatformInfraConsoleData) {
  return (
    <section className="card lg:col-span-2" aria-label="Project infrastructure panel">
      <h3 className="panel-title">Platform & Project Infrastructure</h3>
      <p className="mb-3 text-sm text-textSecondary">
        RealmOS orchestration uses Firebase + local node + GitHub + Ollama. Project product runtime must
        stay on dedicated project infrastructure.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Cloud</p>
          <p className="font-semibold">{platformDecision.cloudPlatform}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Local node</p>
          <p className="font-semibold">{platformDecision.localNodeRuntime.replace(/_/g, " ")}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Source control</p>
          <p className="font-semibold">{platformDecision.sourceControl}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Local LLM</p>
          <p className="font-semibold">{platformDecision.localLLMRuntime}</p>
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold">RealmOS platform resources</h4>
          <ul className="space-y-2">
            {realmOSPlatformResources.map((resource) => (
              <li key={resource.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{resource.name}</span>
                  <span className="badge bg-slate-500/15 text-slate-200">{resource.type}</span>
                </div>
                <p className="mt-1 text-xs text-textSecondary">{resource.notes}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Project infrastructure plans</h4>
          <ul className="space-y-2">
            {projectInfrastructurePlans.map((plan) => (
              <li key={plan.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{plan.realmId}</span>
                  <span className="badge bg-emerald-500/15 text-emerald-200">{plan.mode}</span>
                </div>
                <p className="mt-1 text-textSecondary">{plan.notes}</p>
                <p className="mt-1 text-xs text-textSecondary">Status: {plan.status}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold">Config placeholders</h4>
        <ul className="space-y-1 text-sm text-textSecondary">
          <li>Firebase: {firebaseConfig.projectId} (placeholder)</li>
          <li>Local node: {localNodeConfig.hostname} · {localNodeConfig.runtime}</li>
          <li>GitHub: {githubConfig.organization} · actions {githubConfig.actionsEnabled ? "on" : "off"}</li>
          <li>Ollama: {ollamaConfig.baseUrl}</li>
        </ul>
      </div>

      {prototypeApprovals.length > 0 ? (
        <p className="mb-2 text-xs text-amber-200">
          {prototypeApprovals.length} temporary prototype approval(s) active.
        </p>
      ) : null}

      {isolationViolations.length > 0 ? (
        <p className="text-xs text-red-300">
          {isolationViolations.length} isolation violation(s) — approve temporary prototype or migrate to
          dedicated infra.
        </p>
      ) : (
        <p className="text-xs text-emerald-200">No active infrastructure isolation violations.</p>
      )}

      {platformDecision.delayedPlatforms.length > 0 ? (
        <p className="mt-2 text-xs text-textSecondary">
          Delayed: {platformDecision.delayedPlatforms.map((item) => item.name).join(", ")}
        </p>
      ) : null}
    </section>
  );
}
