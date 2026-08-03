import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { TransactionData, UpdateTransactionData } from "@/lib/types/actions";
import { invalidateFinancialQueries } from "@/useCases/invalidate-financial-queries";

interface UseUpdateTransactionMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateTransactionMutation(options?: UseUpdateTransactionMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string } & UpdateTransactionData) => {
      if (isNestDomainEnabled("transactions")) {
        const result = await apiRequest<TransactionData>("/transactions/update", {
          method: "PUT",
          body: data,
        });
        return { success: true as const, data: result };
      }

      const response = await fetch("/api/transactions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar transação");
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      invalidateFinancialQueries(queryClient);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
