import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminUsersResponse {
  success: boolean;
  data: any;
  error?: string;
}

async function fetchAdminUsers(page: number, limit: number): Promise<any> {
  const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
  const result: AdminUsersResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch admin users");
  }

  return result.data;
}

export function useAdminUsersQuery(page: number = 1, limit: number = 20) {
  const { toast } = useToast();

  const queryFn = useCallback(
    () => fetchAdminUsers(page, limit),
    [page, limit]
  );

  const query = useQuery<any, Error>({
    queryKey: ["admin-users", page, limit],
    queryFn,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar usuários",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
