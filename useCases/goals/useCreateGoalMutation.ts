import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { CreateGoalData, GoalData } from "@/lib/types/actions";

interface CreateGoalResponse {
  success: boolean;
  data?: GoalData;
  error?: string;
}

interface CreateGoalOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function createGoal(goal: CreateGoalData): Promise<GoalData> {
  if (isNestDomainEnabled("goals"))
    return apiRequest<GoalData>("/goals/create", { method: "POST", body: goal });
  const response = await fetch("/api/goals/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
  });
  const result = (await response.json()) as CreateGoalResponse;
  if (!result.success || !result.data) throw new Error(result.error || "Falha ao criar meta");
  return result.data;
}

export function useCreateGoalMutation(options?: CreateGoalOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });

      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso",
        variant: "success",
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar meta",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
