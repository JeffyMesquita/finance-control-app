import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPaginatedRequest, apiRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import type { AdminFeedback, AdminPagination } from "@/lib/types/admin";
import { adminQueryKeys } from "./useAdminStatsQuery";

export interface FeedbackFilters {
  type?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

interface AdminFeedbacksData {
  feedbacks: AdminFeedback[];
  pagination: AdminPagination;
}

interface UpdateFeedbackInput {
  feedbackId: string;
  updates: { status?: string; admin_notes?: string };
}

function toQuery(filters: FeedbackFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(((filters.page ?? 1) - 1) * (filters.limit ?? 20)));
  return params;
}

async function fetchAdminFeedbacks(filters: FeedbackFilters): Promise<AdminFeedbacksData> {
  if (isNestDomainEnabled("admin")) {
    const limit = filters.limit ?? 20;
    const page = filters.page ?? 1;
    const result = await apiPaginatedRequest<AdminFeedback>(
      `/admin/feedbacks/list?${toQuery(filters).toString()}`
    );
    const total = result.total ?? 0;
    return {
      feedbacks: result.data ?? [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  const response = await fetch(`/api/admin/feedbacks/list?${toQuery(filters).toString()}`);
  const result = (await response.json()) as {
    success: boolean;
    data?: AdminFeedbacksData;
    error?: string;
  };
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch admin feedbacks");
  }
  return result.data;
}

async function updateFeedback(input: UpdateFeedbackInput): Promise<AdminFeedback> {
  if (isNestDomainEnabled("admin")) {
    return apiRequest<AdminFeedback>("/admin/feedbacks/update", {
      method: "PUT",
      body: { id: input.feedbackId, ...input.updates },
    });
  }

  const response = await fetch("/api/admin/feedbacks/update", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ feedbackId: input.feedbackId, updates: input.updates }),
  });
  const result = (await response.json()) as {
    success: boolean;
    data?: AdminFeedback;
    error?: string;
  };
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || "Failed to update feedback");
  }
  return result.data;
}

export function useAdminFeedbacksQuery(filters: FeedbackFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.feedbacks(filters),
    queryFn: () => fetchAdminFeedbacks(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateFeedbackMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFeedback,
    onSuccess: () => {
      toast.success("Feedback atualizado com sucesso.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "feedbacks"] });
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar feedback", { description: error.message });
    },
  });
}
