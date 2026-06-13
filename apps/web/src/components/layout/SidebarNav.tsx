import type { CommandCenterSectionId } from "@/lib/navigation/sections";
import { COMMAND_CENTER_SECTIONS } from "@/lib/navigation/sections";

type SidebarNavProps = {
  activeSection: CommandCenterSectionId;
  onSectionChange: (sectionId: CommandCenterSectionId) => void;
};

export function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-surface px-3 py-4">
      <div className="mb-6 px-2">
        <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">RealmOS</p>
        <h1 className="text-lg font-semibold text-textPrimary">Jarvis HQ</h1>
      </div>
      <nav className="space-y-1" aria-label="Command Center sections">
        {COMMAND_CENTER_SECTIONS.map((item) => {
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`nav-section-${item.id}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSectionChange(item.id)}
              className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                isActive
                  ? "bg-accent/15 text-textPrimary ring-1 ring-accent/40"
                  : "text-textSecondary hover:bg-card hover:text-textPrimary"
              }`}
            >
              {item.label}
              {!item.implemented ? (
                <span className="ml-auto text-xs text-textSecondary">planned</span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
