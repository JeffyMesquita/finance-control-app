import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { GoalData } from "@/lib/types/actions";

interface UpdateGoalProgressResponse {
  success: boolean;
  data?: GoalData;
  error?: string;
}

interface UpdateProgressOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function updateGoalProgress(params: {
  id: string;
  amount: number;
}): Promise<GoalData> {
  const response = await fetch("/api/goals/update-progress", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result: UpdateGoalProgressResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update goal progress");
  }

  return result.data!;
}

export function useUpdateGoalProgressMutation(options?: UpdateProgressOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateGoalProgress,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

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
