import type { ToolRunRequest, ToolRunResult } from "@realmos/contracts";

export type DryRunFilesystemPayload = {
  path: string;
  content: string;
};

export type DryRunTerminalPayload = {
  command: string;
  cwd?: string;
};

export function dryRunFilesystemDraft(payload: DryRunFilesystemPayload): ToolRunResult["output"] {
  return [
    "[dry-run] filesystem draft writer",
    `path: ${payload.path}`,
    `bytes: ${payload.content.length}`,
    "action: would write draft content (not persisted in MVP)"
  ].join("\n");
}

export function dryRunTerminalCommand(payload: DryRunTerminalPayload): ToolRunResult["output"] {
  return [
    "[dry-run] terminal command request",
    `command: ${payload.command}`,
    payload.cwd ? `cwd: ${payload.cwd}` : "cwd: (default)",
    "action: command not executed (terminal disabled by default)"
  ].join("\n");
}

export function executeDryRun(request: ToolRunRequest): Pick<ToolRunResult, "status" | "output"> {
  if (request.kind === "filesystem_draft") {
    return {
      status: "dry_run",
      output: dryRunFilesystemDraft({
        path: String(request.payload.path ?? "draft.md"),
        content: String(request.payload.content ?? "")
      })
    };
  }

  return {
    status: "dry_run",
    output: dryRunTerminalCommand({
      command: String(request.payload.command ?? ""),
      cwd: request.payload.cwd ? String(request.payload.cwd) : undefined
    })
  };
}

export function mockExecuteApprovedRequest(request: ToolRunRequest): Pick<ToolRunResult, "status" | "output"> {
  if (request.kind === "terminal_command") {
    return {
      status: "not_executed",
      output: "Terminal execution remains disabled. Set REALMOS_ALLOW_TERMINAL=true in realmos/.env after explicit operator approval."
    };
  }

  return {
    status: "mock_success",
    output: `[mock] Draft prepared for ${String(request.payload.path ?? "draft.md")}`
  };
}
