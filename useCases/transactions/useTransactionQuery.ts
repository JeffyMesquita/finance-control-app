import { useQuery } from "@tanstack/react-query";

import { apiPaginatedRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { TransactionData } from "@/lib/types/actions";

export interface TransactionQueryParams {
  page?: number;
  pageSize?: number;
  month?: string;
  type?: string;
  category?: string;
  search?: string;
}

export function useTransactionQuery(params: TransactionQueryParams) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.pageSize) {
        searchParams.set("pageSize", params.pageSize.toString());
      }
      if (params.month) searchParams.set("month", params.month);
      if (params.type) searchParams.set("type", params.type);
      if (params.category) searchParams.set("category", params.category);
      if (params.search) searchParams.set("search", params.search);

      if (isNestDomainEnabled("transactions")) {
        return apiPaginatedRequest<TransactionData>(
          `/transactions/list?${searchParams.toString()}`
        );
      }

      const response = await fetch(`/api/transactions/list?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar transações");
      }

      return response.json() as Promise<{
        success: boolean;
        data: TransactionData[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>;
    },
  });
}
