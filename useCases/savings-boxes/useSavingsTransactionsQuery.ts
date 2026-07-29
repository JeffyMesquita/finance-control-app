import { useQuery } from "@tanstack/react-query";
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
      const response = await fetch(
        `/api/savings-transactions${boxId ? `?boxId=${encodeURIComponent(boxId)}&limit=${limit}` : `?limit=${limit}`}`
      );
      const payload = (await response.json()) as {
        success: boolean;
        data?: SavingsTransactionData[];
        error?: string;
      };
      if (!payload.success) throw new Error(payload.error || "Falha ao carregar movimenta??es");
      return payload.data || [];
    },
    staleTime: 60 * 1000,
  });
}
