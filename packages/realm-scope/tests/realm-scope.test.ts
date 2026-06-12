import { describe, expect, it } from "vitest";
import {
  createDefaultGlobalRealm,
  createDefaultRealmBindings,
  detectRepositoryConflicts,
  enrichCursorWorkPacketWithRepositoryBoundary,
  GLOBAL_SHELL_ROUTES,
  hasBlockingRepositoryConflicts,
  isRealmShellRoute,
  projectShellRoutes
} from "../src/index";

describe("@realmos/realm-scope", () => {
  it("defines global and project shell routes", () => {
    expect(GLOBAL_SHELL_ROUTES.some((route) => route.path === "/")).toBe(true);
    expect(projectShellRoutes("realm_guing", "GUING").some((route) => route.path.includes("realm_guing"))).toBe(
      true
    );
    expect(isRealmShellRoute("/realms/realm_guing/tasks", "realm_guing")).toBe(true);
  });

  it("detects overlapping repository paths", () => {
    const bindings = createDefaultRealmBindings();
    const conflicts = detectRepositoryConflicts(
      [
        {
          workItemId: "w1",
          realmId: "realm_realmos",
          repositoryBindingId: "repo_binding_realmos",
          paths: ["packages/contracts/src/index.ts"]
        },
        {
          workItemId: "w2",
          realmId: "realm_realmos",
          repositoryBindingId: "repo_binding_realmos",
          paths: ["packages/contracts/src/index.ts"]
        }
      ],
      bindings
    );

    expect(conflicts.some((c) => c.conflictType === "overlapping_paths")).toBe(true);
    expect(hasBlockingRepositoryConflicts(conflicts)).toBe(true);
  });

  it("blocks cross-realm path ownership violations", () => {
    const bindings = createDefaultRealmBindings();
    const conflicts = detectRepositoryConflicts(
      [
        {
          workItemId: "w_cross",
          realmId: "realm_guing",
          repositoryBindingId: "repo_binding_realmos",
          paths: ["packages/contracts/src/agent.ts"]
        }
      ],
      bindings
    );

    expect(conflicts.length).toBeGreaterThan(0);
  });

  it("enriches cursor work packets with repository boundary rules", () => {
    const realm = createDefaultGlobalRealm();
    const binding = createDefaultRealmBindings()[0];
    const packet = {
      id: "packet_scope",
      workItemId: "work_scope",
      title: "Cursor packet",
      status: "ready_for_cursor" as const,
      goal: "Update contracts",
      filesToRead: ["CURSOR_SSOT.md"],
      filesToModify: ["packages/contracts/src/index.ts"],
      rules: ["Follow CURSOR_SSOT.md"],
      expectedOutput: ["Tests pass"],
      stopAfter: "Verification",
      createdByAgentId: "agent_jarvis",
      createdAt: new Date().toISOString()
    };

    const enriched = enrichCursorWorkPacketWithRepositoryBoundary({
      packet,
      realmId: realm.id,
      scope: "global",
      repositoryBinding: binding
    });

    expect(enriched.repositoryContext?.repoName).toBe("realmos");
    expect(enriched.rules.some((rule) => rule.includes("allowedPaths"))).toBe(true);
    expect(enriched.scope).toBe("global");
  });
});
