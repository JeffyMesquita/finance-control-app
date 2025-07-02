import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UpdateGoalData, GoalData } from "@/lib/types/actions";

interface UpdateGoalResponse {
  success: boolean;
  data?: GoalData;
  error?: string;
}

interface UpdateGoalOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function updateGoal(
  params: { id: string } & UpdateGoalData
): Promise<GoalData> {
  const response = await fetch("/api/goals/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result: UpdateGoalResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update goal");
  }

  return result.data!;
}

export function useUpdateGoalMutation(options?: UpdateGoalOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateGoal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

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
