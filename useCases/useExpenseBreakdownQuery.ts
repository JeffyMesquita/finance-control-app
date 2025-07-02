import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ExpenseBreakdownItem,
  BaseActionResult,
} from "@/lib/types/actions";

interface ExpenseBreakdownQueryOptions {
  month?: "current" | "previous";
  onSuccess?: (data: ExpenseBreakdownItem[]) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export const EXPENSE_BREAKDOWN_QUERY_KEY = "EXPENSE_BREAKDOWN_QUERY_KEY";

export function useExpenseBreakdownQuery(
  options: ExpenseBreakdownQueryOptions = {}
) {
  const { month = "current" } = options;

  const query = useQuery<ExpenseBreakdownItem[], Error>({
    queryKey: [EXPENSE_BREAKDOWN_QUERY_KEY, month],
    enabled: options.enabled !== false,
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    queryFn: async (): Promise<ExpenseBreakdownItem[]> => {
      const searchParams = new URLSearchParams({ month });
      const response = await fetch(`/api/expense-breakdown?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch expense breakdown data");
      }

      const result: BaseActionResult<ExpenseBreakdownItem[]> =
        await response.json();

      if (!result.success || !result.data) {
        throw new Error(
          result.error || "Failed to fetch expense breakdown data"
        );
      }

      return result.data;
    },
  });

  // Memoizar as funções de callback para evitar loops infinitos
  const memoizedOnSuccess = useCallback(
    (data: ExpenseBreakdownItem[]) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    [options.onSuccess, month] // Inclui month para recriar quando mudar
  );

  const memoizedOnError = useCallback(
    (error: Error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    [options.onError, month] // Inclui month para recriar quando mudar
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
