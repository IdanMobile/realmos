"use client";

import type { ReactNode } from "react";
import type { ApprovalRequest } from "@realmos/contracts";
import type { HealthReport } from "@/lib/api/fetchHealth";
import type { DashboardMockData } from "@/lib/mock/loadMockDashboard";
import type { CommandCenterSectionId } from "@/lib/navigation/sections";
import { getCommandCenterSection } from "@/lib/navigation/sections";
import { GovernanceSafetyBanner } from "@/components/layout/GovernanceSafetyBanner";
import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";
import { ActiveAgentsPanel } from "@/components/panels/ActiveAgentsPanel";
import { ApprovalQueuePanel } from "@/components/panels/ApprovalQueuePanel";
import { CapabilityScoutPanel } from "@/components/panels/CapabilityScoutPanel";
import { CommunicationThreadDetailPanel } from "@/components/panels/CommunicationThreadDetailPanel";
import { CommunicationThreadsPanel } from "@/components/panels/CommunicationThreadsPanel";
import { CostBudgetPanel } from "@/components/panels/CostBudgetPanel";
import { EcosystemBusinessesPanel } from "@/components/panels/EcosystemBusinessesPanel";
import { FleetControlPanel } from "@/components/panels/FleetControlPanel";
import { IntelligenceOptimizerPanel, KnowledgeVaultPanel, ModelScoutPanel } from "@/components/panels/IntelligencePanels";
import { JarvisBriefingPanel } from "@/components/panels/JarvisBriefingPanel";
import { MemoryPanel } from "@/components/panels/MemorySummariesPanel";
import { NecromancerOperatorPanel } from "@/components/panels/NecromancerOperatorPanel";
import { OperatorGuidePanel } from "@/components/panels/OperatorGuidePanel";
import { ProjectInfrastructurePanel } from "@/components/panels/ProjectInfrastructurePanel";
import { RecentActivityPanel } from "@/components/panels/RecentActivityPanel";
import { RepositoryBoundaryPanel } from "@/components/panels/RepositoryBoundaryPanel";
import { RunStateHandoffPanel } from "@/components/panels/RunStateHandoffPanel";
import { SelfBuildConsolePanel } from "@/components/panels/SelfBuildConsolePanel";
import { SpecKitArtifactsPanel } from "@/components/panels/SpecKitArtifactsPanel";
import { SystemStatusPanel } from "@/components/panels/SystemStatusPanel";
import { TaskStatusPanel } from "@/components/panels/TaskStatusPanel";
import { ToolActivityPanel } from "@/components/panels/ToolActivityPanel";
import { VerificationEvidencePanel } from "@/components/panels/VerificationEvidencePanel";
import { WorkPacketTaskMonitorPanel } from "@/components/panels/WorkPacketTaskMonitorPanel";
import { WorldPreviewPanel } from "@/components/panels/WorldPreviewPanel";

type SectionContentProps = {
  sectionId: CommandCenterSectionId;
  data: DashboardMockData;
  health: HealthReport | null;
  dataSource: "api" | "mock";
  monthlyBudget: NonNullable<DashboardMockData["budgets"][number]>;
  approvals: ApprovalRequest[];
  memories: DashboardMockData["memories"];
  selectedThreadId: string | null;
  selectedLifecyclePacketId: string | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onEditMemory: (id: string, patch: Partial<DashboardMockData["memories"][number]>) => void;
  onDeleteMemory: (id: string) => void;
  onSelectThread: (id: string) => void;
  onSelectedPacketChange: (id: string | null) => void;
};

function SectionGrid({ sectionId, children }: { sectionId: CommandCenterSectionId; children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-testid={`command-center-section-${sectionId}`}>
      {children}
    </div>
  );
}

