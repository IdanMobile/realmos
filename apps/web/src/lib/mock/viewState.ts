export type DashboardViewState = "ready" | "loading" | "error" | "empty";

export function getDashboardViewMessage(state: DashboardViewState): string {
  switch (state) {
    case "loading":
      return "Loading Command Center state…";
    case "error":
      return "Unable to load dashboard mock data.";
    case "empty":
      return "No ecosystem data is available yet.";
    default:
      return "";
  }
}
