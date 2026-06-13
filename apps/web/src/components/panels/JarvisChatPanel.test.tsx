import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { JarvisChatPanel } from "./JarvisChatPanel";

vi.mock("@/lib/api/jarvis-chat", () => ({
  sendJarvisOperatorChat: vi.fn()
}));

import { sendJarvisOperatorChat } from "@/lib/api/jarvis-chat";

const health = {
  status: "ok" as const,
  service: "realmos-api",
  version: "0.31.0",
  timestamp: new Date().toISOString(),
  checks: {
    database: { status: "ok" as const },
    ollama: {
      status: "ok" as const,
      baseUrl: "http://127.0.0.1:11434",
      defaultModel: "llama3.2:3b",
      fallbackActive: false
    },
    firebase: {
      status: "not_configured" as const,
      mode: "none" as const,
      projectId: null,
      adminStatus: "not_configured" as const,
      services: { auth: "not_configured" as const, firestore: "not_configured" as const, storage: "not_configured" as const },
      emulatorHosts: {}
    },
    executor: {
      enabled: true,
      mode: "dry_run" as const,
      queueRoot: ".realmos/executor-queue",
      queuedCount: 0,
      dispatchedCount: 0,
      runningCount: 0,
      completedCount: 0,
      failedCount: 0,
      blockedCount: 0,
      lastDispatchId: null,
      lastDispatchStatus: null
    },
    lifecycle: {
      totalCount: 0,
      approvalNeededCount: 0,
      dispatchedCount: 0,
      awaitingResultCount: 0,
      verificationPendingCount: 0,
      latestPacketId: null,
      latestPacketStatus: null
    },
    runState: {
      totalCount: 0,
      handoffRequiredCount: 0,
      handoffUpdatedCount: 0,
      latestRunStateId: null,
      latestNextRecommendedInitiative: "0.32 — Necromancer Verification"
    },
    terminal: { enabled: false },
    onlineModels: { enabled: false, configured: false }
  }
};

describe("JarvisChatPanel", () => {
  beforeEach(() => {
    vi.mocked(sendJarvisOperatorChat).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state and safety notice", () => {
    render(<JarvisChatPanel health={health} dataSource="api" onClose={() => undefined} />);
    expect(screen.getByTestId("jarvis-chat-panel")).toBeInTheDocument();
    expect(screen.getByTestId("jarvis-safety-notice")).toHaveTextContent(/cannot execute actions/i);
    expect(screen.getByTestId("jarvis-model-badge")).toHaveTextContent("llama3.2:3b");
  });

  it("shows mock mode error without calling API", async () => {
    render(<JarvisChatPanel health={health} dataSource="mock" onClose={() => undefined} />);
    fireEvent.change(screen.getByTestId("jarvis-chat-input"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByTestId("jarvis-chat-submit"));
    expect(sendJarvisOperatorChat).not.toHaveBeenCalled();
    expect(await screen.findByText(/requires Live API mode/i)).toBeInTheDocument();
  });

  it("displays assistant response with routing metadata", async () => {
    vi.mocked(sendJarvisOperatorChat).mockResolvedValue({
      ok: true,
      data: {
        mode: "operator",
        reply: "Next initiative is 0.32.",
        actions: [],
        routing: {
          provider: "ollama",
          source: "ollama",
          model: "llama3.2:3b",
          fallbackActive: false,
          executeAllowed: false
        }
      }
    });

    render(<JarvisChatPanel health={health} dataSource="api" onClose={() => undefined} />);
    fireEvent.change(screen.getByTestId("jarvis-chat-input"), { target: { value: "What is next?" } });
    fireEvent.click(screen.getByTestId("jarvis-chat-submit"));

    await waitFor(() => {
      expect(screen.getByText("Next initiative is 0.32.")).toBeInTheDocument();
    });
    expect(screen.getByTestId("jarvis-message-routing")).toHaveTextContent(/llama3.2:3b/);
  });

  it("shows fallback badge when health reports degraded ollama", () => {
    render(
      <JarvisChatPanel
        health={{
          ...health,
          checks: {
            ...health.checks,
            ollama: { ...health.checks.ollama, status: "unreachable", fallbackActive: true }
          }
        }}
        dataSource="api"
        onClose={() => undefined}
      />
    );
    expect(screen.getByTestId("jarvis-source-badge")).toHaveTextContent(/fallback/i);
  });
});
