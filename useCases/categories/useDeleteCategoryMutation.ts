import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      const res = await fetch(
        `/api/categories/delete?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Erro ao deletar categoria");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}
