function titleCase(value: string): string {
  return value
    .replace(/-/g, " ")
    .replace(/\w[\w]*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function inferBusinessName(ideaText: string, proposedName?: string): string {
  if (proposedName?.trim()) {
    return proposedName.trim();
  }

  const trimmed = ideaText.trim();
  const match = trimmed.match(/(?:idea for (?:a |an )?)(.+?)(?:[.,]|$|\s+create\b)/i);
  if (match?.[1]) {
    return titleCase(match[1].trim());
  }

  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() ?? trimmed;
  return titleCase(firstSentence.slice(0, 60));
}

export function summarizeMission(ideaText: string): string {
  const trimmed = ideaText.trim();
  if (trimmed.length <= 160) {
    return trimmed;
  }

  return `${trimmed.slice(0, 157)}...`;
}
