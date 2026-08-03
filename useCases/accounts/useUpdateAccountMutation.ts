"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAccount } from "@/app/actions/accounts";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { AccountData, BaseActionResult, UpdateAccountData } from "@/lib/types/actions";
import { invalidateFinancialQueries } from "@/useCases/invalidate-financial-queries";

interface MutationOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

interface UpdateAccountVariables {
  account: UpdateAccountData;
  id: string;
}

export function useUpdateAccountMutation(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      account,
      id,
    }: UpdateAccountVariables): Promise<BaseActionResult<AccountData>> => {
      if (isNestDomainEnabled("accounts")) {
        const data = await apiRequest<AccountData>("/accounts/update", {
          body: { id, ...account },
          method: "PUT",
        });
        return { success: true, data };
      }

      return updateAccount(id, account);
    },
    onError: options?.onError,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      invalidateFinancialQueries(queryClient);
      options?.onSuccess?.();
    },
  });
}
