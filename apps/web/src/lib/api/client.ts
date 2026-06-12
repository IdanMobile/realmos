const defaultBaseUrl = "http://localhost:4100";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBaseUrl;
}
