import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { ExportButton } from "@/components/export-button";
import { ReportsOverview } from "@/components/reports-overview";
import { reportsOverviewQueryOptions } from "@/lib/api/query-options";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import { ServerApiError, serverQueryApi } from "@/lib/api/server";

export default async function ReportsPage() {
  const queryClient = new QueryClient();
  if (isNestDomainEnabled("reports")) {
    try {
      await queryClient.prefetchQuery(reportsOverviewQueryOptions(serverQueryApi));
    } catch (error) {
      if (!(error instanceof ServerApiError && error.status === 401)) throw error;
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Relatorios Financeiros</h1>
          <ExportButton />
        </div>
        <ReportsOverview />
      </div>
    </HydrationBoundary>
  );
}
