import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import DashboardClient from "@/app/dashboard/dashboard-client";
import {
  dashboardDataQueryOptions,
  expenseBreakdownQueryOptions,
  transactionListQueryOptions,
} from "@/lib/api/query-options";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import { ServerApiError, serverQueryApi } from "@/lib/api/server";

async function prefetch(queryClient: QueryClient) {
  const queries = [];
  if (isNestDomainEnabled("dashboard")) {
    queries.push(queryClient.prefetchQuery(dashboardDataQueryOptions(serverQueryApi)));
    queries.push(
      queryClient.prefetchQuery(expenseBreakdownQueryOptions("current", serverQueryApi))
    );
  }
  if (isNestDomainEnabled("transactions")) {
    queries.push(
      queryClient.prefetchQuery(
        transactionListQueryOptions(
          { page: 1, pageSize: 10, month: "all", type: "all", category: "all", search: "" },
          serverQueryApi
        )
      )
    );
  }

  const results = await Promise.allSettled(queries);
  for (const result of results) {
    if (
      result.status === "rejected" &&
      !(result.reason instanceof ServerApiError && result.reason.status === 401)
    ) {
      throw result.reason;
    }
  }
}

export default async function DashboardPage() {
  const queryClient = new QueryClient();
  await prefetch(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
