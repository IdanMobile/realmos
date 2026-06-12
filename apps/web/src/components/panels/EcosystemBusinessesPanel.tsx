import type { Business } from "@realmos/contracts";

export function EcosystemBusinessesPanel({ businesses }: { businesses: Business[] }) {
  return (
    <section className="card" aria-label="Ecosystem businesses panel">
      <h3 className="panel-title">Ecosystem Businesses</h3>
      <div className="space-y-3">
        {businesses.map((business) => (
          <article key={business.id} className="rounded-lg border border-border/70 bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="font-semibold">{business.name}</h4>
              <span className="badge bg-accent/15 text-accent">{business.status}</span>
            </div>
            <p className="mb-2 text-sm text-textSecondary">{business.mission}</p>
            <p className="text-xs text-textSecondary">
              {business.agentIds.length} agents · {business.taskIds.length} tasks
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
