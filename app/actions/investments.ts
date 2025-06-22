"use server";

import { logger } from "@/lib/utils/logger";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  Investment,
  InvestmentTransaction,
  CreateInvestmentData,
  UpdateInvestmentData,
  CreateInvestmentTransactionData,
  InvestmentSummary,
  InvestmentCategoryStats,
  INVESTMENT_CATEGORY_COLORS,
} from "@/lib/types/investments";
import type { BaseActionResult } from "@/lib/types/actions";

// Helper para converter centavos para reais
const convertFromCents = (cents: number): number => {
  return cents / 100;
};

// Helper para converter reais para centavos
const convertToCents = (reais: number): number => {
  return Math.round(reais * 100);
};

// Helper para converter investment do banco (centavos) para interface (reais)
const convertInvestmentFromDB = (investment: any): Investment => ({
  ...investment,
  initial_amount: convertFromCents(investment.initial_amount),
  current_amount: convertFromCents(investment.current_amount),
  target_amount: investment.target_amount
    ? convertFromCents(investment.target_amount)
    : undefined,
});

// Helper para converter transaction do banco (centavos) para interface (reais)
const convertTransactionFromDB = (transaction: any): InvestmentTransaction => ({
  ...transaction,
  amount: convertFromCents(transaction.amount),
});

// Criar investimento
export async function createInvestment(
  data: CreateInvestmentData
): Promise<BaseActionResult<Investment>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const investmentData = {
      ...data,
      user_id: user.id,
      initial_amount: convertToCents(data.initial_amount),
      current_amount: convertToCents(data.initial_amount),
      target_amount: data.target_amount
        ? convertToCents(data.target_amount)
        : undefined,
      color: data.color || INVESTMENT_CATEGORY_COLORS[data.category],
    };

    const { data: investment, error } = await supabase
      .from("investments")
      .insert(investmentData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Criar transação inicial de aporte
    await supabase.from("investment_transactions").insert({
      investment_id: investment.id,
      user_id: user.id,
      type: "aporte",
      amount: convertToCents(data.initial_amount),
      description: "Investimento inicial",
      transaction_date: data.investment_date,
    });

    revalidatePath("/dashboard/investimentos");
    return {
      success: true,
      data: convertInvestmentFromDB(investment),
    };
  } catch (error) {
    logger.error("Erro ao criar investimento:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Buscar investimentos do usuário
export async function getInvestments(): Promise<
  BaseActionResult<Investment[]>
> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: true,
        data: [],
      };
    }

    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: (data || []).map(convertInvestmentFromDB),
    };
  } catch (error) {
    logger.error("Erro ao buscar investimentos:", error as Error);
    return {
      success: false,
      error: "Erro ao buscar investimentos",
    };
  }
}

// Buscar investimento por ID
export async function getInvestmentById(
  id: string
): Promise<BaseActionResult<Investment>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: convertInvestmentFromDB(data),
    };
  } catch (error) {
    logger.error("Erro ao buscar investimento:", error as Error);
    return {
      success: false,
      error: "Erro ao buscar investimento",
    };
  }
}

