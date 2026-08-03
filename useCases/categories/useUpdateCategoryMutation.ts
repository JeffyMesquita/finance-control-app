import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { CategoryData, UpdateCategoryData } from "@/lib/types/actions";

interface UseUpdateCategoryMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateCategoryMutation(
  options?: UseUpdateCategoryMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string } & UpdateCategoryData) => {
      if (isNestDomainEnabled("categories")) {
        const category = await apiRequest<CategoryData>("/categories/update", {
          body: data,
          method: "PUT",
        });
        return { success: true, data: category };
      }

      const response = await fetch("/api/categories/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar categoria");
      }

      return response.json() as Promise<{ success: boolean; data: CategoryData }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
