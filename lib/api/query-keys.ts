export const queryKeys = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
    settings: ["profile", "settings"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
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
