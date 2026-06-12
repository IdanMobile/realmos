const DANGEROUS_TERMINAL_PATTERNS = [
  /\brm\s+-rf\b/i,
  /\bsudo\b/i,
  /\bchmod\s+777\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  />\s*\/dev\//i,
  /\bcurl\b[^\n]*\|\s*bash\b/i,
  /\bwget\b[^\n]*\|\s*sh\b/i
];

export function isDangerousTerminalCommand(command: string): boolean {
  const normalized = command.trim();
  return DANGEROUS_TERMINAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

export const FORBIDDEN_TOOL_NAMES = new Set(["browser", "camera", "microphone", "gmail"]);

export function isForbiddenToolForMvp(tool: string): boolean {
  return FORBIDDEN_TOOL_NAMES.has(tool);
}
