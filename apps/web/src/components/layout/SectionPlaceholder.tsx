import type { CommandCenterSection } from "@/lib/navigation/sections";

type SectionPlaceholderProps = {
  section: CommandCenterSection;
};

export function SectionPlaceholder({ section }: SectionPlaceholderProps) {
  return (
    <section
      className="card lg:col-span-2"
      aria-label={`${section.label} placeholder`}
      data-testid={`section-placeholder-${section.id}`}
    >
      <h3 className="panel-title">{section.label}</h3>
      <p className="text-sm text-textSecondary">
        Not implemented yet — planned RealmOS base module. Navigation is wired; content arrives in a
        future initiative.
      </p>
      <p className="mt-2 text-xs text-textSecondary">
        Locked reference (restore to enable visual comparison):{" "}
        <code className="text-xs">{section.referencePath}</code>
      </p>
    </section>
  );
}
