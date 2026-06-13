import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkPacketCreatePanel } from "@/components/panels/WorkPacketCreatePanel";

vi.mock("@/lib/api/work-packet-lifecycle", () => ({
  createLifecyclePacket: vi.fn(async () => ({
    ok: true,
    data: { id: "wpl_test_1", status: "draft" }
  }))
}));

describe("WorkPacketCreatePanel", () => {
  it("shows mock mode guard", () => {
    render(<WorkPacketCreatePanel dataSource="mock" />);
    expect(screen.getByText(/Live API required/i)).toBeInTheDocument();
  });

  it("renders create form with RealmOS realm options only", () => {
    render(<WorkPacketCreatePanel dataSource="api" />);
    const realm = screen.getByTestId("work-packet-create-realm");
    expect(realm.tagName).toBe("SELECT");
    const options = within(realm).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["realm_realmos", "realm_realm_os"]);
    expect(screen.getAllByText(/Dry-run dispatch only/i).length).toBeGreaterThan(0);
  });

  it("creates draft when form is valid", async () => {
    const onCreated = vi.fn();
    render(<WorkPacketCreatePanel dataSource="api" onCreated={onCreated} />);

    fireEvent.change(screen.getByTestId("work-packet-create-objective"), {
      target: { value: "E2E UI create test packet" }
    });
    fireEvent.click(screen.getByTestId("work-packet-create-governance-checkbox"));
    fireEvent.click(screen.getByTestId("work-packet-create-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("work-packet-create-success")).toBeInTheDocument();
    });
    expect(onCreated).toHaveBeenCalledWith("wpl_test_1");
  });
});
