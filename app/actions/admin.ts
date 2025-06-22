"use server";

import { logger } from "@/lib/utils/logger";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Types para dados administrativos
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
    topReferrers: Array<{
      referrer_id: string;
      count: number;
      email?: string;
    }>;
  };
}

// Verificar se usuário é admin
async function verifyAdmin() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.id !== adminId) {
      throw new Error("Unauthorized: Admin access required");
    }

    return user;
  } catch (error) {
    throw error;
  }
}

// Buscar estatísticas gerais
export async function getAdminStats(): Promise<{
  success: boolean;
  data?: AdminStats;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const supabase = createServerComponentClient({ cookies });

    // Dates for filtering
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Users statistics
    const { data: users } = await supabase
      .from("users")
      .select("id, created_at");
    const totalUsers = users?.length || 0;
    const newThisMonth =
      users?.filter((u) => new Date(u.created_at) >= thisMonth).length || 0;
    const newThisWeek =
      users?.filter((u) => new Date(u.created_at) >= thisWeek).length || 0;

    // Active users (users with transactions this month)
    const { data: activeUsersData } = await supabase
      .from("transactions")
      .select("user_id")
      .gte("created_at", thisMonth.toISOString());

    const activeUsers = activeUsersData
      ? [...new Set(activeUsersData.map((t) => t.user_id))]
      : [];

    // Transactions statistics
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, type, created_at");

    const totalTransactions = transactions?.length || 0;
    const totalAmount =
      transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    const thisMonthTransactions =
      transactions?.filter((t) => new Date(t.created_at) >= thisMonth) || [];
    const thisMonthCount = thisMonthTransactions.length;
    const thisMonthAmount = thisMonthTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    const incomeTransactions =
      transactions?.filter((t) => t.type === "INCOME") || [];
    const expenseTransactions =
      transactions?.filter((t) => t.type === "EXPENSE") || [];

    // Goals statistics
    const { data: goals } = await supabase
      .from("financial_goals")
      .select("current_amount, target_amount, is_completed");

    const totalGoals = goals?.length || 0;
    const completedGoals = goals?.filter((g) => g.is_completed).length || 0;
    const inProgressGoals = totalGoals - completedGoals;
    const totalTargetAmount =
      goals?.reduce((sum, g) => sum + (g.target_amount || 0), 0) || 0;
    const totalCurrentAmount =
      goals?.reduce((sum, g) => sum + (g.current_amount || 0), 0) || 0;
    const averageProgress =
      totalGoals > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    // Savings boxes statistics
    const { data: savingsBoxes } = await supabase
      .from("savings_boxes")
      .select("current_amount, is_active");

    const totalBoxes = savingsBoxes?.length || 0;
    const activeBoxes = savingsBoxes?.filter((b) => b.is_active).length || 0;
    const totalSaved =
      savingsBoxes?.reduce((sum, b) => sum + (b.current_amount || 0), 0) || 0;
    const averageAmount = totalBoxes > 0 ? totalSaved / totalBoxes : 0;

    // Feedbacks statistics
    const { data: feedbacks } = await supabase
      .from("feedbacks")
      .select("type, status, priority, created_at");

    const totalFeedbacks = feedbacks?.length || 0;
    const feedbacksThisMonth =
      feedbacks?.filter((f) => new Date(f.created_at) >= thisMonth).length || 0;

    const feedbacksByType: Record<string, number> = {};
    const feedbacksByStatus: Record<string, number> = {};
    const feedbacksByPriority: Record<string, number> = {};

    feedbacks?.forEach((f) => {
      feedbacksByType[f.type] = (feedbacksByType[f.type] || 0) + 1;
      feedbacksByStatus[f.status] = (feedbacksByStatus[f.status] || 0) + 1;
      feedbacksByPriority[f.priority] =
        (feedbacksByPriority[f.priority] || 0) + 1;
    });

    // Referrals statistics
    const { data: invites } = await supabase.from("user_invites").select("*");
    const totalInvites = invites?.length || 0;
    const successfulReferrals =
      invites?.filter((i) => i.referred_id).length || 0;
    const conversionRate =
      totalInvites > 0 ? (successfulReferrals / totalInvites) * 100 : 0;

    // Top referrers
    const referrerCounts: Record<string, number> = {};
    invites?.forEach((invite) => {
      referrerCounts[invite.referrer_id] =
        (referrerCounts[invite.referrer_id] || 0) + 1;
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer_id, count]) => ({ referrer_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats: AdminStats = {
      users: {
        total: totalUsers,
        newThisMonth,
        newThisWeek,
        activeThisMonth: activeUsers.length,
      },
      transactions: {
        total: totalTransactions,
        totalAmount: totalAmount / 100, // Convert from cents
        thisMonth: thisMonthCount,
        thisMonthAmount: thisMonthAmount / 100,
        byType: {
          income: {
            count: incomeTransactions.length,
            amount:
              incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) /
              100,
          },
          expense: {
            count: expenseTransactions.length,
            amount:
              expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) /
              100,
          },
        },
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        averageProgress: Number(averageProgress.toFixed(1)),
        totalTargetAmount: totalTargetAmount / 100,
        totalCurrentAmount: totalCurrentAmount / 100,
      },
      savingsBoxes: {
        total: totalBoxes,
        totalSaved: totalSaved / 100,
        averageAmount: averageAmount / 100,
        activeBoxes,
      },
      feedbacks: {
        total: totalFeedbacks,
        thisMonth: feedbacksThisMonth,
        byType: feedbacksByType,
        byStatus: feedbacksByStatus,
        byPriority: feedbacksByPriority,
      },
      referrals: {
        totalInvites,
        successfulReferrals,
        conversionRate: Number(conversionRate.toFixed(1)),
        topReferrers,
      },
    };

    return { success: true, data: stats };
  } catch (error) {
    logger.error("Error fetching admin stats:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Buscar lista de usuários com detalhes
export async function getAdminUsers(page = 1, limit = 20) {
  try {
    await verifyAdmin();
    const supabase = createServerComponentClient({ cookies });

    const offset = (page - 1) * limit;

    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        full_name,
        created_at,
        avatar_url
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Para cada usuário, buscar estatísticas adicionais
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Transações detalhadas (usando mesma lógica do dashboard.ts)
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type, date, category_id")
          .eq("user_id", user.id);

        // Datas seguindo mesma lógica do dashboard.ts
        const now = new Date();

        // Calcular primeiro dia do próximo mês (para separar futuras)
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
          0,
          0,
          0,
          0
        ).toISOString();

        // Mês atual (primeiro ao último dia)
        const firstDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ).toISOString();

        // Separar transações seguindo lógica do dashboard
        const incomeTransactions =
          transactions?.filter((t) => t.type === "INCOME") || [];

        // Despesas passadas (até hoje)
        const pastExpenseTransactions =
          transactions?.filter(
            (t) => t.type === "EXPENSE" && t.date < nextMonth
          ) || [];

        // Despesas futuras (a partir do próximo mês)
        const futureExpenseTransactions =
          transactions?.filter(
            (t) => t.type === "EXPENSE" && t.date >= nextMonth
          ) || [];

        // Todas as despesas
        const allExpenseTransactions =
          transactions?.filter((t) => t.type === "EXPENSE") || [];

        // Calcular totais (seguindo dashboard.ts)
        const totalIncome = incomeTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        const totalPastExpenses = pastExpenseTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        const totalFutureExpenses = futureExpenseTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        const totalAllExpenses = allExpenseTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );

        // Saldo líquido real (receitas - despesas passadas, convertendo de centavos)
        const netBalance = (totalIncome - totalPastExpenses) / 100;

        // Transações deste mês (seguindo dashboard.ts)
        const thisMonthTransactions =
          transactions?.filter(
            (t) => t.date >= firstDayOfMonth && t.date <= lastDayOfMonth
          ) || [];

        const thisMonthIncome = thisMonthTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const thisMonthPastExpenses = thisMonthTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Despesas futuras deste mês (próximo mês)
        const nextMonthFirstDay = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1
        ).toISOString();
        const nextMonthLastDay = new Date(
          now.getFullYear(),
          now.getMonth() + 2,
          0,
          23,
          59,
          59,
          999
        ).toISOString();

        const thisMonthFutureExpenses =
          transactions
            ?.filter(
              (t) =>
                t.type === "EXPENSE" &&
                t.date >= nextMonthFirstDay &&
                t.date <= nextMonthLastDay
            )
            .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        // Frequência de transações (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

        const recentTransactions =
          transactions?.filter((t) => t.date >= thirtyDaysAgoIso) || [];

        // Metas detalhadas
        const { data: goals } = await supabase
          .from("financial_goals")
          .select("is_completed, current_amount, target_amount, created_at")
          .eq("user_id", user.id);

        const totalGoalTarget =
          (goals?.reduce((sum, g) => sum + (g.target_amount || 0), 0) || 0) /
          100;
        const totalGoalCurrent =
          (goals?.reduce((sum, g) => sum + (g.current_amount || 0), 0) || 0) /
          100;
        const goalProgress =
          totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

        // Cofrinhos detalhados
        const { data: savingsBoxes } = await supabase
          .from("savings_boxes")
          .select("current_amount, target_amount, is_active, created_at")
          .eq("user_id", user.id);

        const activeSavingsBoxes =
          savingsBoxes?.filter((b) => b.is_active) || [];
        const totalSavingsTarget =
          (savingsBoxes?.reduce((sum, b) => sum + (b.target_amount || 0), 0) ||
            0) / 100;

        // Feedbacks detalhados
        const { data: feedbacks } = await supabase
          .from("feedbacks")
          .select("id, type, status, created_at")
          .eq("user_id", user.id);

        // Calcular dias desde última atividade (considerando múltiplas ações)
        const activityDates = [];

        // Última transação
        if (transactions && transactions.length > 0) {
          const lastTransactionDate = Math.max(
            ...transactions.map((t) => new Date(t.date).getTime())
          );
          activityDates.push(lastTransactionDate);
        }

        // Última meta criada/atualizada
        if (goals && goals.length > 0) {
          const lastGoalDate = Math.max(
            ...goals.map((g) => new Date(g.created_at).getTime())
          );
          activityDates.push(lastGoalDate);
        }

        // Último cofrinho criado/atualizado
        if (savingsBoxes && savingsBoxes.length > 0) {
          const lastSavingsDate = Math.max(
            ...savingsBoxes.map((s) => new Date(s.created_at).getTime())
          );
          activityDates.push(lastSavingsDate);
        }

        // Último feedback enviado
        if (feedbacks && feedbacks.length > 0) {
          const lastFeedbackDate = Math.max(
            ...feedbacks.map((f) => new Date(f.created_at).getTime())
          );
          activityDates.push(lastFeedbackDate);
        }

        // Se não houver nenhuma atividade, usar data de criação da conta
        const lastActivityDate =
          activityDates.length > 0
            ? new Date(Math.max(...activityDates))
            : new Date(user.created_at);

        const daysSinceLastActivity = Math.floor(
          (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Categorizar usuário
        let userCategory = "NOVO";
        if (transactions && transactions.length > 50) userCategory = "EXPERT";
        else if (transactions && transactions.length > 20)
          userCategory = "AVANCADO";
        else if (transactions && transactions.length > 5)
          userCategory = "ATIVO";

        // Calcular categoria principal (onde mais gasta) - versão corrigida
        let mainCategory = { name: "Nenhuma", total: 0, count: 0 };
        if (allExpenseTransactions.length > 0) {
          // Agrupar despesas por categoria_id
          const categoryTotals: Record<
            string,
            { total: number; count: number }
          > = {};

          allExpenseTransactions.forEach((transaction) => {
            const categoryId = transaction.category_id || "sem_categoria";
            if (!categoryTotals[categoryId]) {
              categoryTotals[categoryId] = { total: 0, count: 0 };
            }
            categoryTotals[categoryId].total += transaction.amount || 0;
            categoryTotals[categoryId].count += 1;
          });

          // Encontrar categoria com maior valor total
          const topCategoryId = Object.entries(categoryTotals).sort(
            ([, a], [, b]) => b.total - a.total
          )[0];

          if (topCategoryId) {
            // Buscar nome da categoria
            const { data: categoryInfo } = await supabase
              .from("categories")
              .select("name")
              .eq("id", topCategoryId[0])
              .single();

            mainCategory = {
              name: categoryInfo?.name || "Categoria Desconhecida",
              total: topCategoryId[1].total / 100,
              count: topCategoryId[1].count,
            };
          }
        }

        return {
          ...user,
          stats: {
            // Transações gerais
            transactionsCount: transactions?.length || 0,
            totalTransactionAmount: (totalIncome + totalAllExpenses) / 100,

            // Receitas e despesas (convertendo de centavos)
            income: {
              count: incomeTransactions.length,
              total: totalIncome / 100,
              thisMonth: thisMonthIncome / 100,
              average:
                incomeTransactions.length > 0
                  ? totalIncome / incomeTransactions.length / 100
                  : 0,
            },
            expenses: {
              count: pastExpenseTransactions.length,
              total: totalPastExpenses / 100,
              thisMonth: thisMonthPastExpenses / 100,
              average:
                pastExpenseTransactions.length > 0
                  ? totalPastExpenses / pastExpenseTransactions.length / 100
                  : 0,
            },
            futureExpenses: {
              count: futureExpenseTransactions.length,
              total: totalFutureExpenses / 100,
              thisMonth: thisMonthFutureExpenses / 100,
              average:
                futureExpenseTransactions.length > 0
                  ? totalFutureExpenses / futureExpenseTransactions.length / 100
                  : 0,
            },

            // Balanço e performance
            netBalance,
            thisMonthNet: (thisMonthIncome - thisMonthPastExpenses) / 100,
            thisMonthBalance: (thisMonthIncome - thisMonthPastExpenses) / 100,
            recentActivityCount: recentTransactions.length,
            daysSinceLastActivity,

            // Metas
            goalsCount: goals?.length || 0,
            completedGoals: goals?.filter((g) => g.is_completed).length || 0,
            goalProgress: Math.round(goalProgress),
            totalGoalTarget,
            totalGoalCurrent,

            // Cofrinhos
            savingsBoxesCount: savingsBoxes?.length || 0,
            activeSavingsBoxes: activeSavingsBoxes.length,
            totalSaved:
              (savingsBoxes?.reduce(
                (sum, b) => sum + (b.current_amount || 0),
                0
              ) || 0) / 100,
            totalSavingsTarget,

            // Engajamento
            feedbacksCount: feedbacks?.length || 0,
            userCategory,
            mainCategory,

            // Datas importantes
            accountAge: Math.floor(
              (Date.now() - new Date(user.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          },
        };
      })
    );

    // Total count for pagination
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    return {
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
    };
  } catch (error) {
    logger.error("Error fetching admin users:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Buscar feedbacks para administração
export async function getAdminFeedbacks(filters?: {
  type?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await verifyAdmin();

    // Usar service role para contornar RLS temporariamente
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const {
      data: feedbacks,
      error,
      status,
      statusText,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Buscar dados dos usuários separadamente se houver feedbacks
    if (feedbacks && feedbacks.length > 0) {
      const userIds = feedbacks
        .map((f) => f.user_id)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index); // unique

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, email, full_name")
          .in("id", userIds);

        // Merge user data with feedbacks
        feedbacks.forEach((feedback) => {
          if (feedback.user_id) {
            const user = users?.find((u) => u.id === feedback.user_id);
            if (user) {
              feedback.user = user;
            }
          }
        });
      }
    }

    // Total count for pagination
    let countQuery = supabase
      .from("feedbacks")
      .select("*", { count: "exact", head: true });

    if (filters?.type) countQuery = countQuery.eq("type", filters.type);
    if (filters?.status) countQuery = countQuery.eq("status", filters.status);
    if (filters?.priority)
      countQuery = countQuery.eq("priority", filters.priority);

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    const result = {
      success: true,
      data: {
        feedbacks,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
    };

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Atualizar status de feedback
export async function updateFeedbackStatus(
  feedbackId: string,
  updates: {
    status?: string;
    priority?: string;
    admin_notes?: string;
    resolved_at?: string;
  }
) {
  try {
    await verifyAdmin();
    const supabase = createServerComponentClient({ cookies });

    const { data, error } = await supabase
      .from("feedbacks")
      .update(updates)
      .eq("id", feedbackId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    logger.error("Error updating feedback:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Buscar analytics de uso (páginas mais visitadas, etc.)
export async function getUsageAnalytics() {
  try {
    await verifyAdmin();

    // Por enquanto, retornar dados mockados
    // Em produção, você integraria com Google Analytics ou similar
    return {
      success: true,
      data: {
        pageViews: {
          "/dashboard": 1250,
          "/dashboard/transactions": 890,
          "/dashboard/goals": 650,
          "/dashboard/cofrinhos": 420,
          "/dashboard/reports": 380,
        },
        deviceTypes: {
          desktop: 65,
          mobile: 30,
          tablet: 5,
        },
        browsers: {
          chrome: 70,
          firefox: 15,
          safari: 10,
          edge: 5,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Buscar dados detalhados do sistema de referências
export async function getReferralsData() {
  try {
    await verifyAdmin();
    const supabase = createServerComponentClient({ cookies });

    // Buscar todos os convites
    const { data: invites } = await supabase
      .from("user_invites")
      .select(
        `
        *,
        referrer:users!user_invites_referrer_id_fkey(email, full_name),
        referred:users!user_invites_referred_id_fkey(email, full_name)
      `
      )
      .order("created_at", { ascending: false });

    const totalInvites = invites?.length || 0;
    const successfulReferrals =
      invites?.filter((i) => i.referred_id).length || 0;
    const pendingInvites = invites?.filter((i) => !i.referred_id).length || 0;
    const conversionRate =
      totalInvites > 0 ? (successfulReferrals / totalInvites) * 100 : 0;

    // Top referenciadores com dados reais
    const referrerCounts: Record<
      string,
      { count: number; email: string; name?: string }
    > = {};
    invites?.forEach((invite) => {
      const referrerId = invite.referrer_id;
      if (!referrerCounts[referrerId]) {
        const referrerData = invite.referrer as any;
        referrerCounts[referrerId] = {
          count: 0,
          email: referrerData?.email || "Email desconhecido",
          name: referrerData?.full_name || undefined,
        };
      }
      referrerCounts[referrerId].count++;
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer_id, data]) => ({
        referrer_id,
        count: data.count,
        email: data.email,
        name: data.name,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Timeline dos últimos 30 dias
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentInvites =
      invites?.filter(
        (invite) => new Date(invite.created_at) >= thirtyDaysAgo
      ) || [];

    // Agrupar por data
    const timelineData: Record<
      string,
      { invites: number; conversions: number }
    > = {};
    recentInvites.forEach((invite) => {
      const date = new Date(invite.created_at).toLocaleDateString("pt-BR");
      if (!timelineData[date]) {
        timelineData[date] = { invites: 0, conversions: 0 };
      }
      timelineData[date].invites++;
      if (invite.referred_id) {
        timelineData[date].conversions++;
      }
    });

    // Últimos 7 dias para timeline
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toLocaleDateString("pt-BR");
      const dateLabel =
        i === 0 ? "Hoje" : i === 1 ? "Ontem" : `${i} dias atrás`;

      timeline.push({
        date: dateLabel,
        invites: timelineData[dateKey]?.invites || 0,
        conversions: timelineData[dateKey]?.conversions || 0,
      });
    }

    // Sistema de badges baseado em dados reais
    const badges = {
      gold: topReferrers.filter((r) => r.count >= 10).length,
      silver: topReferrers.filter((r) => r.count >= 5 && r.count < 10).length,
      bronze: topReferrers.filter((r) => r.count >= 2 && r.count < 5).length,
      starter: topReferrers.filter((r) => r.count === 1).length,
    };

    return {
      success: true,
      data: {
        stats: {
          totalInvites,
          successfulReferrals,
          pendingInvites,
          conversionRate: Number(conversionRate.toFixed(1)),
        },
        topReferrers,
        timeline,
        badges,
        recentInvites: invites?.slice(0, 10) || [], // Últimos 10 convites
      },
    };
  } catch (error) {
    logger.error("Error fetching referrals data:", error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


