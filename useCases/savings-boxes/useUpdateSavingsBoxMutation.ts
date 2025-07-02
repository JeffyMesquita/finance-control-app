import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UpdateSavingsBoxData, SavingsBoxData } from "@/lib/types/actions";

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
  const response = await fetch("/api/savings-boxes/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result: UpdateSavingsBoxResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update savings box");
  }

  return result.data!;
}

export function useUpdateSavingsBoxMutation(options?: UpdateSavingsBoxOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateSavingsBox,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-boxes"] });
      queryClient.invalidateQueries({ queryKey: ["savings-boxes-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

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
