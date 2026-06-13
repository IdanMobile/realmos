import { describe, expect, it } from "vitest";
import {
  COMMAND_CENTER_SECTIONS,
  DEFAULT_COMMAND_CENTER_SECTION,
  getCommandCenterSection,
  parseCommandCenterSection
} from "./sections";

describe("command center sections", () => {
  it("defines ten sidebar sections aligned with locked IA", () => {
    expect(COMMAND_CENTER_SECTIONS).toHaveLength(10);
    expect(COMMAND_CENTER_SECTIONS.map((section) => section.id)).toEqual([
      "overview",
      "realms",
      "tasks",
      "runs",
      "agents",
      "communications",
      "memory",
      "artifacts",
      "decisions",
      "audit"
    ]);
  });

  it("marks decisions as not implemented", () => {
    const decisions = getCommandCenterSection("decisions");
    expect(decisions.implemented).toBe(false);
  });

  it("defaults unknown section params to overview", () => {
    expect(parseCommandCenterSection(null)).toBe(DEFAULT_COMMAND_CENTER_SECTION);
    expect(parseCommandCenterSection("invalid")).toBe(DEFAULT_COMMAND_CENTER_SECTION);
    expect(parseCommandCenterSection("tasks")).toBe("tasks");
  });
});
