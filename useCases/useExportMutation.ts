import { useMutation } from "@tanstack/react-query";

interface ExportRequest {
  type:
    | "transactions"
    | "accounts"
    | "categories"
    | "goals"
    | "monthly_summary";
  dateFrom?: string;
  dateTo?: string;
  transactionType?: string;
  categoryId?: string;
  accountId?: string;
  year?: number;
}

interface ExportResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

async function exportData(request: ExportRequest): Promise<any[]> {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const result: ExportResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to export data");
  }

  return result.data || [];
}

export function useExportMutation() {
  return useMutation({
    mutationFn: exportData,
  });
}
