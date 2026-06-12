function nowIso(): string {
  return new Date().toISOString();
}

export function makeCommunicationId(prefix: string, label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 32);
  return `${prefix}_${slug || "item"}_${Date.now().toString(36)}`;
}

export { nowIso };