export function CommandCenterSectionContent(props: SectionContentProps) {
  const section = getCommandCenterSection(props.sectionId);

  if (!section.implemented) {
    return (
      <SectionGrid sectionId={props.sectionId}>
        <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
        <SectionPlaceholder section={section} />
      </SectionGrid>
    );
  }

  switch (props.sectionId) {
    case "overview":
      return (
        <SectionGrid sectionId="overview">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <SystemStatusPanel health={props.health} dataSource={props.dataSource} />
          <WorkPacketTaskMonitorPanel
            health={props.health}
            dataSource={props.dataSource}
            onSelectedPacketChange={props.onSelectedPacketChange}
          />
          <RunStateHandoffPanel
            dataSource={props.dataSource}
            selectedPacketId={props.selectedLifecyclePacketId}
          />
          <OperatorGuidePanel />
          <JarvisBriefingPanel
            greeting={props.data.briefing.greeting}
            briefingItems={props.data.briefing.items}
            quickActions={props.data.briefing.quickActions}
          />
          <ApprovalQueuePanel
            approvals={props.approvals}
            onApprove={props.onApprove}
            onReject={props.onReject}
          />
          <CostBudgetPanel monthlyBudget={props.monthlyBudget} costs={props.data.costEntries} />
          <WorldPreviewPanel worldMap={props.data.worldMap} />
          <IntelligenceOptimizerPanel report={props.data.optimizationReport} />
          <ModelScoutPanel decision={props.data.modelRoutingDecision} />
        </SectionGrid>
      );
    case "realms":
      return (
        <SectionGrid sectionId="realms">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <RepositoryBoundaryPanel {...props.data.realm} />
          <EcosystemBusinessesPanel businesses={props.data.businesses} />
          <ProjectInfrastructurePanel {...props.data.platformInfra} />
          <SelfBuildConsolePanel {...props.data.workLoop} />
        </SectionGrid>
      );
    case "tasks":
      return (
        <SectionGrid sectionId="tasks">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <TaskStatusPanel tasks={props.data.tasks} />
          <WorkPacketTaskMonitorPanel
            health={props.health}
            dataSource={props.dataSource}
            onSelectedPacketChange={props.onSelectedPacketChange}
          />
        </SectionGrid>
      );
    case "runs":
      return (
        <SectionGrid sectionId="runs">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <WorkPacketTaskMonitorPanel
            health={props.health}
            dataSource={props.dataSource}
            onSelectedPacketChange={props.onSelectedPacketChange}
          />
          <VerificationEvidencePanel
            dataSource={props.dataSource}
            workPacketId={props.selectedLifecyclePacketId}
          />
          <RunStateHandoffPanel
            dataSource={props.dataSource}
            selectedPacketId={props.selectedLifecyclePacketId}
          />
          <ToolActivityPanel
            requests={props.data.toolRunRequests}
            results={props.data.toolRunResults}
            pendingApprovals={props.approvals.filter((approval) => approval.status === "pending")}
            terminalEnabled={props.health?.checks.terminal.enabled}
          />
        </SectionGrid>
      );
    case "agents":
      return (
        <SectionGrid sectionId="agents">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <NecromancerOperatorPanel dataSource={props.dataSource} />
          <ActiveAgentsPanel agents={props.data.agents} />
          <FleetControlPanel {...props.data.fleet} />
          <CapabilityScoutPanel reports={props.data.capabilityReports} />
        </SectionGrid>
      );
    case "communications":
      return (
        <SectionGrid sectionId="communications">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <CommunicationThreadsPanel
            threads={props.data.communicationThreads}
            messages={props.data.communicationMessages}
            selectedThreadId={props.selectedThreadId}
            onSelectThread={props.onSelectThread}
          />
          <CommunicationThreadDetailPanel
            thread={
              props.data.communicationThreads.find((thread) => thread.id === props.selectedThreadId) ?? null
            }
            messages={props.data.communicationMessages}
            decisions={props.data.communicationDecisions}
          />
        </SectionGrid>
      );
    case "memory":
      return (
        <SectionGrid sectionId="memory">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <MemoryPanel
            memories={props.memories}
            onEdit={props.onEditMemory}
            onDelete={props.onDeleteMemory}
          />
          <KnowledgeVaultPanel provider="database_only" notes={props.data.knowledgeVaultNotes} />
        </SectionGrid>
      );
    case "artifacts":
      return (
        <SectionGrid sectionId="artifacts">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <SpecKitArtifactsPanel artifacts={props.data.artifacts} />
        </SectionGrid>
      );
    case "audit":
      return (
        <SectionGrid sectionId="audit">
          <GovernanceSafetyBanner health={props.health} dataSource={props.dataSource} />
          <RecentActivityPanel events={props.data.auditEvents} />
        </SectionGrid>
      );
    default:
      return (
        <SectionGrid sectionId={props.sectionId}>
          <SectionPlaceholder section={section} />
        </SectionGrid>
      );
  }
}
