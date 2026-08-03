import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import { invalidateFinancialQueries } from "@/useCases/invalidate-financial-queries";

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id?: string; ids?: string[] }) => {
      if (isNestDomainEnabled("transactions") && data.id && !data.ids?.length) {
        await apiRequest<void>("/transactions/delete", {
          method: "DELETE",
          body: { id: data.id },
        });
        return { success: true as const };
      }

      const response = await fetch("/api/transactions/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao deletar transação(ões)");
      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      invalidateFinancialQueries(queryClient);
    },
  });
}
