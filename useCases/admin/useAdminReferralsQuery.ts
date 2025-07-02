import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminReferralsResponse {
  success: boolean;
  data: any;
  error?: string;
}

async function fetchAdminReferrals(): Promise<any> {
  const response = await fetch("/api/admin/referrals");
  const result: AdminReferralsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch admin referrals");
  }

  return result.data;
}

export function useAdminReferralsQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchAdminReferrals, []);

  const query = useQuery<any, Error>({
    queryKey: ["admin-referrals"],
    queryFn,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar dados de referências",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
