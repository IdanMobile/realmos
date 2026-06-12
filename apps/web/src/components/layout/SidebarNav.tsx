const navItems = [
  { id: "overview", label: "Overview", active: true },
  { id: "realms", label: "Realms" },
  { id: "tasks", label: "Tasks" },
  { id: "runs", label: "Live Runs" },
  { id: "agents", label: "Agents" },
  { id: "communications", label: "Communications" },
  { id: "memory", label: "Memory" },
  { id: "artifacts", label: "Artifacts" },
  { id: "decisions", label: "Decisions" },
  { id: "audit", label: "Audit Logs" }
];

export function SidebarNav() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-4">
      <div className="mb-6 px-2">
        <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">RealmOS</p>
        <h1 className="text-lg font-semibold text-textPrimary">Jarvis HQ</h1>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              item.active
                ? "bg-accent/15 text-textPrimary ring-1 ring-accent/40"
                : "text-textSecondary hover:bg-card hover:text-textPrimary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
