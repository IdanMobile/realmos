import type { Agent } from "@realmos/contracts";

export function ActiveAgentsPanel({ agents }: { agents: Agent[] }) {
  return (
    <section className="card" aria-label="Active agents panel">
      <h3 className="panel-title">Active Agents</h3>
      <div className="space-y-3">
        {agents.map((agent) => (
          <article key={agent.id} className="rounded-lg border border-border/70 bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="font-semibold">{agent.name}</h4>
              <span className="badge bg-emerald-500/15 text-emerald-300">{agent.status}</span>
            </div>
            <p className="text-sm text-textSecondary">{agent.role}</p>
            <p className="mt-2 text-xs text-textSecondary">Scope: {agent.scope}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
