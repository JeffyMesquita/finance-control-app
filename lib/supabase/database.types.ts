export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: "INCOME" | "EXPENSE"
          icon: string | null
          color: string | null
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: "INCOME" | "EXPENSE"
          icon?: string | null
          color?: string | null
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: "INCOME" | "EXPENSE"
          icon?: string | null
          color?: string | null
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      financial_accounts: {
        Row: {
          id: string
          name: string
          type: "BANK" | "CREDIT_CARD" | "CASH" | "INVESTMENT" | "OTHER"
          balance: number
          currency: string
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: "BANK" | "CREDIT_CARD" | "CASH" | "INVESTMENT" | "OTHER"
          balance?: number
          currency?: string
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: "BANK" | "CREDIT_CARD" | "CASH" | "INVESTMENT" | "OTHER"
          balance?: number
          currency?: string
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      financial_goals: {
        Row: {
          id: string
          name: string
          target_amount: number
          current_amount: number
          start_date: string
          target_date: string
          category_id: string | null
          account_id: string
          is_completed: boolean
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          target_amount: number
          current_amount?: number
          start_date: string
          target_date: string
          category_id?: string | null
          account_id: string
          is_completed?: boolean
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          start_date?: string
          target_date?: string
          category_id?: string | null
          account_id?: string
          is_completed?: boolean
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          description: string
          date: string
          type: "INCOME" | "EXPENSE"
          is_recurring: boolean
          recurring_interval: string | null
          notes: string | null
          receipt_url: string | null
          category_id: string | null
          account_id: string
          user_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          amount: number
          description: string
          date: string
          type: "INCOME" | "EXPENSE"
          is_recurring?: boolean
          recurring_interval?: string | null
          notes?: string | null
          receipt_url?: string | null
          category_id?: string | null
          account_id: string
          user_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          date?: string
          type?: "INCOME" | "EXPENSE"
          is_recurring?: boolean
          recurring_interval?: string | null
          notes?: string | null
          receipt_url?: string | null
          category_id?: string | null
          account_id?: string
          user_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
