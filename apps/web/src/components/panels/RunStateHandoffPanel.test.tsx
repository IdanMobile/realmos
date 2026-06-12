import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunStateHandoffPanel } from "@/components/panels/RunStateHandoffPanel";

describe("RunStateHandoffPanel", () => {
  it("shows mock mode message when API unavailable", () => {
    render(<RunStateHandoffPanel dataSource="mock" />);
    expect(screen.getByText(/Live API required/i)).toBeInTheDocument();
    expect(screen.getByText(/no arbitrary file writes/i)).toBeInTheDocument();
  });
});
