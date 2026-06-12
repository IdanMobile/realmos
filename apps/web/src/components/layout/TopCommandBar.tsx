export function TopCommandBar({ dataSource = "mock" }: { dataSource?: "api" | "mock" }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-wide text-textSecondary">Global Command Center</p>
        <h2 className="text-xl font-semibold">Overview</h2>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search agents, tasks, approvals…"
          className="w-72 rounded-lg border border-border bg-card px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary"
        />
        <span className={`badge ${dataSource === "api" ? "bg-emerald-500/20 text-emerald-200" : "bg-accent/20 text-accent"}`}>
          {dataSource === "api" ? "Live API" : "Mock data"}
        </span>
        <button
          type="button"
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accentMuted"
        >
          Ask Jarvis
        </button>
      </div>
    </header>
  );
}
