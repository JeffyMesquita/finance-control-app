import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import {
  type DashboardOverviewData,
  dashboardDataQueryOptions,
  dashboardOverviewQueryOptions,
} from "@/lib/api/query-options";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { DashboardData } from "@/lib/types/actions";

interface DashboardDataQueryOptions {
  onSuccess?: (data: DashboardData) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const DASHBOARD_DATA_QUERY_KEY = "DASHBOARD_DATA_QUERY_KEY";

export function useDashboardDataQuery(options: DashboardDataQueryOptions = {}) {
  const enabled = options.enabled !== false;
  const overviewOptions = dashboardOverviewQueryOptions();
  const cardsOptions = dashboardDataQueryOptions();

  const nestQuery = useQuery<DashboardOverviewData, Error, DashboardData>({
    ...(overviewOptions as unknown as UseQueryOptions<DashboardOverviewData, Error, DashboardData>),
    select: (data) => data.cards,
    enabled: enabled && isNestDomainEnabled("dashboard"),
  });
  const legacyQuery = useQuery<DashboardData>({
    ...(cardsOptions as unknown as UseQueryOptions<DashboardData>),
    enabled: enabled && !isNestDomainEnabled("dashboard"),
  });
  const query = isNestDomainEnabled("dashboard") ? nestQuery : legacyQuery;

  const onSuccess = useCallback(
    (data: DashboardData) => options.onSuccess?.(data),
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
