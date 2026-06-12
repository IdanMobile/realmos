import type { AuditEvent } from "@realmos/contracts";

export function RecentActivityPanel({ events }: { events: AuditEvent[] }) {
  return (
    <section className="card" aria-label="Recent activity panel">
      <h3 className="panel-title">Recent Activity</h3>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="rounded-lg border border-border/70 bg-surface p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{event.summary}</span>
              <span className="badge bg-slate-500/20 text-slate-200">{event.eventType}</span>
            </div>
            <p className="text-xs text-textSecondary">{new Date(event.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
