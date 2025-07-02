import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCategoryData } from "@/lib/types/actions";

interface UseCreateCategoryMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateCategoryMutation(
  options?: UseCreateCategoryMutationOptions
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const res = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar categoria");
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
