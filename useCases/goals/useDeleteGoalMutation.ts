import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";

async function deleteGoal(id: string): Promise<void> {
  if (isNestDomainEnabled("goals")) {
    await apiRequest<void>("/goals/delete", { method: "DELETE", body: { id } });
    return;
  }
  const response = await fetch("/api/goals/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const result = (await response.json()) as { success: boolean; error?: string };
  if (!result.success) throw new Error(result.error || "Falha ao excluir meta");
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir meta",
        variant: "destructive",
      });
    },
  });
}
