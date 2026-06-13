export type CommandCenterSectionId =
  | "overview"
  | "realms"
  | "tasks"
  | "runs"
  | "agents"
  | "communications"
  | "memory"
  | "artifacts"
  | "decisions"
  | "audit";

export type CommandCenterSection = {
  id: CommandCenterSectionId;
  label: string;
  title: string;
  /** When false, show explicit placeholder instead of panel content. */
  implemented: boolean;
  /** Documented locked reference path (may be missing from repo). */
  referencePath: string;
};

export const COMMAND_CENTER_SECTIONS: CommandCenterSection[] = [
  {
    id: "overview",
    label: "Overview",
    title: "Overview",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/01_overview_clean.png"
  },
  {
    id: "realms",
    label: "Realms",
    title: "Realms",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/02_realms_clean.png"
  },
  {
    id: "tasks",
    label: "Tasks",
    title: "Tasks",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/03_tasks_clean.png"
  },
  {
    id: "runs",
    label: "Live Runs",
    title: "Live Runs",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/04_runs_clean.png"
  },
  {
    id: "agents",
    label: "Agents",
    title: "Agents",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/05_agents_clean.png"
  },
  {
    id: "communications",
    label: "Communications",
    title: "Communications",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/06_communications_clean.png"
  },
  {
    id: "memory",
    label: "Memory",
    title: "Memory",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/07_memory_clean.png"
  },
  {
    id: "artifacts",
    label: "Artifacts",
    title: "Artifacts",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/08_artifacts_clean.png"
  },
  {
    id: "decisions",
    label: "Decisions",
    title: "Decisions",
    implemented: false,
    referencePath: "assets/ui-mockups/clean/09_decisions_clean.png"
  },
  {
    id: "audit",
    label: "Audit Logs",
    title: "Audit Logs",
    implemented: true,
    referencePath: "assets/ui-mockups/clean/11_audit_logs_clean.png"
  }
];

export const DEFAULT_COMMAND_CENTER_SECTION: CommandCenterSectionId = "overview";

const SECTION_IDS = new Set(COMMAND_CENTER_SECTIONS.map((section) => section.id));

export function parseCommandCenterSection(
  value: string | null | undefined
): CommandCenterSectionId {
  if (value && SECTION_IDS.has(value as CommandCenterSectionId)) {
    return value as CommandCenterSectionId;
  }
  return DEFAULT_COMMAND_CENTER_SECTION;
}

export function getCommandCenterSection(id: CommandCenterSectionId): CommandCenterSection {
  return COMMAND_CENTER_SECTIONS.find((section) => section.id === id) ?? COMMAND_CENTER_SECTIONS[0]!;
}
