/**
 * Tipos centrais para todas as Actions do FinanceTrack
 *
 * Este arquivo define todas as interfaces de retorno das server actions
 * para garantir tipagem forte e evitar erros de tipo any/never
 */

// ==================== TIPOS BASE ====================

export interface BaseActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> extends BaseActionResult<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  gastosFuturos: number;
  incomeCount: number;
  maxIncome: number;
  expenseCount: number;
  maxExpense: number;
  savings: number;
  nextMonthExpenses: number;
  nextMonthIncome: number;
}

export interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface ExpenseBreakdownItem {
  name: string;
  color: string;
  value: number;
}

export interface GoalsStats {
  total_goals: number;
  completed_goals: number;
  overdue_goals: number;
  linked_to_savings_boxes: number;
  average_progress: number;
  total_target_amount: number;
  total_current_amount: number;
  goals_by_month: {
    name: string;
    goals_created: number;
    goals_completed: number;
    target_amount: number;
  }[];
}

// ==================== TRANSACTIONS TYPES ====================

export interface TransactionData {
  id: string;
  account_id: string;
  amount: number;
  category_id: string;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  is_recurring: boolean;
  installment_number: number | null;
  total_installments: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  account: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: string;
  };
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE";
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionStats {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  averageTransactionAmount: number;
  largestTransaction: number;
  smallestTransaction: number;
}

export type CreateTransactionData = {
  account_id: string;
  amount: number;
  category_id: string | null;
  date: string;
  description: string;
  type: "INCOME" | "EXPENSE";
  is_recurring?: boolean;
  installment_number?: number | null;
  total_installments?: number | null;
  notes?: string | null;
};

export type UpdateTransactionData = Partial<CreateTransactionData>;

// ==================== ACCOUNTS TYPES ====================

export interface AccountData {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AccountWithTransactions extends AccountData {
  transactions?: TransactionData[];
  transaction_count?: number;
  last_transaction_date?: string;
}

export type CreateAccountData = {
  name: string;
  type: string;
  balance?: number;
  currency?: string;
};

export type UpdateAccountData = Partial<CreateAccountData>;

// ==================== CATEGORIES TYPES ====================

export interface CategoryData {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithStats extends CategoryData {
  transaction_count?: number;
  total_amount?: number;
  avg_amount?: number;
  last_used?: string;
}

export type CreateCategoryData = {
  name: string;
  color: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
};

export type UpdateCategoryData = Partial<CreateCategoryData>;

// ==================== GOALS TYPES ====================

export interface GoalData {
  id: string;
  name: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string;
  start_date: string;
  is_completed: boolean;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  category_id?: string | null;
  account_id?: string | null;
  savings_box_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  savings_box?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export type CreateGoalData = {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  start_date: string;
  category_id?: string | null;
  account_id?: string | null;
  savings_box_id?: string | null;
};

export type UpdateGoalData = Partial<CreateGoalData>;

// ==================== SAVINGS BOXES TYPES ====================

export interface SavingsBoxData {
  id: string;
  name: string;
  description: string | null;
  target_amount: number | null;
  current_amount: number;
  color: string;
  icon: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  savings_transactions?: SavingsTransactionData[];
}

export interface SavingsTransactionData {
  id: string;
  savings_box_id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  description: string | null;
  source_account_id: string | null;
  target_savings_box_id: string | null;
  user_id: string;
  created_at: string;
  savings_box?: Pick<SavingsBoxData, "id" | "name" | "color" | "icon">;
  target_box?: Pick<SavingsBoxData, "id" | "name" | "color" | "icon">;
  source_account?: Pick<AccountData, "id" | "name" | "type">;
}

export type CreateSavingsBoxData = {
  name: string;
  description?: string | null;
  target_amount?: number | null;
  current_amount?: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
};

export type UpdateSavingsBoxData = Partial<CreateSavingsBoxData>;

// ==================== INVESTMENTS TYPES ====================

export interface InvestmentData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  initial_amount: number;
  current_amount: number;
  target_amount: number | null;
  investment_date: string;
  is_active: boolean;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type CreateInvestmentData = {
  name: string;
  category: string;
  description?: string | null;
  initial_amount: number;
  current_amount?: number;
  target_amount?: number | null;
  investment_date?: string;
  is_active?: boolean;
  color?: string;
};

export type UpdateInvestmentData = Partial<CreateInvestmentData>;

// ==================== FEEDBACK TYPES ====================

export interface FeedbackData {
  id: string;
  type: "SUGGESTION" | "BUG_REPORT" | "FEEDBACK" | "FEATURE_REQUEST" | "OTHER";
  title: string;
  description: string;
  email: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  browser_info: string | null;
  page_url: string | null;
  user_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackStats {
  total: number;
  byType: Record<FeedbackData["type"], number>;
  byStatus: Record<FeedbackData["status"], number>;
  byPriority: Record<FeedbackData["priority"], number>;
  recentCount: number;
}

export type CreateFeedbackData = Pick<
  FeedbackData,
  | "type"
  | "title"
  | "description"
  | "email"
  | "priority"
  | "browser_info"
  | "page_url"
>;

// ==================== EXPORT TYPES ====================

export interface ExportData {
  transactions: TransactionData[];
  accounts: AccountData[];
  categories: CategoryData[];
  goals: GoalData[];
  savingsBoxes: SavingsBoxData[];
  investments: InvestmentData[];
}

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  accountIds?: string[];
  categoryIds?: string[];
  transactionTypes?: ("INCOME" | "EXPENSE")[];
}

// ==================== ADMIN TYPES ====================

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalFeedbacks: number;
  recentFeedbacks: number;
  systemHealth: "GOOD" | "WARNING" | "ERROR";
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  transactions_count: number;
  feedbacks_count: number;
  is_active: boolean;
}

// ==================== PROFILE/SETTINGS TYPES ====================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  default_currency: string;
  date_format: string;
  theme: "light" | "dark" | "system";
  email_notifications: boolean;
  app_notifications: boolean;
  budget_alerts: boolean;
  due_date_alerts: boolean;
  language: string;
  created_at: string | null;
  updated_at: string | null;
}

export type UpdateUserProfile = Partial<
  Pick<UserProfile, "full_name" | "phone">
>;
export type UpdateUserSettings = Partial<
  Omit<UserSettings, "id" | "created_at" | "updated_at">
>;

// ==================== HELPER TYPES ====================

export const createSuccessResponse = <T>(data: T): BaseActionResult<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (error: string): BaseActionResult => ({
  success: false,
  error,
});

// Tipos para formulários
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface FormState<T> {
  data: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
}

// ==================== ACTION RESPONSE TYPES ====================

// Helper types para respostas das actions
export type ActionResponse<T = any> = Promise<BaseActionResult<T>>;
export type PaginatedActionResponse<T = any> = Promise<PaginatedResult<T>>;

// Tipos específicos para cada action
export type TransactionActionResponse = ActionResponse<TransactionData>;
export type TransactionsListResponse = ActionResponse<TransactionData[]>;
export type AccountActionResponse = ActionResponse<AccountData>;
export type AccountsListResponse = ActionResponse<AccountData[]>;
export type CategoryActionResponse = ActionResponse<CategoryData>;
export type CategoriesListResponse = ActionResponse<CategoryData[]>;
