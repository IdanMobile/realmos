import { describe, expect, it, vi } from "vitest";
import {
  fetchNecromancerActions,
  fetchNecromancerCandidates,
  runNecromancerCandidateAction
} from "./necromancer";

describe("necromancer api client", () => {
  it("fetches candidates", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [],
          totalCount: 0,
          protectedCount: 0,
          safetyNotice: "No autonomous destructive actions."
        }),
        { status: 200 }
      )
    );

    const result = await fetchNecromancerCandidates("http://localhost:4100");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.totalCount).toBe(0);
    }

    fetchMock.mockRestore();
  });

  it("reports API unavailable", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));
    const result = await fetchNecromancerCandidates("http://localhost:4100");
    expect(result.ok).toBe(false);
    vi.restoreAllMocks();
  });

  it("sends approval payload for operator actions", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ candidate: { id: "agent:a1" }, actionRecord: { id: "x" } }), {
        status: 200
      })
    );

    await runNecromancerCandidateAction("agent:a1", "pause", {
      approved: true,
      operatorId: "operator"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4100/api/necromancer/candidates/agent%3Aa1/pause",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ approved: true, operatorId: "operator" })
      })
    );

    fetchMock.mockRestore();
  });

  it("fetches action history", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), { status: 200 })
    );

    const result = await fetchNecromancerActions("http://localhost:4100");
    expect(result.ok).toBe(true);
    fetchMock.mockRestore();
  });
});
