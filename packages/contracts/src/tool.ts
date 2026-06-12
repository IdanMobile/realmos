export type ToolName =
  | "terminal"
  | "filesystem"
  | "browser"
  | "github"
  | "figma"
  | "gmail"
  | "calendar"
  | "n8n"
  | "camera"
  | "microphone"
  | "apple_shortcuts"
  | "local_network";

export type ToolPermission = {
  tool: ToolName;
  access: "none" | "read" | "write" | "execute";
  requiresApproval: boolean;
  maxRiskLevel: "low" | "medium" | "high";
};
