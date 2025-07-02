import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminAnalyticsResponse {
  success: boolean;
  data: any;
  error?: string;
}

async function fetchAdminAnalytics(): Promise<any> {
  const response = await fetch("/api/admin/analytics");
  const result: AdminAnalyticsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch admin analytics");
  }

  return result.data;
}

export function useAdminAnalyticsQuery() {
  const { toast } = useToast();

  const queryFn = useCallback(fetchAdminAnalytics, []);

  const query = useQuery<any, Error>({
    queryKey: ["admin-analytics"],
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes (analytics data changes less frequently)
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar analytics",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
