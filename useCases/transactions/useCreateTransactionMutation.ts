import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { CreateTransactionData, TransactionData } from "@/lib/types/actions";

interface UseCreateTransactionMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateTransactionMutation(options?: UseCreateTransactionMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (isNestDomainEnabled("transactions")) {
        const result = await apiRequest<TransactionData>("/transactions/create", {
          method: "POST",
          body: data,
        });
        return { success: true as const, data: result };
      }

      const response = await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar transação");
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
