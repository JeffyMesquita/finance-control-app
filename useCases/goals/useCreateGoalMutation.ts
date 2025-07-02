import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateGoalData, GoalData } from "@/lib/types/actions";

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
  const response = await fetch("/api/goals/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goal),
  });

  const result: CreateGoalResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create goal");
  }

  return result.data!;
}

export function useCreateGoalMutation(options?: CreateGoalOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

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
