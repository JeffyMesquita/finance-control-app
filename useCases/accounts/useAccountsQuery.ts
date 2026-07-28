"use client";

import { useQuery } from "@tanstack/react-query";

import { getAccounts } from "@/app/actions/accounts";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { AccountData, BaseActionResult } from "@/lib/types/actions";

export function useAccountsQuery() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: async (): Promise<BaseActionResult<AccountData[]>> => {
      if (isNestDomainEnabled("accounts")) {
        const data = await apiRequest<AccountData[]>("/accounts/list");
        return { success: true, data };
      }

      return getAccounts();
    },
  });
}
