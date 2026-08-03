import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { dashboardDataQueryOptions } from "@/lib/api/query-options";
import type { DashboardData } from "@/lib/types/actions";

interface DashboardDataQueryOptions {
  onSuccess?: (data: DashboardData) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const DASHBOARD_DATA_QUERY_KEY = "DASHBOARD_DATA_QUERY_KEY";

export function useDashboardDataQuery(options: DashboardDataQueryOptions = {}) {
  const query = useQuery({
    ...dashboardDataQueryOptions(),
    enabled: options.enabled !== false,
  });

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
