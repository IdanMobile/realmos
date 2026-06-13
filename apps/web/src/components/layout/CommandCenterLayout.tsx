"use client";

import type { ReactNode } from "react";
import type { HealthReport } from "@/lib/api/fetchHealth";
import type { CommandCenterSectionId } from "@/lib/navigation/sections";
import { JarvisChatPanel } from "@/components/panels/JarvisChatPanel";
import { SidebarNav } from "./SidebarNav";
import { TopCommandBar } from "./TopCommandBar";

export function CommandCenterLayout({
  children,
  dataSource = "mock",
  activeSection,
  onSectionChange,
  health = null,
  jarvisOpen = false,
  onJarvisOpenChange
}: {
  children: ReactNode;
  dataSource?: "api" | "mock";
  activeSection: CommandCenterSectionId;
  onSectionChange: (sectionId: CommandCenterSectionId) => void;
  health?: HealthReport | null;
  jarvisOpen?: boolean;
  onJarvisOpenChange?: (open: boolean) => void;
}) {
  return (
    <div className="flex min-h-screen bg-background" data-testid="command-center-layout">
      <SidebarNav activeSection={activeSection} onSectionChange={onSectionChange} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopCommandBar
          dataSource={dataSource}
          activeSection={activeSection}
          onAskJarvis={() => onJarvisOpenChange?.(true)}
        />
        <main className="flex-1 overflow-auto p-6" data-testid="command-center-main">
          {children}
        </main>
      </div>
      {jarvisOpen ? (
        <JarvisChatPanel
          health={health}
          dataSource={dataSource}
          onClose={() => onJarvisOpenChange?.(false)}
        />
      ) : null}
    </div>
  );
}
