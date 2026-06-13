import { Suspense } from "react";
import { CommandCenterDashboard } from "@/components/CommandCenterDashboard";
import { CommandCenterLoadingFallback } from "@/components/CommandCenterLoadingFallback";
import { fetchDashboardFromApi } from "@/lib/api/fetchDashboard";
import { fetchHealthFromApi } from "@/lib/api/fetchHealth";
import { loadMockDashboard } from "@/lib/mock/loadMockDashboard";

export default async function HomePage() {
  const [apiData, health] = await Promise.all([fetchDashboardFromApi(), fetchHealthFromApi()]);
  const data = apiData ?? loadMockDashboard();
  const dataSource = apiData ? "api" : "mock";

  return (
    <Suspense fallback={<CommandCenterLoadingFallback />}>
      <CommandCenterDashboard data={data} viewState="ready" health={health} dataSource={dataSource} />
    </Suspense>
  );
}
