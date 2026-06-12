import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { TopCommandBar } from "./TopCommandBar";

export function CommandCenterLayout({
  children,
  dataSource = "mock"
}: {
  children: ReactNode;
  dataSource?: "api" | "mock";
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopCommandBar dataSource={dataSource} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
