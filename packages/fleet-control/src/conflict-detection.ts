import type { WorkConflict } from "@realmos/contracts";
import { makeFleetId, nowIso } from "./id";
import type { FleetPlanWorkItem } from "./lane-assignment";

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

function pathsOverlap(a: string, b: string): boolean {
  const na = normalizePath(a);
  const nb = normalizePath(b);
  return na === nb || na.startsWith(`${nb}/`) || nb.startsWith(`${na}/`);
}

function packageKey(path: string): string {
  const normalized = normalizePath(path);
  const match = normalized.match(/^(packages\/[^/]+|apps\/[^/]+)/);
  return match?.[1] ?? normalized.split("/")[0] ?? normalized;
}

export function detectWorkConflicts(items: FleetPlanWorkItem[]): WorkConflict[] {
  const conflicts: WorkConflict[] = [];
  const timestamp = nowIso();

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const left = items[i];
      const right = items[j];

      if (left.workItem.id === right.workItem.id) {
        conflicts.push({
          id: makeFleetId("conflict"),
          workItemIds: [left.workItem.id, right.workItem.id],
          conflictType: "same_task",
          severity: "critical",
          resolution: "cancel_one",
          rationale: "Duplicate work item id in parallel plan.",
          createdAt: timestamp
        });
        continue;
      }

      if (left.workItem.taskId && left.workItem.taskId === right.workItem.taskId) {
        conflicts.push({
          id: makeFleetId("conflict"),
          workItemIds: [left.workItem.id, right.workItem.id],
          conflictType: "same_task",
          severity: "high",
          resolution: "serialize",
          rationale: "Both work items target the same task.",
          createdAt: timestamp
        });
      }

      const leftPaths = left.scopePaths ?? [];
      const rightPaths = right.scopePaths ?? [];
      for (const lp of leftPaths) {
        for (const rp of rightPaths) {
          if (pathsOverlap(lp, rp)) {
            conflicts.push({
              id: makeFleetId("conflict"),
              workItemIds: [left.workItem.id, right.workItem.id],
              conflictType: "same_file",
              severity: "critical",
              resolution: "serialize",
              rationale: `Overlapping scope paths: ${lp} and ${rp}`,
              createdAt: timestamp
            });
          }
        }
      }

      const leftPackages = new Set((left.packagePaths ?? leftPaths.map(packageKey)).map(packageKey));
      const rightPackages = new Set((right.packagePaths ?? rightPaths.map(packageKey)).map(packageKey));
      for (const pkg of leftPackages) {
        if (rightPackages.has(pkg)) {
          conflicts.push({
            id: makeFleetId("conflict"),
            workItemIds: [left.workItem.id, right.workItem.id],
            conflictType: "same_package",
            severity: "high",
            resolution: "serialize",
            rationale: `Both items touch package ${pkg}.`,
            createdAt: timestamp
          });
        }
      }
    }
  }

  return dedupeConflicts(conflicts);
}

function dedupeConflicts(conflicts: WorkConflict[]): WorkConflict[] {
  const seen = new Set<string>();
  return conflicts.filter((conflict) => {
    const key = [
      conflict.conflictType,
      [...conflict.workItemIds].sort().join("|"),
      conflict.rationale
    ].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function hasBlockingConflicts(conflicts: WorkConflict[]): boolean {
  return conflicts.some(
    (conflict) =>
      conflict.severity === "critical" ||
      (conflict.severity === "high" && conflict.resolution === "serialize")
  );
}
