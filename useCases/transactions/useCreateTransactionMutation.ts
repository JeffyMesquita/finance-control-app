import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTransactionData } from "@/lib/types/actions";

interface UseCreateTransactionMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateTransactionMutation(
  options?: UseCreateTransactionMutationOptions
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const res = await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar transação");
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
