import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";

export type SavingsTransactionStats = {
  total_transactions: number;
  total_deposits: number;
  total_withdraws: number;
  total_transfers: number;
  total_deposited: number;
  total_withdrawn: number;
  total_transferred: number;
};

export function useSavingsTransactionsStatsQuery(boxId?: string) {
  return useQuery({
    queryKey: queryKeys.savingsTransactions.stats(boxId),
    queryFn: async () => {
      if (isNestDomainEnabled("savings-boxes"))
        return apiRequest<SavingsTransactionStats>(
          `/savings-transactions/stats${boxId ? `?boxId=${encodeURIComponent(boxId)}` : ""}`
        );
      return {
        total_transactions: 0,
        total_deposits: 0,
        total_withdraws: 0,
        total_transfers: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        total_transferred: 0,
      };
    },
  });
}
