export type ShellRouteDefinition = {
  path: string;
  label: string;
  scope: "global" | "realm";
  realmId?: string;
};

export const GLOBAL_SHELL_ROUTES: ShellRouteDefinition[] = [
  { path: "/", label: "Command Center", scope: "global" },
  { path: "/approvals", label: "Approval Queue", scope: "global" },
  { path: "/memory", label: "Memory Summaries", scope: "global" },
  { path: "/costs", label: "Cost & Budget", scope: "global" },
  { path: "/world", label: "World Preview", scope: "global" },
  { path: "/self-build", label: "Self-Build Console", scope: "global" },
  { path: "/fleet", label: "Fleet Control", scope: "global" },
  { path: "/repository", label: "Repository Boundaries", scope: "global" }
];

export function projectShellRoutes(realmId: string, realmName: string): ShellRouteDefinition[] {
  const prefix = `/realms/${realmId}`;
  return [
    { path: prefix, label: `${realmName} Overview`, scope: "realm", realmId },
    { path: `${prefix}/agents`, label: "Realm Agents", scope: "realm", realmId },
    { path: `${prefix}/tasks`, label: "Realm Tasks", scope: "realm", realmId },
    { path: `${prefix}/artifacts`, label: "SpecKit Artifacts", scope: "realm", realmId },
    { path: `${prefix}/repository`, label: "Repository Bindings", scope: "realm", realmId },
    { path: `${prefix}/memory`, label: "Realm Memory", scope: "realm", realmId }
  ];
}

export function isGlobalShellRoute(path: string): boolean {
  return GLOBAL_SHELL_ROUTES.some((route) => route.path === path);
}

export function isRealmShellRoute(path: string, realmId: string): boolean {
  return path.startsWith(`/realms/${realmId}`);
}
