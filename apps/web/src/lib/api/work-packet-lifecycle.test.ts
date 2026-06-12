import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  approveLifecyclePacket,
  dispatchLifecyclePacket,
  fetchLifecyclePackets,
  markLifecyclePacketReady
} from "./work-packet-lifecycle";

describe("work packet lifecycle API client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps list packets response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [{ id: "wpl_1", status: "draft" }] }), { status: 200 })
    );

    const result = await fetchLifecyclePackets("http://localhost:4100");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data[0]?.id).toBe("wpl_1");
    }
    expect(fetch).toHaveBeenCalledWith("http://localhost:4100/api/lifecycle/packets", { cache: "no-store" });
  });

  it("returns API unavailable on network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const result = await fetchLifecyclePackets("http://localhost:4100");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("API unavailable");
  });

  it("surfaces validation errors from mark ready", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: "Readiness validation failed",
          details: [{ field: "expectedArtifacts", message: "required" }]
        }),
        { status: 400 }
      )
    );

    const result = await markLifecyclePacketReady("wpl_1", "http://localhost:4100");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.message).toContain("Readiness");
    }
  });

  it("calls approve endpoint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "wpl_1", status: "approved" }), { status: 200 })
    );

    await approveLifecyclePacket("wpl_1", "operator", "http://localhost:4100");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4100/api/lifecycle/packets/wpl_1/approve",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("calls dispatch endpoint for dry-run bridge", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          packet: { id: "wpl_1", status: "awaiting_result" },
          dispatch: { id: "exec_1", status: "dispatched" }
        }),
        { status: 200 }
      )
    );

    const result = await dispatchLifecyclePacket("wpl_1", "http://localhost:4100");
    expect(result.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4100/api/lifecycle/packets/wpl_1/dispatch",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("surfaces approval-missing dispatch conflict", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Only approved packets can be dispatched." }), { status: 409 })
    );

    const result = await dispatchLifecyclePacket("wpl_draft", "http://localhost:4100");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(409);
  });
});
