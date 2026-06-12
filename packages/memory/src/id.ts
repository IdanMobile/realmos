export function nowIso(): string {
  return new Date().toISOString();
}

export function makeMemoryId(label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 32);
  return `memory_${slug || "item"}_${Date.now().toString(36)}`;
}
