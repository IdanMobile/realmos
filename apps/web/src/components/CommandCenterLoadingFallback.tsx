"use client";

import { CommandCenterLayout } from "@/components/layout/CommandCenterLayout";

export function CommandCenterLoadingFallback() {
  return (
    <CommandCenterLayout activeSection="overview" onSectionChange={() => undefined}>
      <div className="card max-w-xl" role="status">
        <h3 className="panel-title">Loading</h3>
        <p>Loading Command Center state…</p>
      </div>
    </CommandCenterLayout>
  );
}
