import { useMutation, useQueryClient } from "@tanstack/react-query";
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

async function mutateMovement(
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
  const legacyPath =
    operation === "deposits"
      ? "/api/savings-transactions/deposit"
      : operation === "withdrawals"
        ? "/api/savings-transactions/withdraw"
        : "/api/savings-transactions/transfer";
  const response = await fetch(legacyPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    success: boolean;
    data?: SavingsTransactionData;
    error?: string;
  };
  if (!payload.success || !payload.data) throw new Error(payload.error || "Falha na movimenta??o");
  return payload.data;
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
