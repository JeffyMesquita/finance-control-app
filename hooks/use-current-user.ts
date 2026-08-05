"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryKeys } from "@/lib/api/query-keys";
import { sessionApi } from "@/lib/api/session";

export function useCurrentUser() {
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: sessionApi.getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = useCallback(async () => {
    await sessionApi.logout();
    queryClient.clear();
  }, [queryClient]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return { user, loading, error, refresh, logout };
}
