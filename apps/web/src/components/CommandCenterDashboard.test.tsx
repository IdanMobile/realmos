import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandCenterDashboard } from "@/components/CommandCenterDashboard";
import { createEmptyDashboard, loadMockDashboard } from "@/lib/mock/loadMockDashboard";

function renderDashboard(viewState: "ready" | "loading" | "error" | "empty" = "ready") {
  const data = viewState === "empty" ? createEmptyDashboard() : loadMockDashboard();
  render(<CommandCenterDashboard data={data} viewState={viewState} />);
  return within(screen.getAllByTestId("command-center-dashboard")[0] ?? screen.getByRole("main"));
}

describe("Command Center dashboard", () => {
  it("renders the dashboard shell", () => {
    render(<CommandCenterDashboard data={loadMockDashboard()} />);

    expect(screen.getAllByTestId("command-center-dashboard").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Jarvis HQ", level: 1 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search agents, tasks, approvals/)).toBeInTheDocument();
  });

  it("renders business cards", () => {
    const dashboard = renderDashboard();
    const panel = within(dashboard.getByLabelText("Ecosystem businesses panel"));

    expect(panel.getByText("RealmOS")).toBeInTheDocument();
    expect(panel.getByText("GUING")).toBeInTheDocument();
  });

  it("renders agents", () => {
    const dashboard = renderDashboard();
    const panel = within(dashboard.getByLabelText("Active agents panel"));

    expect(panel.getByText("Jarvis")).toBeInTheDocument();
    expect(panel.getByText("Necromancer")).toBeInTheDocument();
  });

  it("renders self-build console panel", () => {
    const dashboard = renderDashboard();
    expect(dashboard.getByLabelText("Self-build console panel")).toBeInTheDocument();
  });

  it("renders fleet control panel", () => {
    const dashboard = renderDashboard();
    expect(dashboard.getByLabelText("Fleet control panel")).toBeInTheDocument();
  });

  it("renders repository boundary panel", () => {
    const dashboard = renderDashboard();
    expect(dashboard.getByLabelText("Repository boundary panel")).toBeInTheDocument();
    expect(dashboard.getByText("RealmOS Global")).toBeInTheDocument();
  });

  it("renders project infrastructure panel", () => {
    const dashboard = renderDashboard();
    expect(dashboard.getByLabelText("Project infrastructure panel")).toBeInTheDocument();
    expect(dashboard.getByText("Platform & Project Infrastructure")).toBeInTheDocument();
  });

  it("renders pending approvals", () => {
    const dashboard = renderDashboard();

    expect(dashboard.getAllByText("Enable terminal runner").length).toBeGreaterThan(0);
    expect(dashboard.getAllByText("Approve").length).toBeGreaterThan(0);
  });

  it("renders system status and operator guide", () => {
    const dashboard = renderDashboard();
    expect(dashboard.getByLabelText("System status panel")).toBeInTheDocument();
    expect(dashboard.getByLabelText("Operator guide panel")).toBeInTheDocument();
  });

  it("renders cost summary", () => {
    const dashboard = renderDashboard();
    const panel = within(dashboard.getByLabelText("Cost budget panel"));

    expect(panel.getByText("Cost & Budget")).toBeInTheDocument();
    expect(panel.getByText(/Monthly limit/)).toBeInTheDocument();
    expect(panel.getByText(/openai · gpt-4.1-mini/i)).toBeInTheDocument();
  });

  it("renders world nodes", () => {
    const dashboard = renderDashboard();

    expect(dashboard.getByTestId("world-node-node_jarvis_hq")).toBeInTheDocument();
    expect(dashboard.getByTestId("world-node-node_realm_os")).toBeInTheDocument();
    expect(dashboard.getByTestId("world-node-node_guing")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<CommandCenterDashboard data={loadMockDashboard()} viewState="loading" />);

    expect(screen.getByText(/Loading Command Center state/)).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<CommandCenterDashboard data={createEmptyDashboard()} viewState="empty" />);

    expect(screen.getByText(/No ecosystem data is available yet/)).toBeInTheDocument();
  });

  it("renders memory panel with scoped entries", () => {
    const dashboard = renderDashboard();
    const panel = within(dashboard.getByLabelText("Memory panel"));

    expect(panel.getByText("Memory")).toBeInTheDocument();
    expect(panel.getByLabelText("Filter memory by scope")).toBeInTheDocument();
  });

  it("renders tool activity panel", () => {
    const dashboard = renderDashboard();
    const panel = within(dashboard.getByLabelText("Tool activity panel"));
    expect(panel.getByText("Tool Activity")).toBeInTheDocument();
    expect(panel.getByText("Draft business spec")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<CommandCenterDashboard data={loadMockDashboard()} viewState="error" />);

    expect(screen.getByText(/Unable to load dashboard mock data/)).toBeInTheDocument();
  });
});
