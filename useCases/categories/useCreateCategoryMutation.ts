import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { CategoryData, CreateCategoryData } from "@/lib/types/actions";

interface UseCreateCategoryMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateCategoryMutation(
  options?: UseCreateCategoryMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      if (isNestDomainEnabled("categories")) {
        const category = await apiRequest<CategoryData>("/categories/create", {
          body: data,
          method: "POST",
        });
        return { success: true, data: category };
      }

      const response = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar categoria");
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
