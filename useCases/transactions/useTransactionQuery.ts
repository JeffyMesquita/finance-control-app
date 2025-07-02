import { useQuery } from "@tanstack/react-query";

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
    queryKey: [
      "transactions",
      params.page,
      params.pageSize,
      params.month,
      params.type,
      params.category,
      params.search,
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.pageSize)
        searchParams.set("pageSize", params.pageSize.toString());
      if (params.month) searchParams.set("month", params.month);
      if (params.type) searchParams.set("type", params.type);
      if (params.category) searchParams.set("category", params.category);
      if (params.search) searchParams.set("search", params.search);
      const res = await fetch(
        `/api/transactions/list?${searchParams.toString()}`
      );
      if (!res.ok) throw new Error("Erro ao buscar transações");
      return res.json();
    },
  });
}
