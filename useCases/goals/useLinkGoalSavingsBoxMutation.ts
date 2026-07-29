import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { GoalData } from "@/lib/types/actions";

export function useLinkGoalSavingsBoxMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      savings_box_id: string | null;
      current_amount?: number;
    }) => {
      if (isNestDomainEnabled("goals"))
        return apiRequest<GoalData>("/goals/link-savings-box", {
          method: "PUT",
          body: { id: input.id, savings_box_id: input.savings_box_id },
        });
      const response = await fetch("/api/goals/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: GoalData;
        error?: string;
      };
      if (!payload.success || !payload.data)
        throw new Error(payload.error || "Falha ao atualizar v?nculo");
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsBoxes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.cards });
    },
  });
}
