export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          icon: string | null;
          id: string;
          name: string;
          type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      feedbacks: {
        Row: {
          admin_notes: string | null;
          browser_info: Json | null;
          created_at: string | null;
          description: string;
          email: string | null;
          id: string;
          page_url: string | null;
          priority: string | null;
          resolved_at: string | null;
          status: string | null;
          title: string;
          type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          browser_info?: Json | null;
          created_at?: string | null;
          description: string;
          email?: string | null;
          id?: string;
          page_url?: string | null;
          priority?: string | null;
          resolved_at?: string | null;
          status?: string | null;
          title: string;
          type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          browser_info?: Json | null;
          created_at?: string | null;
          description?: string;
          email?: string | null;
          id?: string;
          page_url?: string | null;
          priority?: string | null;
          resolved_at?: string | null;
          status?: string | null;
          title?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      financial_accounts: {
        Row: {
          balance: number | null;
          created_at: string | null;
          currency: string | null;
          id: string;
          name: string;
          type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          balance?: number | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          name: string;
          type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          balance?: number | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          name?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "financial_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_goals: {
        Row: {
          account_id: string | null;
          category_id: string | null;
          created_at: string | null;
          current_amount: number | null;
          id: string;
          is_completed: boolean | null;
          name: string;
          savings_box_id: string | null;
          start_date: string;
          target_amount: number;
          target_date: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          account_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          current_amount?: number | null;
          id?: string;
          is_completed?: boolean | null;
          name: string;
          savings_box_id?: string | null;
          start_date: string;
          target_amount?: number;
          target_date: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          account_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          current_amount?: number | null;
          id?: string;
          is_completed?: boolean | null;
          name?: string;
          savings_box_id?: string | null;
          start_date?: string;
          target_amount?: number;
          target_date?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "financial_goals_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_goals_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_goals_savings_box_id_fkey";
            columns: ["savings_box_id"];
            isOneToOne: false;
            referencedRelation: "savings_boxes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      investment_transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          investment_id: string;
          transaction_date: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          investment_id: string;
          transaction_date?: string;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          investment_id?: string;
          transaction_date?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investment_transactions_investment_id_fkey";
            columns: ["investment_id"];
            isOneToOne: false;
            referencedRelation: "investments";
            referencedColumns: ["id"];
          },
        ];
      };
      investments: {
        Row: {
          category: string;
          color: string | null;
          created_at: string | null;
          current_amount: number;
          description: string | null;
          id: string;
          initial_amount: number;
          investment_date: string;
          is_active: boolean | null;
          last_updated: string | null;
          name: string;
          target_amount: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category: string;
          color?: string | null;
          created_at?: string | null;
          current_amount?: number;
          description?: string | null;
          id?: string;
          initial_amount?: number;
          investment_date?: string;
          is_active?: boolean | null;
          last_updated?: string | null;
          name: string;
          target_amount?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string;
          color?: string | null;
          created_at?: string | null;
          current_amount?: number;
          description?: string | null;
          id?: string;
          initial_amount?: number;
          investment_date?: string;
          is_active?: boolean | null;
          last_updated?: string | null;
          name?: string;
          target_amount?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      payment_reminders: {
        Row: {
          amount: number;
          category: string | null;
          created_at: string | null;
          description: string | null;
          due_date: string;
          frequency: Database["public"]["Enums"]["payment_frequency"] | null;
          id: string;
          is_recurring: boolean | null;
          last_notification_sent_at: string | null;
          notification_sent: boolean | null;
          recurrence_pattern: Json | null;
          status: Database["public"]["Enums"]["payment_status"] | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          due_date: string;
          frequency?: Database["public"]["Enums"]["payment_frequency"] | null;
          id?: string;
          is_recurring?: boolean | null;
          last_notification_sent_at?: string | null;
          notification_sent?: boolean | null;
          recurrence_pattern?: Json | null;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          due_date?: string;
          frequency?: Database["public"]["Enums"]["payment_frequency"] | null;
          id?: string;
          is_recurring?: boolean | null;
          last_notification_sent_at?: string | null;
          notification_sent?: boolean | null;
          recurrence_pattern?: Json | null;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      savings_boxes: {
        Row: {
          color: string | null;
          created_at: string | null;
          current_amount: number | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          target_amount: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          current_amount?: number | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          target_amount?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          current_amount?: number | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          target_amount?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      savings_transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          savings_box_id: string;
          source_account_id: string | null;
          target_savings_box_id: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          savings_box_id: string;
          source_account_id?: string | null;
          target_savings_box_id?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          savings_box_id?: string;
          source_account_id?: string | null;
          target_savings_box_id?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "savings_transactions_savings_box_id_fkey";
            columns: ["savings_box_id"];
            isOneToOne: false;
            referencedRelation: "savings_boxes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "savings_transactions_source_account_id_fkey";
            columns: ["source_account_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "savings_transactions_target_savings_box_id_fkey";
            columns: ["target_savings_box_id"];
            isOneToOne: false;
            referencedRelation: "savings_boxes";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          account_id: string | null;
          amount: number;
          category_id: string | null;
          created_at: string | null;
          date: string;
          description: string;
          id: string;
          installment_number: number | null;
          is_recurring: boolean | null;
          notes: string | null;
          receipt_url: string | null;
          recurring_interval: string | null;
          total_installments: number | null;
          type: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          category_id?: string | null;
          created_at?: string | null;
          date: string;
          description: string;
          id?: string;
          installment_number?: number | null;
          is_recurring?: boolean | null;
          notes?: string | null;
          receipt_url?: string | null;
          recurring_interval?: string | null;
          total_installments?: number | null;
          type: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          category_id?: string | null;
          created_at?: string | null;
          date?: string;
          description?: string;
          id?: string;
          installment_number?: number | null;
          is_recurring?: boolean | null;
          notes?: string | null;
          receipt_url?: string | null;
          recurring_interval?: string | null;
          total_installments?: number | null;
          type?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_badges: {
        Row: {
          badge_type: string;
          earned_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          badge_type: string;
          earned_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          badge_type?: string;
          earned_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_invites: {
        Row: {
          created_at: string;
          id: string;
          referred_id: string;
          referrer_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          referred_id: string;
          referrer_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          referred_id?: string;
          referrer_id?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          address: string | null;
          bio: string | null;
          birth_date: string | null;
          city: string | null;
          created_at: string | null;
          document_id: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          postal_code: string | null;
          profession: string | null;
          profile_image: string | null;
          state: string | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          bio?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string | null;
          document_id?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          postal_code?: string | null;
          profession?: string | null;
          profile_image?: string | null;
          state?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          bio?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string | null;
          document_id?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          postal_code?: string | null;
          profession?: string | null;
          profile_image?: string | null;
          state?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          app_notifications: boolean | null;
          budget_alerts: boolean | null;
          created_at: string | null;
          date_format: string | null;
          default_currency: string | null;
          due_date_alerts: boolean | null;
          email_notifications: boolean | null;
          id: string;
          language: string | null;
          theme: string | null;
          updated_at: string | null;
        };
        Insert: {
          app_notifications?: boolean | null;
          budget_alerts?: boolean | null;
          created_at?: string | null;
          date_format?: string | null;
          default_currency?: string | null;
          due_date_alerts?: boolean | null;
          email_notifications?: boolean | null;
          id: string;
          language?: string | null;
          theme?: string | null;
          updated_at?: string | null;
        };
        Update: {
          app_notifications?: boolean | null;
          budget_alerts?: boolean | null;
          created_at?: string | null;
          date_format?: string | null;
          default_currency?: string | null;
          due_date_alerts?: boolean | null;
          email_notifications?: boolean | null;
          id?: string;
          language?: string | null;
          theme?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_overdue_payments: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_recurring_transactions: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      payment_frequency: "daily" | "weekly" | "monthly" | "yearly";
      payment_status: "pending" | "paid" | "overdue" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      payment_frequency: ["daily", "weekly", "monthly", "yearly"],
      payment_status: ["pending", "paid", "overdue", "cancelled"],
    },
  },
} as const;

// Legacy types for backward compatibility
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
