import type { BriefingItem, QuickAction } from "@/lib/mock/loadMockDashboard";

type JarvisBriefingPanelProps = {
  greeting: string;
  briefingItems: BriefingItem[];
  quickActions: QuickAction[];
};

export function JarvisBriefingPanel({ greeting, briefingItems, quickActions }: JarvisBriefingPanelProps) {
  return (
    <section className="card lg:col-span-2" aria-label="Jarvis briefing panel">
      <h3 className="panel-title">Jarvis Briefing</h3>
      <p className="mb-4 text-lg font-medium">{greeting}</p>
      <ul className="mb-4 space-y-3">
        {briefingItems.map((item) => (
          <li key={item.id} className="rounded-lg border border-border/70 bg-surface px-3 py-2">
            <p className="font-medium">{item.label}</p>
            <p className="text-sm text-textSecondary">{item.detail}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent/50"
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
