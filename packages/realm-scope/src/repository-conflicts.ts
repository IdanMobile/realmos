import type { CursorRepositoryContext, RepositoryBinding, RepositoryConflict } from "@realmos/contracts";
import { makeRealmScopeId, nowIso } from "./id";

export type RepositoryWorkScope = {
  workItemId: string;
  realmId: string;
  repositoryBindingId: string;
  branchName?: string;
  paths: string[];
};

function normalize(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
}

function matchesPattern(path: string, pattern: string): boolean {
  const normalized = normalize(path);
  const regex = new RegExp(
    `^${pattern
      .replace(/\\/g, "/")
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")}$`,
    "i"
  );
  return regex.test(normalized);
}

function pathsOverlap(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  return na === nb || na.startsWith(`${nb}/`) || nb.startsWith(`${na}/`);
}

export function detectRepositoryConflicts(
  scopes: RepositoryWorkScope[],
  bindings: RepositoryBinding[]
): RepositoryConflict[] {
  const conflicts: RepositoryConflict[] = [];
  const timestamp = nowIso();
  const bindingById = new Map(bindings.map((binding) => [binding.id, binding]));

  for (let i = 0; i < scopes.length; i += 1) {
    for (let j = i + 1; j < scopes.length; j += 1) {
      const left = scopes[i];
      const right = scopes[j];
      const leftBinding = bindingById.get(left.repositoryBindingId);
      const rightBinding = bindingById.get(right.repositoryBindingId);

      if (left.realmId !== right.realmId && left.repositoryBindingId !== right.repositoryBindingId) {
        conflicts.push({
          id: makeRealmScopeId("repo_conflict"),
          repositoryBindingId: left.repositoryBindingId,
          conflictType: "cross_realm_boundary",
          workItemIds: [left.workItemId, right.workItemId],
          severity: "high",
          resolution: "requires_approval",
          rationale: `Cross-realm work between ${left.realmId} and ${right.realmId}.`,
          createdAt: timestamp
        });
      }

      if (left.branchName && right.branchName && left.branchName === right.branchName &&
          left.repositoryBindingId === right.repositoryBindingId) {
        conflicts.push({
          id: makeRealmScopeId("repo_conflict"),
          repositoryBindingId: left.repositoryBindingId,
          conflictType: "same_branch",
          workItemIds: [left.workItemId, right.workItemId],
          severity: "medium",
          resolution: "serialize",
          rationale: `Both items target branch ${left.branchName}.`,
          createdAt: timestamp
        });
      }

      for (const lp of left.paths) {
        for (const rp of right.paths) {
          if (pathsOverlap(lp, rp)) {
            conflicts.push({
              id: makeRealmScopeId("repo_conflict"),
              repositoryBindingId: left.repositoryBindingId,
              conflictType: "overlapping_paths",
              workItemIds: [left.workItemId, right.workItemId],
              severity: "critical",
              resolution: "block",
              rationale: `Overlapping repository paths: ${lp} and ${rp}`,
              createdAt: timestamp
            });
          }
        }
      }

      for (const scope of [left, right]) {
        const binding = bindingById.get(scope.repositoryBindingId);
        if (!binding) continue;
        for (const path of scope.paths) {
          if (binding.protectedPaths.some((protectedPath) => pathsOverlap(path, protectedPath))) {
            conflicts.push({
              id: makeRealmScopeId("repo_conflict"),
              repositoryBindingId: binding.id,
              conflictType: "protected_path",
              workItemIds: [scope.workItemId],
              severity: "critical",
              resolution: "block",
              rationale: `Path ${path} touches protected repository path.`,
              createdAt: timestamp
            });
          }
        }
      }

      if (leftBinding && rightBinding && leftBinding.id !== rightBinding.id) {
        const leftPackages = left.paths.map((path) => path.split("/").slice(0, 2).join("/"));
        const rightPackages = right.paths.map((path) => path.split("/").slice(0, 2).join("/"));
        if (leftPackages.some((pkg) => rightPackages.includes(pkg))) {
          conflicts.push({
            id: makeRealmScopeId("repo_conflict"),
            repositoryBindingId: left.repositoryBindingId,
            conflictType: "same_package",
            workItemIds: [left.workItemId, right.workItemId],
            severity: "high",
            resolution: "serialize",
            rationale: "Work items target the same package area across bindings.",
            createdAt: timestamp
          });
        }
      }
    }

    const binding = bindingById.get(scopes[i].repositoryBindingId);
    if (binding) {
      if (binding.realmId !== scopes[i].realmId) {
        conflicts.push({
          id: makeRealmScopeId("repo_conflict"),
          repositoryBindingId: binding.id,
          conflictType: "cross_realm_boundary",
          workItemIds: [scopes[i].workItemId],
          severity: "critical",
          resolution: "block",
          rationale: `Work item realm ${scopes[i].realmId} cannot use repository binding for ${binding.realmId}.`,
          createdAt: timestamp
        });
      }

      for (const path of scopes[i].paths) {
        for (const rule of binding.ownershipRules) {
          if (matchesPattern(path, rule.pathPattern) && rule.ownerScope === "realm" &&
              rule.ownerRealmId && scopes[i].realmId !== rule.ownerRealmId) {
            conflicts.push({
              id: makeRealmScopeId("repo_conflict"),
              repositoryBindingId: binding.id,
              conflictType: "cross_realm_boundary",
              workItemIds: [scopes[i].workItemId],
              severity: "critical",
              resolution: "block",
              rationale: `Path ${path} is owned by realm ${rule.ownerRealmId}.`,
              createdAt: timestamp
            });
          }
        }
      }
    }
  }

  return dedupeConflicts(conflicts);
}

function dedupeConflicts(conflicts: RepositoryConflict[]): RepositoryConflict[] {
  const seen = new Set<string>();
  return conflicts.filter((conflict) => {
    const key = `${conflict.conflictType}:${conflict.workItemIds.join("|")}:${conflict.rationale}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildCursorRepositoryContext(binding: RepositoryBinding): CursorRepositoryContext {
  return {
    repositoryBindingId: binding.id,
    repoName: binding.repoName,
    localPath: binding.localPath,
    branchName: binding.defaultBranch,
    worktreePath: binding.worktreeRoot,
    allowedPaths: binding.packagePaths,
    forbiddenPaths: binding.protectedPaths,
    verificationCommands: ["pnpm typecheck", "pnpm test"]
  };
}

export const REPOSITORY_BOUNDARY_PACKET_RULES = [
  "Respect allowedPaths and forbiddenPaths in repositoryContext.",
  "Do not edit files outside the bound realm repository.",
  "Cross-realm changes require explicit approval.",
  "Run verificationCommands before marking work complete."
];

export function hasBlockingRepositoryConflicts(conflicts: RepositoryConflict[]): boolean {
  return conflicts.some(
    (conflict) => conflict.resolution === "block" || conflict.severity === "critical"
  );
}
