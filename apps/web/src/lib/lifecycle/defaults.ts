/** RealmOS-safe defaults for work packet creation (base-system scope only). */
export const REALMOS_LIFECYCLE_DEFAULTS = {
  realmId: "realm_realmos",
  repositoryId: "repo_realmos",
  branchTarget: "main",
  initiativeId: "0.37",
  allowedPathsText: "apps/web\npackages/work-loop\ndocs/realmos-package",
  forbiddenPathsText: ".env\n.realmos/\nnode_modules/",
  verificationCommandsText: "pnpm test\npnpm typecheck\npnpm build",
  expectedArtifactsText: "Initiative completion notes\nUpdated audit doc",
  instructions:
    "RealmOS base-system work only. No shell execution. No Cursor CLI auto-invoke. No GUING or side projects. Human applies code changes in editor after dry-run dispatch."
} as const;

export const ALLOWED_REALM_IDS = ["realm_realmos", "realm_realm_os"] as const;

export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
