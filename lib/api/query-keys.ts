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
