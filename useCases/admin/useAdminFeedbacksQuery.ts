import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminFeedbacksResponse {
  success: boolean;
  data: any;
  error?: string;
}

interface FeedbackFilters {
  type?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

async function fetchAdminFeedbacks(filters: FeedbackFilters): Promise<any> {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  params.append("page", (filters.page || 1).toString());
  params.append("limit", (filters.limit || 20).toString());

  const response = await fetch(
    `/api/admin/feedbacks/list?${params.toString()}`
  );
  const result: AdminFeedbacksResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch admin feedbacks");
  }

  return result.data;
}

async function updateFeedback(data: {
  feedbackId: string;
  updates: any;
}): Promise<any> {
  const response = await fetch("/api/admin/feedbacks/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: AdminFeedbacksResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update feedback");
  }

  return result.data;
}

export function useAdminFeedbacksQuery(filters: FeedbackFilters = {}) {
  const { toast } = useToast();

  const queryFn = useCallback(() => fetchAdminFeedbacks(filters), [filters]);

  const query = useQuery<any, Error>({
    queryKey: ["admin-feedbacks", filters],
    queryFn,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar feedbacks",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}

export function useUpdateFeedbackMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFeedback,
    onSuccess: () => {
      toast({
        title: "Feedback atualizado",
        description: "O feedback foi atualizado com sucesso.",
      });
      // Invalidate all admin feedbacks queries
      queryClient.invalidateQueries({ queryKey: ["admin-feedbacks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
