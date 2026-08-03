import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { CategoryData } from "@/lib/types/actions";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      if (isNestDomainEnabled("categories")) {
        const data = await apiRequest<CategoryData[]>("/categories/list");
        return { success: true, data };
      }

      const response = await fetch("/api/categories/list");
      if (!response.ok) {
        throw new Error("Erro ao buscar categorias");
      }

      return response.json() as Promise<{ success: boolean; data: CategoryData[] }>;
    },
  });
}
