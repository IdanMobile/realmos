"use client";

import { useMemo, useState } from "react";
import type { ApprovalRequest } from "@realmos/contracts";
import { CommandCenterLayout } from "@/components/layout/CommandCenterLayout";
import { ActiveAgentsPanel } from "@/components/panels/ActiveAgentsPanel";
import { ApprovalQueuePanel } from "@/components/panels/ApprovalQueuePanel";
import { CapabilityScoutPanel } from "@/components/panels/CapabilityScoutPanel";
import { CommunicationThreadDetailPanel } from "@/components/panels/CommunicationThreadDetailPanel";
import { CommunicationThreadsPanel } from "@/components/panels/CommunicationThreadsPanel";
import { CostBudgetPanel } from "@/components/panels/CostBudgetPanel";
import { EcosystemBusinessesPanel } from "@/components/panels/EcosystemBusinessesPanel";
import { IntelligenceOptimizerPanel, KnowledgeVaultPanel, ModelScoutPanel } from "@/components/panels/IntelligencePanels";
import { JarvisBriefingPanel } from "@/components/panels/JarvisBriefingPanel";
import { MemoryPanel } from "@/components/panels/MemorySummariesPanel";
import { RecentActivityPanel } from "@/components/panels/RecentActivityPanel";
import { SpecKitArtifactsPanel } from "@/components/panels/SpecKitArtifactsPanel";
import { TaskStatusPanel } from "@/components/panels/TaskStatusPanel";
import { ToolActivityPanel } from "@/components/panels/ToolActivityPanel";
import { WorldPreviewPanel } from "@/components/panels/WorldPreviewPanel";
import { approveRequestViaApi, rejectRequestViaApi } from "@/lib/api/approvals";
import type { HealthReport } from "@/lib/api/fetchHealth";
import type { DashboardMockData } from "@/lib/mock/loadMockDashboard";
import { type DashboardViewState, getDashboardViewMessage } from "@/lib/mock/viewState";
import { FleetControlPanel } from "@/components/panels/FleetControlPanel";
import { OperatorGuidePanel } from "@/components/panels/OperatorGuidePanel";
import { ProjectInfrastructurePanel } from "@/components/panels/ProjectInfrastructurePanel";
import { RepositoryBoundaryPanel } from "@/components/panels/RepositoryBoundaryPanel";
import { SelfBuildConsolePanel } from "@/components/panels/SelfBuildConsolePanel";
import { SystemStatusPanel } from "@/components/panels/SystemStatusPanel";

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
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(data.approvals);
  const [memories, setMemories] = useState(data.memories);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    data.communicationThreads[0]?.id ?? null
  );

  const monthlyBudget = useMemo(
    () => data.budgets.find((budget) => budget.scope === "global") ?? data.budgets[0],
    [data.budgets]
  );

  if (viewState !== "ready") {
    return (
      <CommandCenterLayout dataSource={dataSource}>
        <div className="card max-w-xl" role="status">
          <h3 className="panel-title">{viewState === "loading" ? "Loading" : viewState === "error" ? "Error" : "Empty"}</h3>
          <p>{getDashboardViewMessage(viewState)}</p>
        </div>
      </CommandCenterLayout>
    );
  }

  if (!monthlyBudget) {
    return (
      <CommandCenterLayout dataSource={dataSource}>
        <div className="card max-w-xl" role="alert">
          <p>{getDashboardViewMessage("error")}</p>
        </div>
      </CommandCenterLayout>
    );
  }

  return (
    <CommandCenterLayout dataSource={dataSource}>
      <div className="grid gap-4 lg:grid-cols-2" data-testid="command-center-dashboard">
        <SystemStatusPanel health={health} dataSource={dataSource} />
        <OperatorGuidePanel />
        <SelfBuildConsolePanel {...data.workLoop} />
        <FleetControlPanel {...data.fleet} />
        <RepositoryBoundaryPanel {...data.realm} />
        <ProjectInfrastructurePanel {...data.platformInfra} />
        <JarvisBriefingPanel
          greeting={data.briefing.greeting}
          briefingItems={data.briefing.items}
          quickActions={data.briefing.quickActions}
        />
        <EcosystemBusinessesPanel businesses={data.businesses} />
        <ActiveAgentsPanel agents={data.agents} />
        <TaskStatusPanel tasks={data.tasks} />
        <SpecKitArtifactsPanel artifacts={data.artifacts} />
        <ApprovalQueuePanel
          approvals={approvals}
          onApprove={async (id) => {
            const apiResult = await approveRequestViaApi(id);
            setApprovals((current) =>
              current.map((approval) =>
                approval.id === id
                  ? { ...approval, status: apiResult?.approval?.status ?? "approved" }
                  : approval
              )
            );
          }}
          onReject={async (id) => {
            const apiResult = await rejectRequestViaApi(id);
            setApprovals((current) =>
              current.map((approval) =>
                approval.id === id
                  ? { ...approval, status: apiResult?.status ?? "rejected" }
                  : approval
              )
            );
          }}
        />
        <CostBudgetPanel monthlyBudget={monthlyBudget} costs={data.costEntries} />
        <MemoryPanel
          memories={memories}
          onEdit={(id, patch) =>
            setMemories((current) =>
              current.map((memory) =>
                memory.id === id
                  ? { ...memory, ...patch, updatedAt: new Date().toISOString() }
                  : memory
              )
            )
          }
          onDelete={(id) => setMemories((current) => current.filter((memory) => memory.id !== id))}
        />
        <CapabilityScoutPanel reports={data.capabilityReports} />
        <CommunicationThreadsPanel
          threads={data.communicationThreads}
          messages={data.communicationMessages}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />
        <CommunicationThreadDetailPanel
          thread={data.communicationThreads.find((thread) => thread.id === selectedThreadId) ?? null}
          messages={data.communicationMessages}
          decisions={data.communicationDecisions}
        />
        <RecentActivityPanel events={data.auditEvents} />
        <WorldPreviewPanel worldMap={data.worldMap} />
        <IntelligenceOptimizerPanel report={data.optimizationReport} />
        <ModelScoutPanel decision={data.modelRoutingDecision} />
        <KnowledgeVaultPanel provider="database_only" notes={data.knowledgeVaultNotes} />
        <ToolActivityPanel
          requests={data.toolRunRequests}
          results={data.toolRunResults}
          pendingApprovals={approvals.filter((approval) => approval.status === "pending")}
          terminalEnabled={health?.checks.terminal.enabled}
        />
      </div>
    </CommandCenterLayout>
  );
}
