"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";

export function useCurrentUser() {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient<Database>();

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/current-user");
    if (!res.ok) {
      throw new Error("Erro ao buscar usuário atual");
    }
    return await res.json();
  }, []);

  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
  });

  // Função de logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["current-user"] });
  }, [supabase, queryClient]);

  // Refresh manual
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return { user, loading, error, refresh, logout };
}
