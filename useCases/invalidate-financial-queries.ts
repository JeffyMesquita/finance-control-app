import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

export function invalidateFinancialQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.monthly });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.dashboard.expenseBreakdown("current"),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.dashboard.expenseBreakdown("previous"),
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.reports.overview });
}
