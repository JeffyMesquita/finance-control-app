import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTransactionData } from "@/lib/types/actions";

interface UseUpdateTransactionMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateTransactionMutation(
  options?: UseUpdateTransactionMutationOptions
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string } & UpdateTransactionData) => {
      const res = await fetch("/api/transactions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao atualizar transação");
      return res.json();
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
