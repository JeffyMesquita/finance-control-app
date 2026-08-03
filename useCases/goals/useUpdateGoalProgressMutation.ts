import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { GoalData } from "@/lib/types/actions";

interface UpdateGoalProgressResponse {
  success: boolean;
  data?: GoalData;
  error?: string;
}

interface UpdateProgressOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function updateGoalProgress(params: { id: string; amount: number }): Promise<GoalData> {
  if (isNestDomainEnabled("goals"))
    return apiRequest<GoalData>("/goals/update-progress", { method: "PUT", body: params });
  const response = await fetch("/api/goals/update-progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const result = (await response.json()) as UpdateGoalProgressResponse;
  if (!result.success || !result.data)
    throw new Error(result.error || "Falha ao atualizar progresso");
  return result.data;
}

export function useUpdateGoalProgressMutation(options?: UpdateProgressOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateGoalProgress,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Progresso da meta atualizado com sucesso",
        variant: "success",
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar progresso da meta",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
