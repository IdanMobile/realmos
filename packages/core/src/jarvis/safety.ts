export type JarvisSafetyCheck = {
  blocked: boolean;
  reason?: string;
};

const UNSAFE_ACTION_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\b(run|exec(ute)?)\s+(shell|bash|terminal|command|script)\b/i,
    reason: "Shell execution is disabled in Jarvis operator chat."
  },
  {
    pattern: /\bcursor\s*cli\b/i,
    reason: "Cursor CLI invocation is not allowed from Jarvis."
  },
  {
    pattern: /\b(dispatch|approve|create)\b.*\b(work\s*packet|lifecycle\s*packet)\b/i,
    reason: "Work packet actions must use Command Center lifecycle controls, not Jarvis chat."
  },
  {
    pattern: /\b(start|launch|bootstrap|begin)\b.*\b(guing|side\s*project)\b/i,
    reason: "GUING and side projects are blocked until the RealmOS base system is verified."
  },
  {
    pattern: /\b(invoke|call|run)\b.*\b(tool|agent|executor)\b/i,
    reason: "Jarvis cannot invoke tools or executors in operator chat."
  }
];

export function detectUnsafeJarvisRequest(message: string): JarvisSafetyCheck {
  const normalized = message.trim();
  if (!normalized) {
    return { blocked: true, reason: "Message cannot be empty." };
  }

  for (const entry of UNSAFE_ACTION_PATTERNS) {
    if (entry.pattern.test(normalized)) {
      return { blocked: true, reason: entry.reason };
    }
  }

  return { blocked: false };
}
