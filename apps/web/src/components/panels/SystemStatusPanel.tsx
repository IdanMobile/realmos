import type { HealthReport } from "@/lib/api/fetchHealth";

type SystemStatusPanelProps = {
  health: HealthReport | null;
  dataSource: "api" | "mock";
};

function statusBadge(status: string): string {
  if (status === "ok" || status === "enabled") return "bg-emerald-500/15 text-emerald-200";
  if (status === "degraded" || status === "unreachable") return "bg-amber-500/15 text-amber-200";
  return "bg-slate-500/15 text-slate-200";
}

export function SystemStatusPanel({ health, dataSource }: SystemStatusPanelProps) {
  return (
    <section className="card lg:col-span-2" aria-label="System status panel">
      <h3 className="panel-title">System Status</h3>
      <p className="mb-3 text-sm text-textSecondary">
        Data source: <span className="font-medium text-textPrimary">{dataSource === "api" ? "Live API" : "Mock seed"}</span>
      </p>
      {!health ? (
        <p className="text-sm text-textSecondary">Health checks unavailable (API offline).</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">API</span>
              <span className={`badge ${statusBadge(health.status)}`}>{health.status}</span>
            </div>
            <p className="mt-1 text-textSecondary">v{health.version}</p>
          </li>
          <li className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">Database</span>
              <span className={`badge ${statusBadge(health.checks.database.status)}`}>
                {health.checks.database.status}
              </span>
            </div>
          </li>
          <li className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">Ollama</span>
              <span className={`badge ${statusBadge(health.checks.ollama.status)}`}>
                {health.checks.ollama.status}
              </span>
            </div>
            {health.checks.ollama.models?.length ? (
              <p className="mt-1 text-xs text-textSecondary">{health.checks.ollama.models.join(", ")}</p>
            ) : null}
          </li>
          <li className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">Terminal execution</span>
              <span className={`badge ${statusBadge(health.checks.terminal.enabled ? "enabled" : "disabled")}`}>
                {health.checks.terminal.enabled ? "enabled" : "disabled"}
              </span>
            </div>
          </li>
          <li className="rounded-lg border border-border/70 bg-surface p-3 text-sm sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">Online models</span>
              <span className={`badge ${statusBadge(health.checks.onlineModels.enabled ? "enabled" : "disabled")}`}>
                {health.checks.onlineModels.enabled
                  ? health.checks.onlineModels.configured
                    ? "enabled + key"
                    : "enabled (stub)"
                  : "disabled"}
              </span>
            </div>
          </li>
        </ul>
      )}
    </section>
  );
}
