"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAccount } from "@/app/actions/accounts";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { AccountData, BaseActionResult, CreateAccountData } from "@/lib/types/actions";
import { invalidateFinancialQueries } from "@/useCases/invalidate-financial-queries";

interface MutationOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useCreateAccountMutation(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: CreateAccountData): Promise<BaseActionResult<AccountData>> => {
      if (isNestDomainEnabled("accounts")) {
        const data = await apiRequest<AccountData>("/accounts/create", {
          body: account,
          method: "POST",
        });
        return { success: true, data };
      }

      return createAccount(account);
    },
    onError: options?.onError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      invalidateFinancialQueries(queryClient);
      options?.onSuccess?.();
    },
  });
}
