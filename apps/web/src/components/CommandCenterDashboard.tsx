"use client";

import { CommandCenterLayout } from "@/components/layout/CommandCenterLayout";
import { CommandCenterReadyView } from "@/components/CommandCenterReadyView";
import type { HealthReport } from "@/lib/api/fetchHealth";
import type { DashboardMockData } from "@/lib/mock/loadMockDashboard";
import { type DashboardViewState, getDashboardViewMessage } from "@/lib/mock/viewState";

type CommandCenterDashboardProps = {
  data: DashboardMockData;
  viewState?: DashboardViewState;
  health?: HealthReport | null;
  dataSource?: "api" | "mock";
};

export function CommandCenterDashboard({
  data,
  viewState = "ready",
  health = null,
  dataSource = "mock"
}: CommandCenterDashboardProps) {
  if (viewState !== "ready") {
    return (
      <CommandCenterLayout activeSection="overview" onSectionChange={() => undefined}>
        <div className="card max-w-xl" role="status">
          <h3 className="panel-title">{viewState === "loading" ? "Loading" : viewState === "error" ? "Error" : "Empty"}</h3>
          <p>{getDashboardViewMessage(viewState)}</p>
        </div>
      </CommandCenterLayout>
    );
  }

  return <CommandCenterReadyView data={data} health={health} dataSource={dataSource} />;
}
