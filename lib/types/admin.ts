export interface AdminStats {
  users: {
    total: number;
    newThisMonth: number;
    newThisWeek: number;
    activeThisMonth: number;
  };
  transactions: {
    total: number;
    totalAmount: number;
    thisMonth: number;
    thisMonthAmount: number;
    byType: {
      income: { count: number; amount: number };
      expense: { count: number; amount: number };
    };
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
  };
  savingsBoxes: {
    total: number;
    totalSaved: number;
    averageAmount: number;
    activeBoxes: number;
  };
  feedbacks: {
    total: number;
    thisMonth: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  referrals: {
    totalInvites: number;
    successfulReferrals: number;
    conversionRate: number;
    topReferrers: Array<{ referrer_id: string; count: number; email?: string }>;
  };
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminFeedback {
  id: string;
  type: string;
  title: string;
  description: string;
  email?: string;
  priority: string;
  status: string;
  browser_info?: Record<string, unknown>;
  page_url?: string;
  user_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}
