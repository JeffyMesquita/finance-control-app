import type {
  Tables,
  InsertTables,
  UpdateTables,
} from "@/lib/supabase/database.types";

// Tipos base das tabelas
export type SavingsBox = Tables<"savings_boxes">;
export type SavingsTransaction = Tables<"savings_transactions">;
export type InsertSavingsBox = InsertTables<"savings_boxes">;
export type UpdateSavingsBox = UpdateTables<"savings_boxes">;
export type InsertSavingsTransaction = InsertTables<"savings_transactions">;
export type UpdateSavingsTransaction = UpdateTables<"savings_transactions">;

// Tipos para transações
export type SavingsTransactionType = "DEPOSIT" | "WITHDRAW" | "TRANSFER";

// Tipo para cofrinhos com dados relacionados (para exibição)
export type SavingsBoxWithRelations = SavingsBox & {
  transactions?: SavingsTransaction[];
  transactionCount?: number;
  goalLinked?: {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
  };
};

// Tipo para resumo de cofrinhos (dashboard)
export type SavingsBoxSummary = {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
  color: string;
  icon: string;
  progress_percentage: number;
  is_goal_linked: boolean;
};

// Tipo para estatísticas gerais dos cofrinhos
export type SavingsStats = {
  total_boxes: number;
  total_amount: number;
  total_with_goals: number;
  total_completed_goals: number;
  boxes_by_amount: SavingsBoxSummary[];
};

// Tipo para formulário de criação/edição de cofrinho
export type SavingsBoxFormData = {
  name: string;
  description?: string;
  target_amount?: number;
  color: string;
  icon: string;
};

// Tipo para formulário de transação
export type SavingsTransactionFormData = {
  amount: number;
  type: SavingsTransactionType;
  description?: string;
  source_account_id?: string;
  target_savings_box_id?: string; // Para transferências
};

// Tipo para transferência entre cofrinhos
export type SavingsTransferData = {
  from_box_id: string;
  to_box_id: string;
  amount: number;
  description?: string;
};

// Tipo para validação de saldo
export type BalanceValidation = {
  is_valid: boolean;
  current_balance: number;
  requested_amount: number;
  message?: string;
};

// Enums para ícones predefinidos
export const SAVINGS_BOX_ICONS = [
  "piggy-bank",
  "home",
  "plane",
  "car",
  "graduation-cap",
  "heart",
  "shield",
  "gift",
  "smartphone",
  "laptop",
  "camera",
  "gamepad",
  "shopping-cart",
  "coffee",
  "music",
  "book",
  "bike",
  "dumbbell",
  "tree",
  "star",
] as const;

export type SavingsBoxIcon = (typeof SAVINGS_BOX_ICONS)[number];

// Cores predefinidas para cofrinhos
export const SAVINGS_BOX_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#A855F7", // Violet
  "#22C55E", // Green
  "#64748B", // Slate
  "#000000", // Black
  "#FFFFFF", // White
] as const;

export type SavingsBoxColor = (typeof SAVINGS_BOX_COLORS)[number];

// Helper types para ações
export type CreateSavingsBoxAction = (
  data: InsertSavingsBox
) => Promise<{ success: boolean; data?: SavingsBox; error?: string }>;
export type UpdateSavingsBoxAction = (
  id: string,
  data: UpdateSavingsBox
) => Promise<{ success: boolean; data?: SavingsBox; error?: string }>;
export type DeleteSavingsBoxAction = (
  id: string
) => Promise<{ success: boolean; error?: string }>;

export type DepositAction = (
  boxId: string,
  amount: number,
  accountId?: string,
  description?: string
) => Promise<{ success: boolean; data?: SavingsTransaction; error?: string }>;
export type WithdrawAction = (
  boxId: string,
  amount: number,
  accountId?: string,
  description?: string
) => Promise<{ success: boolean; data?: SavingsTransaction; error?: string }>;
export type TransferAction = (
  fromBoxId: string,
  toBoxId: string,
  amount: number,
  description?: string
) => Promise<{ success: boolean; data?: SavingsTransaction[]; error?: string }>;

// Tipos para props de componentes
export interface SavingsBoxCardProps {
  savingsBox: SavingsBoxWithRelations;
  onEdit: (box: SavingsBox) => void;
  onDelete: (id: string) => void;
  onDeposit: (box: SavingsBox) => void;
  onWithdraw: (box: SavingsBox) => void;
  onTransfer: (box: SavingsBox) => void;
}

export interface SavingsBoxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsBox?: SavingsBox;
  onSuccess?: () => void;
}

export interface SavingsTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsBox: SavingsBox;
  transactionType: SavingsTransactionType;
  onSuccess?: () => void;
}

export interface SavingsTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromBox?: SavingsBox;
  savingsBoxes: SavingsBox[];
  onSuccess?: () => void;
}
