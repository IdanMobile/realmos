import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CommandCenterReadyView } from "@/components/CommandCenterReadyView";
import { CommandCenterDashboard } from "@/components/CommandCenterDashboard";
import { createEmptyDashboard, loadMockDashboard } from "@/lib/mock/loadMockDashboard";

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/"
}));

function renderDashboard(viewState: "ready" | "loading" | "error" | "empty" = "ready") {
  const data = viewState === "empty" ? createEmptyDashboard() : loadMockDashboard();
  if (viewState === "ready") {
    render(<CommandCenterReadyView data={data} health={null} dataSource="mock" />);
    return;
  }
  render(<CommandCenterDashboard data={data} viewState={viewState} />);
}

function getActiveSectionRoot() {
  const section = document.querySelector('[data-testid^="command-center-section-"]');
  if (!section) {
    throw new Error("No active section root found");
  }
  return within(section as HTMLElement);
}

function navigateTo(sectionId: string) {
  fireEvent.click(screen.getByTestId(`nav-section-${sectionId}`));
}

describe("Command Center dashboard", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockReplace.mockClear();
  });

  it("renders the dashboard shell", () => {
    renderDashboard();

    expect(screen.getByTestId("command-center-dashboard")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Jarvis HQ", level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId("command-center-search")).toBeDisabled();
    expect(screen.getByTestId("ask-jarvis-button")).toBeDisabled();
  });

  it("shows overview section by default", () => {
    renderDashboard();
    expect(screen.getByTestId("command-center-section-overview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overview", level: 2 })).toBeInTheDocument();
    expect(screen.getByTestId("nav-section-overview")).toHaveAttribute("aria-current", "page");
  });

  it("navigates sections via sidebar and updates URL", () => {
    renderDashboard();
    navigateTo("tasks");
    expect(mockReplace).toHaveBeenCalledWith("/?section=tasks", { scroll: false });
  });

  it("shows governance safety banner on every section", () => {
    mockSearchParams = new URLSearchParams("section=agents");
    renderDashboard();
    expect(screen.getByTestId("governance-safety-banner")).toBeInTheDocument();
  });

  it("renders business cards on Realms section", () => {
    mockSearchParams = new URLSearchParams("section=realms");
    renderDashboard();

    const section = getActiveSectionRoot();
    expect(section.getByLabelText("Ecosystem businesses panel")).toBeInTheDocument();
    expect(section.getByText("RealmOS")).toBeInTheDocument();
  });

  it("renders agents on Agents section", () => {
    mockSearchParams = new URLSearchParams("section=agents");
    renderDashboard();

    const section = getActiveSectionRoot();
    expect(section.getByLabelText("Active agents panel")).toBeInTheDocument();
    expect(section.getByText("Jarvis")).toBeInTheDocument();
    expect(section.getByText("Necromancer")).toBeInTheDocument();
  });

  it("renders self-build console on Realms section", () => {
    mockSearchParams = new URLSearchParams("section=realms");
    renderDashboard();
    expect(getActiveSectionRoot().getByLabelText("Self-build console panel")).toBeInTheDocument();
  });

  it("renders fleet control on Agents section", () => {
    mockSearchParams = new URLSearchParams("section=agents");
    renderDashboard();
    expect(getActiveSectionRoot().getByLabelText("Fleet control panel")).toBeInTheDocument();
  });

  it("renders repository boundary on Realms section", () => {
    mockSearchParams = new URLSearchParams("section=realms");
    renderDashboard();
    const section = getActiveSectionRoot();
    expect(section.getByLabelText("Repository boundary panel")).toBeInTheDocument();
    expect(section.getByText("RealmOS Global")).toBeInTheDocument();
  });

  it("renders project infrastructure on Realms section", () => {
    mockSearchParams = new URLSearchParams("section=realms");
    renderDashboard();
    const section = getActiveSectionRoot();
    expect(section.getByLabelText("Project infrastructure panel")).toBeInTheDocument();
    expect(section.getByText("Platform & Project Infrastructure")).toBeInTheDocument();
  });

  it("renders pending approvals on Overview section", () => {
    renderDashboard();
    const section = getActiveSectionRoot();
    expect(section.getAllByText("Enable terminal runner").length).toBeGreaterThan(0);
    expect(section.getAllByText("Approve").length).toBeGreaterThan(0);
  });

  it("renders system status and operator guide on Overview", () => {
    renderDashboard();
    const section = getActiveSectionRoot();
    expect(section.getByLabelText("System status panel")).toBeInTheDocument();
    expect(section.getByLabelText("Work packet task monitor panel")).toBeInTheDocument();
    expect(section.getByLabelText("Run state handoff panel")).toBeInTheDocument();
    expect(section.getByLabelText("Operator guide panel")).toBeInTheDocument();
  });

  it("renders cost summary on Overview", () => {
    renderDashboard();
    const section = within(getActiveSectionRoot().getByLabelText("Cost budget panel"));
    expect(section.getByText("Cost & Budget")).toBeInTheDocument();
    expect(section.getByText(/Monthly limit/)).toBeInTheDocument();
  });

  it("renders world nodes on Overview", () => {
    renderDashboard();
    const section = getActiveSectionRoot();
    expect(section.getByTestId("world-node-node_jarvis_hq")).toBeInTheDocument();
    expect(section.getByTestId("world-node-node_realm_os")).toBeInTheDocument();
  });

  it("shows decisions placeholder instead of fake content", () => {
    mockSearchParams = new URLSearchParams("section=decisions");
    renderDashboard();
    expect(screen.getByTestId("section-placeholder-decisions")).toBeInTheDocument();
    expect(screen.getByText(/Not implemented yet/)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<CommandCenterDashboard data={loadMockDashboard()} viewState="loading" />);
    expect(screen.getByText(/Loading Command Center state/)).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<CommandCenterDashboard data={createEmptyDashboard()} viewState="empty" />);
    expect(screen.getByText(/No ecosystem data is available yet/)).toBeInTheDocument();
  });

  it("renders memory panel on Memory section", () => {
    mockSearchParams = new URLSearchParams("section=memory");
    renderDashboard();
    const section = within(getActiveSectionRoot().getByLabelText("Memory panel"));
    expect(section.getByText("Memory")).toBeInTheDocument();
    expect(section.getByLabelText("Filter memory by scope")).toBeInTheDocument();
  });

  it("renders tool activity on Live Runs section", () => {
    mockSearchParams = new URLSearchParams("section=runs");
    renderDashboard();
    const section = within(getActiveSectionRoot().getByLabelText("Tool activity panel"));
    expect(section.getByText("Tool Activity")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<CommandCenterDashboard data={loadMockDashboard()} viewState="error" />);
    expect(screen.getByText(/Unable to load dashboard mock data/)).toBeInTheDocument();
  });

  it("blocks side projects in safety banner copy", () => {
    renderDashboard();
    expect(screen.getByText(/Side projects \/ GUING/)).toBeInTheDocument();
    expect(screen.getByText(/blocked until RealmOS base system verified/)).toBeInTheDocument();
  });
});
