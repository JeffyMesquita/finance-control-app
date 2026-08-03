import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { SavingsBoxData, UpdateSavingsBoxData } from "@/lib/types/actions";

interface UpdateSavingsBoxResponse {
  success: boolean;
  data?: SavingsBoxData;
  error?: string;
}

interface UpdateSavingsBoxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function updateSavingsBox(
  params: { id: string } & UpdateSavingsBoxData
): Promise<SavingsBoxData> {
  if (isNestDomainEnabled("savings-boxes"))
    return apiRequest<SavingsBoxData>("/savings-boxes/update", { method: "PUT", body: params });
  const response = await fetch("/api/savings-boxes/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const result = (await response.json()) as UpdateSavingsBoxResponse;
  if (!result.success || !result.data)
    throw new Error(result.error || "Falha ao atualizar cofrinho");
  return result.data;
}

export function useUpdateSavingsBoxMutation(options?: UpdateSavingsBoxOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateSavingsBox,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Cofrinho atualizado com sucesso",
        variant: "success",
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar cofrinho",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
