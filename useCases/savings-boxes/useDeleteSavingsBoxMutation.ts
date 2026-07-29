import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";

interface DeleteSavingsBoxResponse {
  success: boolean;
  error?: string;
}

async function deleteSavingsBox(id: string): Promise<void> {
  if (isNestDomainEnabled("savings-boxes")) {
    await apiRequest<void>("/savings-boxes/delete", {
      body: { id },
      method: "DELETE",
    });
    return;
  }

  const response = await fetch("/api/savings-boxes/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const result: DeleteSavingsBoxResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete savings box");
  }
}

export function useDeleteSavingsBoxMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteSavingsBox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Cofrinho excluído com sucesso",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir cofrinho",
        variant: "destructive",
      });
    },
  });
}
