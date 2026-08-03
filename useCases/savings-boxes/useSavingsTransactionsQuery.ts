import { useQuery } from "@tanstack/react-query";
import {
  getSavingsTransactions,
  getSavingsTransactionsByUser,
} from "@/app/actions/savings-transactions";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { SavingsTransactionData } from "@/lib/types/actions";

export function useSavingsTransactionsQuery(boxId?: string, limit = 100) {
  return useQuery({
    queryKey: queryKeys.savingsTransactions.list(boxId, limit),
    queryFn: async (): Promise<SavingsTransactionData[]> => {
      if (isNestDomainEnabled("savings-boxes")) {
        const query = new URLSearchParams({ limit: String(limit) });
        if (boxId) query.set("boxId", boxId);
        return apiRequest<SavingsTransactionData[]>(`/savings-transactions?${query.toString()}`);
      }
      const result = boxId
        ? await getSavingsTransactions(boxId, limit)
        : await getSavingsTransactionsByUser(limit);
      if (!result.success) {
        throw new Error(result.error ?? "Falha ao carregar movimentações");
      }
      return result.data ?? [];
    },
    staleTime: 60 * 1000,
  });
}
