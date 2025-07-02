import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { AdminStats } from "@/app/actions/admin";

interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
  error?: string;
}

async function fetchAdminStats(): Promise<AdminStats> {
  // Para usar temporariamente o server action até migrar completamente
  const { getAdminStats } = await import("@/app/actions/admin");
  const result = await getAdminStats();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch admin stats");
  }

  return result.data!;
}

export function useAdminStatsQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchAdminStats, []);

  const query = useQuery<AdminStats, Error>({
    queryKey: ["admin-stats"],
    queryFn,
    staleTime: 1000 * 60 * 2, // 2 minutes (admin data changes more frequently)
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
