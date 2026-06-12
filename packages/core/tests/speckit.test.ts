import { describe, expect, it } from "vitest";
import type { Business } from "@realmos/contracts";
import {
  assertAcceptanceGates,
  assertSpecKitSections,
  assertTasksChecklist,
  generateSpecKitArtifacts
} from "../src/speckit/generate-artifacts";

const business: Business = {
  id: "biz_speckit",
  name: "Real Time Dating App",
  mission: "Build a real-time dating MVP.",
  type: "startup",
  status: "planning",
  ownerUserId: "user_idan",
  agentIds: [],
  taskIds: [],
  memoryScopeId: "memscope_speckit",
  metrics: [],
  risks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("SpecKit artifact generation", () => {
  it("generates spec with required sections", () => {
    const bundle = generateSpecKitArtifacts({
      business,
      ideaText: "A real-time dating app with live matching.",
      agents: [],
      tasks: []
    });
    const spec = bundle.files.find((file) => file.path === "specs/spec.md");
    expect(spec).toBeDefined();
    expect(assertSpecKitSections(spec!.content)).toBe(true);
  });

  it("generates tasks checklist", () => {
    const bundle = generateSpecKitArtifacts({
      business,
      ideaText: "Dating app",
      agents: [],
      tasks: [
        {
          id: "task_1",
          businessId: business.id,
          title: "Draft spec outline",
          goal: "Spec",
          status: "todo",
          priority: "high",
          requiresApproval: false,
          dependencies: [],
          artifacts: [],
          auditEventIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
    const tasksFile = bundle.files.find((file) => file.path === "specs/tasks.md");
    expect(tasksFile).toBeDefined();
    expect(assertTasksChecklist(tasksFile!.content)).toBe(true);
  });

  it("generates acceptance gates", () => {
    const bundle = generateSpecKitArtifacts({
      business,
      ideaText: "Dating app",
      agents: [],
      tasks: []
    });
    const acceptance = bundle.files.find((file) => file.path === "specs/acceptance.md");
    expect(acceptance).toBeDefined();
    expect(assertAcceptanceGates(acceptance!.content)).toBe(true);
  });

  it("generates unique artifact ids within a bundle", () => {
    const bundle = generateSpecKitArtifacts({
      business,
      ideaText: "Dating app",
      agents: [],
      tasks: []
    });
    const ids = bundle.artifacts.map((artifact) => artifact.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stores artifact metadata and human-readable content", () => {
    const bundle = generateSpecKitArtifacts({
      business,
      ideaText: "Dating app",
      agents: [],
      tasks: []
    });

    expect(bundle.artifacts.length).toBeGreaterThanOrEqual(10);
    expect(bundle.artifacts.every((artifact) => artifact.businessId === business.id)).toBe(true);
    expect(bundle.artifacts.every((artifact) => typeof artifact.content === "string")).toBe(true);
    expect(bundle.artifacts.every((artifact) => artifact.metadata.generator === "speckit_v0")).toBe(true);
  });
});
