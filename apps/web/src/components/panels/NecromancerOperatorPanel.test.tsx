import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NecromancerOperatorPanel } from "./NecromancerOperatorPanel";

vi.mock("@/lib/api/necromancer", () => ({
  fetchNecromancerCandidates: vi.fn(),
  fetchNecromancerCandidate: vi.fn(),
  fetchNecromancerActions: vi.fn(),
  prepareNecromancerCandidate: vi.fn(),
  runNecromancerCandidateAction: vi.fn()
}));

import {
  fetchNecromancerActions,
  fetchNecromancerCandidate,
  fetchNecromancerCandidates
} from "@/lib/api/necromancer";

describe("NecromancerOperatorPanel", () => {
  it("shows mock mode error", () => {
    render(<NecromancerOperatorPanel dataSource="mock" />);
    expect(screen.getByText(/requires live API/i)).toBeInTheDocument();
  });

  it("shows empty state when no candidates", async () => {
    vi.mocked(fetchNecromancerCandidates).mockResolvedValue({
      ok: true,
      data: { items: [], totalCount: 0, protectedCount: 0, safetyNotice: "safe" }
    });
    vi.mocked(fetchNecromancerActions).mockResolvedValue({ ok: true, data: { items: [] } });

    render(<NecromancerOperatorPanel dataSource="api" />);

    await waitFor(() => {
      expect(screen.getByText(/No Necromancer candidates detected/i)).toBeInTheDocument();
    });
  });

  it("renders candidate list and safety notice", async () => {
    vi.mocked(fetchNecromancerCandidates).mockResolvedValue({
      ok: true,
      data: {
        items: [
          {
            id: "agent:agent_test",
            kind: "agent",
            entityId: "agent_test",
            classification: "stale",
            riskLevel: "low",
            title: "Test Agent",
            currentStatus: "testing",
            reason: "Stale testing agent.",
            protected: false,
            sideProjectBlocked: false,
            recommendedAction: "observe"
          }
        ],
        totalCount: 1,
        protectedCount: 0,
        safetyNotice: "safe"
      }
    });
    vi.mocked(fetchNecromancerActions).mockResolvedValue({ ok: true, data: { items: [] } });
    vi.mocked(fetchNecromancerCandidate).mockResolvedValue({
      ok: true,
      data: {
        candidate: {
          id: "agent:agent_test",
          kind: "agent",
          entityId: "agent_test",
          classification: "stale",
          riskLevel: "low",
          title: "Test Agent",
          currentStatus: "testing",
          reason: "Stale testing agent.",
          protected: false,
          sideProjectBlocked: false,
          recommendedAction: "observe"
        },
        recommendation: {
          candidateId: "agent:agent_test",
          summary: "summary",
          recommendation: "Monitor candidate.",
          allowedActions: ["prepare", "pause", "protect"],
          requiresApproval: true,
          safetyNotes: ["No autonomous destructive actions"],
          blockedActions: ["delete"]
        }
      }
    });

    render(<NecromancerOperatorPanel dataSource="api" />);

    await waitFor(() => {
      expect(screen.getByText("Test Agent")).toBeInTheDocument();
    });
    expect(screen.getByText(/No autonomous destructive actions/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("requires approval before gated actions", async () => {
    vi.mocked(fetchNecromancerCandidates).mockResolvedValue({
      ok: true,
      data: {
        items: [
          {
            id: "agent:agent_test",
            kind: "agent",
            entityId: "agent_test",
            classification: "stale",
            riskLevel: "low",
            title: "Test Agent",
            currentStatus: "testing",
            reason: "Stale.",
            protected: false,
            sideProjectBlocked: false,
            recommendedAction: "observe"
          }
        ],
        totalCount: 1,
        protectedCount: 0,
        safetyNotice: "safe"
      }
    });
    vi.mocked(fetchNecromancerActions).mockResolvedValue({ ok: true, data: { items: [] } });
    vi.mocked(fetchNecromancerCandidate).mockResolvedValue({
      ok: true,
      data: {
        candidate: {
          id: "agent:agent_test",
          kind: "agent",
          entityId: "agent_test",
          classification: "stale",
          riskLevel: "low",
          title: "Test Agent",
          currentStatus: "testing",
          reason: "Stale.",
          protected: false,
          sideProjectBlocked: false,
          recommendedAction: "observe"
        },
        recommendation: {
          candidateId: "agent:agent_test",
          summary: "summary",
          recommendation: "Monitor.",
          allowedActions: ["prepare"],
          requiresApproval: true,
          safetyNotes: [],
          blockedActions: []
        }
      }
    });

    render(<NecromancerOperatorPanel dataSource="api" />);
    await waitFor(() => expect(screen.getByText("Test Agent")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await waitFor(() => {
      expect(screen.getByText(/Operator approval and ID are required/i)).toBeInTheDocument();
    });
  });
});
