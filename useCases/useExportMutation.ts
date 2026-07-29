import { useMutation } from "@tanstack/react-query";
import { ApiError, apiRequest, authenticatedFetch } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";

export type ExportType = "transactions" | "accounts" | "categories" | "goals" | "monthly_summary";
export type ExportFormat = "CSV" | "PDF" | "JSON";

export interface ExportRequest {
  type: ExportType;
  dateFrom?: string;
  dateTo?: string;
  transactionType?: "INCOME" | "EXPENSE";
  categoryId?: string;
  accountId?: string;
  year?: number;
}

export interface ExportFileRequest extends ExportRequest {
  format: ExportFormat;
  includeNotes?: boolean;
}

async function exportData(request: ExportRequest): Promise<unknown[]> {
  if (isNestDomainEnabled("export")) {
    return apiRequest<unknown[]>("/export/data", { method: "POST", body: request });
  }

  const response = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const result = (await response.json()) as { success: boolean; data?: unknown[]; error?: string };
  if (!response.ok || !result.success) throw new Error(result.error || "Failed to export data");
  return result.data || [];
}

async function exportFile(request: ExportFileRequest): Promise<void> {
  const response = await authenticatedFetch("/api/backend/export/file", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => undefined)) as
      | { error?: string }
      | undefined;
    throw new ApiError(payload?.error || "Failed to export file", { status: response.status });
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    response.headers.get("content-disposition")?.match(/filename="([^"]+)"/u)?.[1] ||
    `export.${request.format.toLowerCase()}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useExportMutation() {
  const dataMutation = useMutation({ mutationKey: ["exports", "data"], mutationFn: exportData });
  const fileMutation = useMutation({ mutationKey: ["exports", "file"], mutationFn: exportFile });
  return { ...dataMutation, fileMutation };
}
