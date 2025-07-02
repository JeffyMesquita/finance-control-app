import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateSavingsBoxData, SavingsBoxData } from "@/lib/types/actions";

interface CreateSavingsBoxResponse {
  success: boolean;
  data?: SavingsBoxData;
  error?: string;
}

interface CreateSavingsBoxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function createSavingsBox(
  savingsBox: CreateSavingsBoxData
): Promise<SavingsBoxData> {
  const response = await fetch("/api/savings-boxes/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(savingsBox),
  });

  const result: CreateSavingsBoxResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create savings box");
  }

  return result.data!;
}

export function useCreateSavingsBoxMutation(options?: CreateSavingsBoxOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createSavingsBox,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-boxes"] });
      queryClient.invalidateQueries({ queryKey: ["savings-boxes-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast({
        title: "Sucesso",
        description: "Cofrinho criado com sucesso",
        variant: "success",
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar cofrinho",
        variant: "destructive",
      });

      options?.onError?.(error);
    },
  });
}
