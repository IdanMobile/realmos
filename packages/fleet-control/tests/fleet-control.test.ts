import { describe, expect, it } from "vitest";
import type { WorkItem } from "@realmos/contracts";
import {
  assignFleetLane,
  buildParallelWorkPlan,
  createDefaultFleet,
  createDefaultFleetCapacityPolicy,
  detectWorkConflicts,
  evaluateFleetCapacity,
  hasBlockingConflicts
} from "../src/index";

function work(patch: Partial<WorkItem>): WorkItem {
  const timestamp = new Date().toISOString();
  return {
    id: "work_a",
    title: "Task",
    businessId: "realm_os",
    status: "ready",
    priority: "normal",
    riskLevel: "low",
    executionMode: "cursor",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...patch
  };
}

describe("@realmos/fleet-control", () => {
  it("assigns lanes from work item titles", () => {
    expect(assignFleetLane({ workItem: work({ title: "Build dashboard UI shell" }) })).toBe("frontend");
    expect(assignFleetLane({ workItem: work({ title: "Add API routes" }) })).toBe("backend");
  });

  it("detects same-file conflicts", () => {
    const conflicts = detectWorkConflicts([
      {
        workItem: work({ id: "w1", title: "Edit routes" }),
        scopePaths: ["apps/api/src/routes.ts"]
      },
      {
        workItem: work({ id: "w2", title: "Patch routes" }),
        scopePaths: ["apps/api/src/routes.ts"]
      }
    ]);

    expect(conflicts.some((c) => c.conflictType === "same_file")).toBe(true);
    expect(hasBlockingConflicts(conflicts)).toBe(true);
  });

  it("blocks parallel plan when file conflicts exist", () => {
    const fleet = createDefaultFleet();
    const policy = createDefaultFleetCapacityPolicy();
    const result = buildParallelWorkPlan({
      fleet,
      policy,
      title: "Conflicting batch",
      items: [
        {
          workItem: work({ id: "w1", title: "API work" }),
          scopePaths: ["packages/core/src/index.ts"]
        },
        {
          workItem: work({ id: "w2", title: "More API work" }),
          scopePaths: ["packages/core/src/index.ts"]
        }
      ]
    });

    expect(result.executionBlocked).toBe(true);
    expect(result.coordinationMode).toBe("serial");
    expect(result.proposedRuns.every((run) => run.status === "blocked")).toBe(true);
  });

  it("allows safe parallel plan across distinct packages", () => {
    const fleet = createDefaultFleet();
    const policy = createDefaultFleetCapacityPolicy();
    const result = buildParallelWorkPlan({
      fleet,
      policy,
      title: "Safe parallel batch",
      items: [
        {
          workItem: work({ id: "w1", title: "Frontend panel" }),
          scopePaths: ["apps/web/src/components/panels/FleetPanel.tsx"],
          lane: "frontend"
        },
        {
          workItem: work({ id: "w2", title: "Fleet package tests" }),
          scopePaths: ["packages/fleet-control/tests/fleet.test.ts"],
          lane: "qa"
        }
      ]
    });

    expect(result.executionBlocked).toBe(false);
    expect(result.coordinationMode).toBe("parallel");
    expect(result.proposedRuns.every((run) => run.status === "queued")).toBe(true);
  });

  it("enforces global capacity limits", () => {
    const policy = createDefaultFleetCapacityPolicy({ maxConcurrentRuns: 1 });
    const evaluation = evaluateFleetCapacity({
      policy,
      existingRuns: [
        {
          id: "run_active",
          fleetId: "fleet_realm_os",
          workItemId: "w0",
          lane: "backend",
          coordinationMode: "parallel",
          status: "running",
          assignedAgentIds: [],
          conflicts: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      proposedLane: "frontend"
    });

    expect(evaluation.allowed).toBe(false);
  });
});
