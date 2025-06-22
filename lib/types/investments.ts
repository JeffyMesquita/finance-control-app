export interface Investment {
  id: string;
  user_id: string;
  name: string;
  category: InvestmentCategory;
  description?: string;
  initial_amount: number;
  current_amount: number;
  target_amount?: number;
  investment_date: string;
  last_updated: string;
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentTransaction {
  id: string;
  investment_id: string;
  user_id: string;
  type: InvestmentTransactionType;
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export type InvestmentCategory =
  | "renda_fixa"
  | "acoes"
  | "fundos"
  | "fiis"
  | "criptomoedas"
  | "commodities"
  | "internacional"
  | "previdencia"
  | "outros";

export type InvestmentTransactionType =
  | "aporte"
  | "resgate"
  | "rendimento"
  | "taxa";

export interface CreateInvestmentData {
  name: string;
  category: InvestmentCategory;
  description?: string;
  initial_amount: number;
  target_amount?: number;
  investment_date: string;
  color?: string;
}

export interface UpdateInvestmentData {
  name?: string;
  category?: InvestmentCategory;
  description?: string;
  current_amount?: number;
  target_amount?: number;
  is_active?: boolean;
  color?: string;
}

export interface CreateInvestmentTransactionData {
  investment_id: string;
  type: InvestmentTransactionType;
  amount: number;
  description?: string;
  transaction_date: string;
}

export interface InvestmentSummary {
  total_invested: number;
  current_value: number;
  total_return: number;
  return_percentage: number;
  monthly_contributions: number;
  active_investments: number;
}

export interface InvestmentCategoryStats {
  category: InvestmentCategory;
  total_amount: number;
  percentage: number;
  return_amount: number;
  return_percentage: number;
}

export const INVESTMENT_CATEGORIES: Record<InvestmentCategory, string> = {
  renda_fixa: "Renda Fixa",
  acoes: "Ações",
  fundos: "Fundos",
  fiis: "FIIs",
  criptomoedas: "Criptomoedas",
  commodities: "Commodities",
  internacional: "Internacional",
  previdencia: "Previdência",
  outros: "Outros",
};

export const INVESTMENT_TRANSACTION_TYPES: Record<
  InvestmentTransactionType,
  string
> = {
  aporte: "Aporte",
  resgate: "Resgate",
  rendimento: "Rendimento",
  taxa: "Taxa",
};

export const INVESTMENT_CATEGORY_COLORS: Record<InvestmentCategory, string> = {
  renda_fixa: "#10B981",
  acoes: "#3B82F6",
  fundos: "#8B5CF6",
  fiis: "#F59E0B",
  criptomoedas: "#EF4444",
  commodities: "#84CC16",
  internacional: "#06B6D4",
  previdencia: "#6366F1",
  outros: "#6B7280",
};
