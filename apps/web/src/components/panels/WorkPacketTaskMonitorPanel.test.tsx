import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkPacketTaskMonitorPanel } from "@/components/panels/WorkPacketTaskMonitorPanel";

vi.mock("@/lib/api/work-packet-lifecycle", () => ({
  fetchLifecyclePackets: vi.fn(async () => ({ ok: true, data: [] })),
  markLifecyclePacketReady: vi.fn(),
  approveLifecyclePacket: vi.fn(),
  dispatchLifecyclePacket: vi.fn(),
  recordLifecyclePacketResult: vi.fn(),
  attachLifecycleVerification: vi.fn(),
  closeLifecyclePacket: vi.fn()
}));

vi.mock("@/lib/api/executor-bridge", () => ({
  fetchExecutorBridgeStatus: vi.fn(async () => ({
    enabled: true,
    mode: "dry_run",
    queueRoot: "/tmp/queue",
    queuedCount: 0,
    dispatchedCount: 0,
    runningCount: 0,
    completedCount: 0,
    failedCount: 0,
    blockedCount: 0,
    lastDispatch: null
  })),
  fetchExecutorDispatches: vi.fn(async () => [])
}));

describe("WorkPacketTaskMonitorPanel", () => {
  it("renders safety banner and dry-run flags", async () => {
    render(<WorkPacketTaskMonitorPanel dataSource="api" health={null} />);

    const panel = await screen.findByLabelText("Work packet task monitor panel");
    expect(within(panel).getByText(/Dry-run only/i)).toBeInTheDocument();
    expect(within(panel).getByText(/shellExecution=false/i)).toBeInTheDocument();
    expect(within(panel).getByText(/automaticExecution=false/i)).toBeInTheDocument();
    expect(within(panel).getByText(/Cursor CLI not invoked/i)).toBeInTheDocument();
  });

  it("shows mock mode warning when API data source unavailable", () => {
    render(<WorkPacketTaskMonitorPanel dataSource="mock" health={null} />);
    expect(screen.getByText(/Mock data mode/i)).toBeInTheDocument();
  });
});
