import type { HealthReport } from "@/lib/api/fetchHealth";

type GovernanceSafetyBannerProps = {
  health: HealthReport | null;
  dataSource: "api" | "mock";
};

export function GovernanceSafetyBanner({ health, dataSource }: GovernanceSafetyBannerProps) {
  const executorMode = health?.checks.executor?.mode ?? "dry_run";
  const terminalEnabled = health?.checks.terminal?.enabled ?? false;

  return (
    <section
      className="card lg:col-span-2 border-accent/30 bg-surface/60"
      aria-label="Governance and safety banner"
      data-testid="governance-safety-banner"
    >
      <h3 className="panel-title">Governance &amp; Safety</h3>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        <li className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <span className="font-medium text-textPrimary">Executor bridge:</span>{" "}
          <span className="text-textSecondary">{executorMode} only — no Cursor CLI auto-invoke</span>
        </li>
        <li className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <span className="font-medium text-textPrimary">Shell execution:</span>{" "}
          <span className="text-textSecondary">
            {terminalEnabled ? "terminal enabled (approval required)" : "disabled by default"}
          </span>
        </li>
        <li className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <span className="font-medium text-textPrimary">Side projects / GUING:</span>{" "}
          <span className="text-textSecondary">blocked until RealmOS base system verified</span>
        </li>
        <li className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
          <span className="font-medium text-textPrimary">Data mode:</span>{" "}
          <span className="text-textSecondary">
            {dataSource === "api" ? "Live API" : "Mock seed — lifecycle actions disabled"}
          </span>
        </li>
      </ul>
    </section>
  );
}
