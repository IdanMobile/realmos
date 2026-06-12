import type { ToolDefinition } from "@realmos/contracts";

export const DEFAULT_TOOL_REGISTRY: ToolDefinition[] = [
  {
    id: "tool_filesystem_draft",
    tool: "filesystem",
    label: "Filesystem Draft Writer",
    description: "Prepare draft file content without writing to disk in MVP.",
    defaultAccess: "write",
    riskLevel: "low",
    requiresApproval: false,
    enabled: true,
    dryRunOnly: true,
    allowedInMvp: true
  },
  {
    id: "tool_terminal",
    tool: "terminal",
    label: "Terminal Command Runner",
    description: "Request terminal commands. Execution disabled by default; approval required.",
    defaultAccess: "execute",
    riskLevel: "high",
    requiresApproval: true,
    enabled: true,
    dryRunOnly: true,
    allowedInMvp: true
  },
  {
    id: "tool_browser",
    tool: "browser",
    label: "Browser Automation",
    description: "Blocked in MVP until Tool Safety Review passes.",
    defaultAccess: "execute",
    riskLevel: "critical",
    requiresApproval: true,
    enabled: false,
    dryRunOnly: true,
    allowedInMvp: false
  },
  {
    id: "tool_camera",
    tool: "camera",
    label: "Camera Access",
    description: "Blocked in MVP.",
    defaultAccess: "execute",
    riskLevel: "critical",
    requiresApproval: true,
    enabled: false,
    dryRunOnly: true,
    allowedInMvp: false
  },
  {
    id: "tool_microphone",
    tool: "microphone",
    label: "Microphone Access",
    description: "Blocked in MVP.",
    defaultAccess: "execute",
    riskLevel: "critical",
    requiresApproval: true,
    enabled: false,
    dryRunOnly: true,
    allowedInMvp: false
  }
];

export function getToolDefinition(tool: ToolDefinition["tool"]): ToolDefinition | undefined {
  return DEFAULT_TOOL_REGISTRY.find((entry) => entry.tool === tool);
}

export function listEnabledMvpTools(): ToolDefinition[] {
  return DEFAULT_TOOL_REGISTRY.filter((entry) => entry.enabled && entry.allowedInMvp);
}
