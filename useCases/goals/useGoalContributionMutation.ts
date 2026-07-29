import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { GoalData, SavingsTransactionData } from "@/lib/types/actions";

export function useGoalContributionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      goalId: string;
      savingsBoxId?: string | null;
      amount: number;
      account_id?: string | null;
      description?: string;
    }) => {
      if (isNestDomainEnabled("goals"))
        return apiRequest<GoalData>(`/goals/${input.goalId}/contributions`, {
          method: "POST",
          body: {
            amount: input.amount,
            account_id: input.account_id,
            description: input.description,
          },
        });
      if (input.savingsBoxId) {
        const response = await fetch("/api/savings-transactions/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boxId: input.savingsBoxId,
            amount: input.amount,
            accountId: input.account_id,
            description: input.description,
          }),
        });
        const payload = (await response.json()) as {
          success: boolean;
          data?: SavingsTransactionData;
          error?: string;
        };
        if (!payload.success || !payload.data)
          throw new Error(payload.error || "Falha na contribui??o");
        return payload.data;
      }
      const response = await fetch("/api/goals/update-progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: input.goalId, amount: input.amount }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: GoalData;
        error?: string;
      };
      if (!payload.success || !payload.data)
        throw new Error(payload.error || "Falha na contribui??o");
      if (!input.savingsBoxId && input.account_id) {
        const transactionResponse = await fetch("/api/transactions/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "EXPENSE",
            amount: -input.amount,
            description: input.description,
            date: new Date().toISOString(),
            category_id: null,
            account_id: input.account_id,
          }),
        });
        const transactionPayload = (await transactionResponse.json()) as {
          success: boolean;
          error?: string;
        };
        if (!transactionPayload.success)
          throw new Error(transactionPayload.error || "Falha ao registrar transa??o");
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });
    },
  });
}
