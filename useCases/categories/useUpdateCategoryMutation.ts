import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateCategoryData } from "@/lib/types/actions";

interface UseUpdateCategoryMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateCategoryMutation(
  options?: UseUpdateCategoryMutationOptions
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string } & UpdateCategoryData) => {
      const res = await fetch("/api/categories/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao atualizar categoria");
      return res.json();
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
