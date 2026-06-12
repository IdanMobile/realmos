import type { CapabilitySearchReport } from "@realmos/contracts";

export function CapabilityScoutPanel({ reports }: { reports: CapabilitySearchReport[] }) {
  return (
    <section className="card" aria-label="Capability scout panel">
      <h3 className="panel-title">Capability Scout</h3>
      {reports.length === 0 ? (
        <p className="text-sm text-textSecondary">
          No capability searches yet. Run a scout search before building custom agents or tools.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.slice(0, 5).map((report) => (
            <article key={report.id} className="rounded-lg border border-border/70 bg-surface p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="font-semibold">{report.recommendation?.name ?? "No recommendation"}</h4>
                <span className="badge bg-cyan-500/15 text-cyan-200">{report.buildVsBuyDecision}</span>
              </div>
              <p className="text-sm text-textSecondary">{report.needSummary}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
