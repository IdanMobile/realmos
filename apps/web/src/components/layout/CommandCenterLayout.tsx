"use client";

import type { ReactNode } from "react";
import type { CommandCenterSectionId } from "@/lib/navigation/sections";
import { SidebarNav } from "./SidebarNav";
import { TopCommandBar } from "./TopCommandBar";

export function CommandCenterLayout({
  children,
  dataSource = "mock",
  activeSection,
  onSectionChange
}: {
  children: ReactNode;
  dataSource?: "api" | "mock";
  activeSection: CommandCenterSectionId;
  onSectionChange: (sectionId: CommandCenterSectionId) => void;
}) {
  return (
    <div className="flex min-h-screen bg-background" data-testid="command-center-layout">
      <SidebarNav activeSection={activeSection} onSectionChange={onSectionChange} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopCommandBar dataSource={dataSource} activeSection={activeSection} />
        <main className="flex-1 overflow-auto p-6" data-testid="command-center-main">
          {children}
        </main>
      </div>
    </div>
  );
}
