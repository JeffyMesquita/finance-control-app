"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAccount } from "@/app/actions/accounts";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { BaseActionResult } from "@/lib/types/actions";

interface MutationOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useDeleteAccountMutation(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<BaseActionResult<void>> => {
      if (isNestDomainEnabled("accounts")) {
        await apiRequest<void>(`/accounts/delete?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        return { success: true };
      }

      return deleteAccount(id);
    },
    onError: options?.onError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      options?.onSuccess?.();
    },
  });
}
