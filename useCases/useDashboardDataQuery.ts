import type { BaseActionResult, DashboardData } from "@/lib/types/actions";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

interface DashboardDataQueryOptions {
  onSuccess?: (data: DashboardData) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const DASHBOARD_DATA_QUERY_KEY = "DASHBOARD_DATA_QUERY_KEY";

export function useDashboardDataQuery(options: DashboardDataQueryOptions = {}) {
  const query = useQuery<DashboardData, Error>({
    queryKey: [DASHBOARD_DATA_QUERY_KEY],
    enabled: options.enabled !== false,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    queryFn: async (): Promise<DashboardData> => {
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const result: BaseActionResult<DashboardData> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }

      return result.data;
    },
  });

  // Memoizar as funções de callback para evitar loops infinitos
  const memoizedOnSuccess = useCallback(
    (data: DashboardData) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    [options.onSuccess] // Só recria quando a função muda
  );

  const memoizedOnError = useCallback(
    (error: Error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    [options.onError] // Só recria quando a função muda
  );

  // Handle success callback using useEffect
  useEffect(() => {
    if (query.isSuccess && query.data) {
      memoizedOnSuccess(query.data);
    }
  }, [query.isSuccess, query.data, memoizedOnSuccess]);

  // Handle error callback using useEffect
  useEffect(() => {
    if (query.isError && query.error) {
      memoizedOnError(query.error);
    }
  }, [query.isError, query.error, memoizedOnError]);

  return query;
}
