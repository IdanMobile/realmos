import type { CommandCenterSectionId } from "@/lib/navigation/sections";
import { getCommandCenterSection } from "@/lib/navigation/sections";

type TopCommandBarProps = {
  dataSource?: "api" | "mock";
  activeSection: CommandCenterSectionId;
  onAskJarvis?: () => void;
};

export function TopCommandBar({ dataSource = "mock", activeSection, onAskJarvis }: TopCommandBarProps) {
  const section = getCommandCenterSection(activeSection);

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-wide text-textSecondary">Global Command Center</p>
        <h2 className="text-xl font-semibold">{section.title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="search"
          disabled
          aria-disabled="true"
          aria-label="Search (not implemented yet)"
          title="Search not implemented yet"
          placeholder="Search not available yet…"
          className="w-72 cursor-not-allowed rounded-lg border border-border bg-card/50 px-3 py-2 text-sm text-textSecondary placeholder:text-textSecondary/70"
          data-testid="command-center-search"
        />
        <span
          className={`badge ${dataSource === "api" ? "bg-emerald-500/20 text-emerald-200" : "bg-accent/20 text-accent"}`}
          data-testid="data-source-badge"
        >
          {dataSource === "api" ? "Live API" : "Mock data"}
        </span>
        <button
          type="button"
          onClick={onAskJarvis}
          title="Open Jarvis operator chat"
          data-testid="ask-jarvis-button"
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accentMuted"
        >
          Ask Jarvis
        </button>
      </div>
    </header>
  );
}
