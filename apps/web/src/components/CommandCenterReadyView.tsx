"use client";

import { useMemo, useState } from "react";
import type { ApprovalRequest } from "@realmos/contracts";
import { CommandCenterLayout } from "@/components/layout/CommandCenterLayout";
import { CommandCenterSectionContent } from "@/components/CommandCenterSectionContent";
import { approveRequestViaApi, rejectRequestViaApi } from "@/lib/api/approvals";
import type { HealthReport } from "@/lib/api/fetchHealth";
import type { DashboardMockData } from "@/lib/mock/loadMockDashboard";
import { useCommandCenterSection } from "@/lib/navigation/useCommandCenterSection";

type CommandCenterReadyViewProps = {
  data: DashboardMockData;
  health: HealthReport | null;
  dataSource: "api" | "mock";
};

export function CommandCenterReadyView({ data, health, dataSource }: CommandCenterReadyViewProps) {
  const { activeSection, setActiveSection } = useCommandCenterSection();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(data.approvals);
  const [memories, setMemories] = useState(data.memories);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    data.communicationThreads[0]?.id ?? null
  );
  const [selectedLifecyclePacketId, setSelectedLifecyclePacketId] = useState<string | null>(null);
  const [jarvisOpen, setJarvisOpen] = useState(false);

  const monthlyBudget = useMemo(
    () => data.budgets.find((budget) => budget.scope === "global") ?? data.budgets[0],
    [data.budgets]
  );

  if (!monthlyBudget) {
    return (
      <CommandCenterLayout
        dataSource={dataSource}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        health={health}
        jarvisOpen={jarvisOpen}
        onJarvisOpenChange={setJarvisOpen}
      >
        <div className="card max-w-xl" role="alert">
          <p>Unable to load dashboard budget data.</p>
        </div>
      </CommandCenterLayout>
    );
  }

  return (
    <CommandCenterLayout
      dataSource={dataSource}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      health={health}
      jarvisOpen={jarvisOpen}
      onJarvisOpenChange={setJarvisOpen}
    >
      <div data-testid="command-center-dashboard">
        <CommandCenterSectionContent
          sectionId={activeSection}
          data={data}
          health={health}
          dataSource={dataSource}
          monthlyBudget={monthlyBudget}
          approvals={approvals}
          memories={memories}
          selectedThreadId={selectedThreadId}
          selectedLifecyclePacketId={selectedLifecyclePacketId}
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
          onEditMemory={(id, patch) =>
            setMemories((current) =>
              current.map((memory) =>
                memory.id === id
                  ? { ...memory, ...patch, updatedAt: new Date().toISOString() }
                  : memory
              )
            )
          }
          onDeleteMemory={(id) => setMemories((current) => current.filter((memory) => memory.id !== id))}
          onSelectThread={setSelectedThreadId}
          onSelectedPacketChange={setSelectedLifecyclePacketId}
        />
      </div>
    </CommandCenterLayout>
  );
}
