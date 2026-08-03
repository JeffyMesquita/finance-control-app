export const queryKeys = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
    settings: ["profile", "settings"] as const,
  },
  dashboard: {
    cards: ["dashboard", "cards"] as const,
    summary: ["dashboard", "summary"] as const,
    monthly: ["dashboard", "monthly"] as const,
    expenseBreakdown: (month: "current" | "previous") =>
      ["dashboard", "expense-breakdown", month] as const,
  },
  reports: {
    overview: ["reports", "overview"] as const,
  },
  exports: {
    data: (type: string) => ["exports", "data", type] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: (params?: { search?: string; limit?: number; offset?: number }) =>
      ["goals", "list", params ?? {}] as const,
    detail: (id: string) => ["goals", "detail", id] as const,
  },
  savingsBoxes: {
    all: ["savings-boxes"] as const,
    list: (params?: { search?: string; limit?: number; offset?: number }) =>
      ["savings-boxes", "list", params ?? {}] as const,
    detail: (id: string) => ["savings-boxes", "detail", id] as const,
    stats: ["savings-boxes", "stats"] as const,
    summary: ["savings-boxes", "summary"] as const,
    total: ["savings-boxes", "total"] as const,
  },
  savingsTransactions: {
    list: (boxId?: string, limit?: number) =>
      ["savings-transactions", "list", { boxId, limit }] as const,
    stats: (boxId?: string) => ["savings-transactions", "stats", boxId ?? null] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (params: {
      page?: number;
      pageSize?: number;
      month?: string;
      type?: string;
      category?: string;
      search?: string;
    }) => ["transactions", "list", params] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  accounts: {
    all: ["accounts"] as const,
  },
};
