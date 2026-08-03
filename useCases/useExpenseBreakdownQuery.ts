import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { expenseBreakdownQueryOptions } from "@/lib/api/query-options";
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
  const query = useQuery({
    ...expenseBreakdownQueryOptions(month),
    enabled: options.enabled !== false,
  });

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