// Atualizar investimento
export async function updateInvestment(
  id: string,
  data: UpdateInvestmentData
): Promise<BaseActionResult<Investment>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Converter valores monetários para centavos
    const updateData = {
      ...data,
      current_amount: data.current_amount
        ? convertToCents(data.current_amount)
        : undefined,
      target_amount: data.target_amount
        ? convertToCents(data.target_amount)
        : undefined,
    };

    const { data: investment, error } = await supabase
      .from("investments")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/dashboard/investimentos");
    return {
      success: true,
      data: convertInvestmentFromDB(investment),
    };
  } catch (error) {
    logger.error("Erro ao atualizar investimento:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Deletar investimento
export async function deleteInvestment(
  id: string
): Promise<BaseActionResult<void>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/dashboard/investimentos");
    return {
      success: true,
    };
  } catch (error) {
    logger.error("Erro ao deletar investimento:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Criar transação de investimento
export async function createInvestmentTransaction(
  data: CreateInvestmentTransactionData
): Promise<BaseActionResult<InvestmentTransaction>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Converter valor para centavos
    const transactionData = {
      ...data,
      user_id: user.id,
      amount: convertToCents(data.amount),
    };

    // Criar transação
    const { data: transaction, error: transactionError } = await supabase
      .from("investment_transactions")
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      return {
        success: false,
        error: transactionError.message,
      };
    }

    // Atualizar o valor atual do investimento
    const { data: investment } = await supabase
      .from("investments")
      .select("current_amount")
      .eq("id", data.investment_id)
      .single();

    if (investment) {
      let newAmount = investment.current_amount;

      if (data.type === "aporte" || data.type === "rendimento") {
        newAmount += convertToCents(data.amount);
      } else if (data.type === "resgate" || data.type === "taxa") {
        newAmount -= convertToCents(data.amount);
      }

      await supabase
        .from("investments")
        .update({
          current_amount: Math.max(0, newAmount),
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.investment_id);
    }

    revalidatePath("/dashboard/investimentos");
    return {
      success: true,
      data: convertTransactionFromDB(transaction),
    };
  } catch (error) {
    logger.error("Erro ao criar transação:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Buscar transações de investimento
export async function getInvestmentTransactions(
  investmentId?: string
): Promise<BaseActionResult<InvestmentTransaction[]>> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: true,
        data: [],
      };
    }

    let query = supabase
      .from("investment_transactions")
      .select("*")
      .eq("user_id", user.id);

    if (investmentId) {
      query = query.eq("investment_id", investmentId);
    }

    const { data, error } = await query.order("transaction_date", {
      ascending: false,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: (data || []).map(convertTransactionFromDB),
    };
  } catch (error) {
    logger.error("Erro ao buscar transações:", error as Error);
    return {
      success: false,
      error: "Erro ao buscar transações",
    };
  }
}

// Obter resumo dos investimentos
export async function getInvestmentSummary(): Promise<
  BaseActionResult<InvestmentSummary>
> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: true,
        data: {
          total_invested: 0,
          current_value: 0,
          total_return: 0,
          return_percentage: 0,
          monthly_contributions: 0,
          active_investments: 0,
        },
      };
    }

    const investmentsResult = await getInvestments();
    if (!investmentsResult.success || !investmentsResult.data) {
      return {
        success: false,
        error: "Erro ao buscar investimentos",
      };
    }

    const investments = investmentsResult.data;
    const activeInvestments = investments.filter((inv) => inv.is_active);

    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum + inv.initial_amount,
      0
    );
    const currentValue = activeInvestments.reduce(
      (sum, inv) => sum + inv.current_amount,
      0
    );
    const totalReturn = currentValue - totalInvested;
    const returnPercentage =
      totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Calcular aportes mensais (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTransactions } = await supabase
      .from("investment_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "aporte")
      .gte("transaction_date", thirtyDaysAgo.toISOString().split("T")[0]);

    const monthlyContributions =
      recentTransactions?.reduce(
        (sum, t) => sum + convertFromCents(t.amount),
        0
      ) || 0;

    return {
      success: true,
      data: {
        total_invested: totalInvested,
        current_value: currentValue,
        total_return: totalReturn,
        return_percentage: returnPercentage,
        monthly_contributions: monthlyContributions,
        active_investments: activeInvestments.length,
      },
    };
  } catch (error) {
    logger.error("Erro ao obter resumo:", error as Error);
    return {
      success: false,
      error: "Erro ao obter resumo dos investimentos",
    };
  }
}

// Obter estatísticas por categoria
export async function getInvestmentCategoryStats(): Promise<
  BaseActionResult<InvestmentCategoryStats[]>
> {
  try {
    const investmentsResult = await getInvestments();
    if (!investmentsResult.success || !investmentsResult.data) {
      return {
        success: false,
        error: "Erro ao buscar investimentos",
      };
    }

    const investments = investmentsResult.data;
    const activeInvestments = investments.filter((inv) => inv.is_active);

    const categoryMap = new Map<
      string,
      {
        total_invested: number;
        current_value: number;
        count: number;
      }
    >();

    activeInvestments.forEach((inv) => {
      const existing = categoryMap.get(inv.category) || {
        total_invested: 0,
        current_value: 0,
        count: 0,
      };

      categoryMap.set(inv.category, {
        total_invested: existing.total_invested + inv.initial_amount,
        current_value: existing.current_value + inv.current_amount,
        count: existing.count + 1,
      });
    });

    const totalValue = activeInvestments.reduce(
      (sum, inv) => sum + inv.current_amount,
      0
    );

    const stats = Array.from(categoryMap.entries())
      .map(([category, stats]) => {
        const returnAmount = stats.current_value - stats.total_invested;
        const returnPercentage =
          stats.total_invested > 0
            ? (returnAmount / stats.total_invested) * 100
            : 0;

        return {
          category: category as any,
          total_amount: stats.current_value,
          percentage:
            totalValue > 0 ? (stats.current_value / totalValue) * 100 : 0,
          return_amount: returnAmount,
          return_percentage: returnPercentage,
        };
      })
      .sort((a, b) => b.total_amount - a.total_amount);

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    logger.error("Erro ao obter estatísticas por categoria:", error as Error);
    return {
      success: false,
      error: "Erro ao obter estatísticas por categoria",
    };
  }
}
