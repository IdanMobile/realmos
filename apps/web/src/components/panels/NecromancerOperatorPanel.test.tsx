import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NecromancerOperatorPanel } from "./NecromancerOperatorPanel";

vi.mock("@/lib/api/necromancer", () => ({
  fetchNecromancerCandidates: vi.fn(),
  fetchNecromancerCandidate: vi.fn(),
  fetchNecromancerActions: vi.fn(),
  fetchNecromancerStatus: vi.fn(),
  prepareNecromancerCandidate: vi.fn(),
  runNecromancerCandidateAction: vi.fn()
}));

import {
  fetchNecromancerActions,
  fetchNecromancerCandidate,
  fetchNecromancerCandidates,
  fetchNecromancerStatus,
  type NecromancerActionRecord
} from "@/lib/api/necromancer";

const candidate = {
  id: "agent:agent_test",
  kind: "agent" as const,
  entityId: "agent_test",
  classification: "stale" as const,
  riskLevel: "low" as const,
  title: "Test Agent",
  currentStatus: "testing",
  reason: "Stale testing agent.",
  protected: false,
  sideProjectBlocked: false,
  recommendedAction: "observe" as const
};

function mockLiveApi(overrides?: {
  durable?: boolean;
  actions?: NecromancerActionRecord[];
}) {
  vi.mocked(fetchNecromancerCandidates).mockResolvedValue({
    ok: true,
    data: {
      items: [candidate],
      totalCount: 1,
      protectedCount: 0,
      safetyNotice: "safe",
      persistenceMode: overrides?.durable ? "postgres" : "memory",
      durable: overrides?.durable ?? false
    }
  });
  vi.mocked(fetchNecromancerActions).mockResolvedValue({
    ok: true,
    data: {
      items: overrides?.actions ?? [],
      persistenceMode: overrides?.durable ? "postgres" : "memory",
      durable: overrides?.durable ?? false
    }
  });
  vi.mocked(fetchNecromancerStatus).mockResolvedValue({
    ok: true,
    data: {
      persistenceMode: overrides?.durable ? "postgres" : "memory",
      durable: overrides?.durable ?? false,
      safetyNotice: "safe",
      noDeleteEndpoint: true,
      noAutomaticCleanup: true
    }
  });
  vi.mocked(fetchNecromancerCandidate).mockResolvedValue({
    ok: true,
    data: {
      candidate,
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
}

describe("NecromancerOperatorPanel", () => {
  it("shows mock mode error", () => {
    render(<NecromancerOperatorPanel dataSource="mock" />);
    expect(screen.getByText(/requires live API/i)).toBeInTheDocument();
  });

  it("shows empty state when no candidates", async () => {
    vi.mocked(fetchNecromancerCandidates).mockResolvedValue({
      ok: true,
      data: {
        items: [],
        totalCount: 0,
        protectedCount: 0,
        safetyNotice: "safe",
        persistenceMode: "memory",
        durable: false
      }
    });
    vi.mocked(fetchNecromancerActions).mockResolvedValue({
      ok: true,
      data: { items: [], persistenceMode: "memory", durable: false }
    });
    vi.mocked(fetchNecromancerStatus).mockResolvedValue({
      ok: true,
      data: {
        persistenceMode: "memory",
        durable: false,
        safetyNotice: "safe",
        noDeleteEndpoint: true,
        noAutomaticCleanup: true
      }
    });

    render(<NecromancerOperatorPanel dataSource="api" />);

    await waitFor(() => {
      expect(screen.getByText(/No Necromancer candidates detected/i)).toBeInTheDocument();
    });
  });

  it("renders candidate list, persistence badge, and safety notice", async () => {
    mockLiveApi({ durable: true });

    render(<NecromancerOperatorPanel dataSource="api" />);

    await waitFor(() => {
      expect(screen.getByText("Test Agent")).toBeInTheDocument();
    });
    expect(screen.getByText(/No autonomous cleanup/i)).toBeInTheDocument();
    expect(screen.getByText(/Durable Postgres/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("requires approval before gated actions", async () => {
    mockLiveApi();

    render(<NecromancerOperatorPanel dataSource="api" />);
    await waitFor(() => expect(screen.getByText("Test Agent")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await waitFor(() => {
      expect(screen.getByText(/Operator approval and ID are required/i)).toBeInTheDocument();
    });
  });

  it("shows persisted action history with evidence reference", async () => {
    mockLiveApi({
      actions: [
        {
          id: "necromancer_action_1",
          candidateId: "agent:agent_test",
          action: "protect",
          operatorId: "operator",
          approved: true,
          outcome: "applied",
          summary: "Protected candidate",
          createdAt: "2026-06-13T10:00:00.000Z",
          evidenceId: "verify_evidence_1",
          evidenceStatus: "linked"
        }
      ]
    });

    render(<NecromancerOperatorPanel dataSource="api" />);
    await waitFor(() => expect(screen.getByText(/Recent actions \(persisted\)/i)).toBeInTheDocument());
    expect(screen.getByText(/evidence:verify_evidence_1/i)).toBeInTheDocument();
  });
});
