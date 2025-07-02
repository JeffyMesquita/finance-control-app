import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GoalData, BaseActionResult } from "@/lib/types/actions";

interface GoalsQueryOptions {
  onSuccess?: (data: GoalData[]) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const GOALS_QUERY_KEY = "GOALS_QUERY_KEY";

export function useGoalsQuery(options: GoalsQueryOptions = {}) {
  const query = useQuery<GoalData[], Error>({
    queryKey: [GOALS_QUERY_KEY],
    enabled: options.enabled !== false,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    queryFn: async (): Promise<GoalData[]> => {
      const response = await fetch("/api/goals");

      if (!response.ok) {
        throw new Error("Failed to fetch goals data");
      }

      const result: BaseActionResult<GoalData[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch goals data");
      }

      return result.data;
    },
  });

  // Memoizar as funções de callback para evitar loops infinitos
  const memoizedOnSuccess = useCallback(
    (data: GoalData[]) => {
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
