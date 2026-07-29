import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { CreateSavingsBoxData, SavingsBoxData } from "@/lib/types/actions";

interface CreateSavingsBoxResponse {
  success: boolean;
  data?: SavingsBoxData;
  error?: string;
}

interface CreateSavingsBoxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function createSavingsBox(savingsBox: CreateSavingsBoxData): Promise<SavingsBoxData> {
  if (isNestDomainEnabled("savings-boxes"))
    return apiRequest<SavingsBoxData>("/savings-boxes/create", {
      method: "POST",
      body: savingsBox,
    });
  const response = await fetch("/api/savings-boxes/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(savingsBox),
  });
  const result = (await response.json()) as CreateSavingsBoxResponse;
  if (!result.success || !result.data) throw new Error(result.error || "Falha ao criar cofrinho");
  return result.data;
}

export function useCreateSavingsBoxMutation(options?: CreateSavingsBoxOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createSavingsBox,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Cofrinho criado com sucesso",
        variant: "success",
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar cofrinho",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
