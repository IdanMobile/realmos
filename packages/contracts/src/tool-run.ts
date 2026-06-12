import type { RiskLevel } from "./approval";
import type { ToolName } from "./tool";
export type { ToolName } from "./tool";

export type ToolRunKind = "filesystem_draft" | "terminal_command";

export type ToolRunStatus =
  | "requested"
  | "pending_approval"
  | "dry_run"
  | "approved_not_executed"
  | "blocked"
  | "completed_mock";

export type ToolDefinition = {
  id: string;
  tool: ToolName;
  label: string;
  description: string;
  defaultAccess: "none" | "read" | "write" | "execute";
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  enabled: boolean;
  dryRunOnly: boolean;
  allowedInMvp: boolean;
};

export type ToolRunRequest = {
  id: string;
  kind: ToolRunKind;
  tool: ToolName;
  agentId?: string;
  businessId?: string;
  title: string;
  payload: Record<string, unknown>;
  status: ToolRunStatus;
  riskLevel: RiskLevel;
  approvalId?: string;
  dryRun: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ToolRunResultStatus = "dry_run" | "mock_success" | "blocked" | "not_executed";

export type ToolRunResult = {
  id: string;
  requestId: string;
  status: ToolRunResultStatus;
  output?: string;
  error?: string;
  createdAt: string;
};

export type ToolRunnerMode = "dry_run" | "mock";
