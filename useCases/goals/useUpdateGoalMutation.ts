import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { GoalData, UpdateGoalData } from "@/lib/types/actions";

interface UpdateGoalResponse {
  success: boolean;
  data?: GoalData;
  error?: string;
}

interface UpdateGoalOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function updateGoal(params: { id: string } & UpdateGoalData): Promise<GoalData> {
  if (isNestDomainEnabled("goals"))
    return apiRequest<GoalData>("/goals/update", { method: "PUT", body: params });
  const response = await fetch("/api/goals/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const result = (await response.json()) as UpdateGoalResponse;
  if (!result.success || !result.data) throw new Error(result.error || "Falha ao atualizar meta");
  return result.data;
}

export function useUpdateGoalMutation(options?: UpdateGoalOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateGoal,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso",
        variant: "success",
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar meta",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
