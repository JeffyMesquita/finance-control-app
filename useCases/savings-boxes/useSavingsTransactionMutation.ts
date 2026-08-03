import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  depositToSavingsBox,
  transferBetweenBoxes,
  withdrawFromSavingsBox,
} from "@/app/actions/savings-transactions";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { SavingsTransactionData } from "@/lib/types/actions";

type MovementInput = {
  boxId: string;
  amount: number;
  account_id?: string | null;
  target_savings_box_id?: string;
  description?: string | null;
};

export async function mutateMovement(
  operation: "deposits" | "withdrawals" | "transfers",
  input: MovementInput
): Promise<SavingsTransactionData> {
  if (isNestDomainEnabled("savings-boxes"))
    return apiRequest<SavingsTransactionData>(`/savings-boxes/${input.boxId}/${operation}`, {
      method: "POST",
      body: {
        amount: input.amount,
        account_id: input.account_id,
        target_savings_box_id: input.target_savings_box_id,
        description: input.description,
      },
    });
  const result =
    operation === "deposits"
      ? await depositToSavingsBox(
          input.boxId,
          input.amount,
          input.account_id ?? undefined,
          input.description ?? undefined
        )
      : operation === "withdrawals"
        ? await withdrawFromSavingsBox(
            input.boxId,
            input.amount,
            input.account_id ?? undefined,
            input.description ?? undefined
          )
        : input.target_savings_box_id
          ? await transferBetweenBoxes(
              input.boxId,
              input.target_savings_box_id,
              input.amount,
              input.description ?? undefined
            )
          : { success: false as const, error: "Cofrinho de destino obrigatório" };

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Falha na movimentação");
  }
  return result.data;
}

export function useSavingsTransactionMutation(operation: "deposits" | "withdrawals" | "transfers") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementInput) => mutateMovement(operation, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-transactions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });
    },
  });
}
