import type { OptimizationReport, ModelRoutingDecision } from "@realmos/contracts";

export function IntelligenceOptimizerPanel({ report }: { report: OptimizationReport | null }) {
  if (!report) {
    return (
      <section className="card" aria-label="System optimizer panel">
        <h3 className="panel-title">System Optimizer</h3>
        <p className="text-sm text-textSecondary">No optimization report yet.</p>
      </section>
    );
  }

  return (
    <section className="card" aria-label="System optimizer panel">
      <h3 className="panel-title">System Optimizer</h3>
      <p className="mb-3 text-sm text-textSecondary">{report.summary}</p>
      <ul className="space-y-2">
        {(report.recommendations ?? []).map((item) => (
          <li key={item.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{item.title}</span>
              {item.requiresApproval ? (
                <span className="badge bg-amber-500/15 text-amber-200">Approval</span>
              ) : null}
            </div>
            <p className="mt-1 text-textSecondary">{item.expectedImpact}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ModelScoutPanel({
  decision
}: {
  decision: ModelRoutingDecision | null;
}) {
  return (
    <section className="card" aria-label="Model scout panel">
      <h3 className="panel-title">Model / Platform Scout</h3>
      {!decision ? (
        <p className="text-sm text-textSecondary">No routing decision yet.</p>
      ) : (
        <article className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="font-semibold">
            {decision.selectedProvider} / {decision.selectedModel}
          </p>
          <p className="mt-1 text-textSecondary">{decision.reason}</p>
          {decision.approvalRequired ? (
            <p className="mt-2 text-amber-200">Model change requires approval.</p>
          ) : null}
        </article>
      )}
    </section>
  );
}

export function KnowledgeVaultPanel({
  provider = "database_only",
  notes = []
}: {
  provider?: string;
  notes?: string[];
}) {
  const safeNotes = notes ?? [];
  return (
    <section className="card" aria-label="Knowledge vault panel">
      <h3 className="panel-title">Knowledge Vault</h3>
      <p className="mb-2 text-sm">
        Provider: <span className="badge bg-slate-500/15 text-slate-200">{provider}</span>
      </p>
      {safeNotes.length === 0 ? (
        <p className="text-sm text-textSecondary">No vault notes configured.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-textSecondary">
          {safeNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
