import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import {
  type DashboardOverviewData,
  dashboardOverviewQueryOptions,
  expenseBreakdownQueryOptions,
} from "@/lib/api/query-options";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { ExpenseBreakdownItem } from "@/lib/types/actions";

interface ExpenseBreakdownQueryOptions {
  month?: "current" | "previous";
  onSuccess?: (data: ExpenseBreakdownItem[]) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const EXPENSE_BREAKDOWN_QUERY_KEY = "EXPENSE_BREAKDOWN_QUERY_KEY";

export function useExpenseBreakdownQuery(options: ExpenseBreakdownQueryOptions = {}) {
  const month = options.month ?? "current";
  const enabled = options.enabled !== false;
  const overviewOptions = dashboardOverviewQueryOptions();
  const breakdownOptions = expenseBreakdownQueryOptions(month);

  const nestQuery = useQuery<DashboardOverviewData, Error, ExpenseBreakdownItem[]>({
    ...(overviewOptions as unknown as UseQueryOptions<
      DashboardOverviewData,
      Error,
      ExpenseBreakdownItem[]
    >),
    select: (data) => data.expenseBreakdown,
    enabled: enabled && isNestDomainEnabled("dashboard") && month === "current",
  });
  const legacyQuery = useQuery<ExpenseBreakdownItem[]>({
    ...(breakdownOptions as unknown as UseQueryOptions<ExpenseBreakdownItem[]>),
    enabled: enabled && (!isNestDomainEnabled("dashboard") || month === "previous"),
  });
  const query = isNestDomainEnabled("dashboard") && month === "current" ? nestQuery : legacyQuery;

  const onSuccess = useCallback(
    (data: ExpenseBreakdownItem[]) => options.onSuccess?.(data),
    [options.onSuccess]
  );
  const onError = useCallback((error: Error) => options.onError?.(error), [options.onError]);

  useEffect(() => {
    if (query.isSuccess && query.data) onSuccess(query.data);
  }, [query.isSuccess, query.data, onSuccess]);
  useEffect(() => {
    if (query.isError && query.error) onError(query.error);
  }, [query.isError, query.error, onError]);

  return query;
}
