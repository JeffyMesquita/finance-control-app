import { useQuery } from "@tanstack/react-query";

import { type TransactionQueryParams, transactionListQueryOptions } from "@/lib/api/query-options";

export type { TransactionQueryParams };

export function useTransactionQuery(params: TransactionQueryParams) {
  return useQuery(transactionListQueryOptions(params));
}
