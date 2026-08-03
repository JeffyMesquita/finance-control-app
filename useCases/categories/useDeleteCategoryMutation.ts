import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";

interface UseDeleteCategoryMutationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteCategoryMutation({
  onSuccess,
  onError,
}: UseDeleteCategoryMutationProps) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isNestDomainEnabled("categories")) {
        await apiRequest<void>(`/categories/delete?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        return { success: true };
      }

      const response = await fetch(
        `/api/categories/delete?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error("Erro ao deletar categoria");
      }

      return response.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}
