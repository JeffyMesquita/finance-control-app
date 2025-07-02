import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DeleteGoalResponse {
  success: boolean;
  error?: string;
}

async function deleteGoal(id: string): Promise<void> {
  const response = await fetch("/api/goals/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const result: DeleteGoalResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete goal");
  }
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

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
