"use server";

import { logger } from "@/lib/utils/logger";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { InsertTables } from "@/lib/supabase/database.types";

export async function depositToSavingsBox(
  boxId: string,
  amount: number,
  accountId?: string,
  description?: string
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Validações básicas
  if (!boxId) {
    return { success: false, error: "ID do cofrinho é obrigatório" };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      error: "Valor do depósito deve ser maior que zero",
    };
  }

  // Converter valor de reais para centavos
  const amountInCents = Math.round(amount * 100);

  // Verificar se o cofrinho existe e pertence ao usuário
  const { data: savingsBox, error: boxError } = await supabase
    .from("savings_boxes")
    .select("id, name, is_active")
    .eq("id", boxId)
    .eq("user_id", user.id)
    .single();

  if (boxError || !savingsBox) {
    return { success: false, error: "Cofrinho não encontrado" };
  }

  if (!savingsBox.is_active) {
    return { success: false, error: "Cofrinho está inativo" };
  }

  // Verificar se a conta existe (se fornecida)
  if (accountId) {
    const { data: account, error: accountError } = await supabase
      .from("financial_accounts")
      .select("id, name, balance")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return { success: false, error: "Conta não encontrada" };
    }

    // Verificar se a conta tem saldo suficiente (account.balance já está em centavos)
    if (account.balance < amountInCents) {
      return {
        success: false,
        error: `Saldo insuficiente na conta ${
          account.name
        }. Saldo disponível: R$ ${(account.balance / 100).toFixed(2)}`,
      };
    }
  }

  try {
    // Iniciar transação
    const { data: transaction, error: transactionError } = await supabase
      .from("savings_transactions")
      .insert({
        savings_box_id: boxId,
        amount: amountInCents,
        type: "DEPOSIT",
        description: description || `Depósito no cofrinho ${savingsBox.name}`,
        source_account_id: accountId,
        user_id: user.id,
      })
      .select()
      .single();

    if (transactionError) {
      logger.error("Error creating deposit transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    // Se foi informada uma conta, debitar o valor dela
    if (accountId) {
      // Buscar saldo atual da conta
      const { data: currentAccount } = await supabase
        .from("financial_accounts")
        .select("balance")
        .eq("id", accountId)
        .eq("user_id", user.id)
        .single();

      if (currentAccount) {
        const newBalance = currentAccount.balance - amountInCents;
        const { error: updateAccountError } = await supabase
          .from("financial_accounts")
          .update({ balance: newBalance })
          .eq("id", accountId)
          .eq("user_id", user.id);

        if (updateAccountError) {
          logger.error("Error updating account balance:", updateAccountError);
          // Reverter a transação do cofrinho se houver erro
          await supabase
            .from("savings_transactions")
            .delete()
            .eq("id", transaction.id);

          return { success: false, error: "Erro ao atualizar saldo da conta" };
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/cofrinhos");

    // Sincronizar metas vinculadas ao cofrinho
    await syncGoalWithSavingsBox(boxId);

    return { success: true, data: transaction };
  } catch (error) {
    logger.error("Error in deposit operation:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function withdrawFromSavingsBox(
  boxId: string,
  amount: number,
  accountId?: string,
  description?: string
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Validações básicas
  if (!boxId) {
    return { success: false, error: "ID do cofrinho é obrigatório" };
  }

  if (!amount || amount <= 0) {
    return { success: false, error: "Valor do saque deve ser maior que zero" };
  }

  // Converter valor de reais para centavos
  const amountInCents = Math.round(amount * 100);

  // Verificar se o cofrinho existe e tem saldo suficiente
  const { data: savingsBox, error: boxError } = await supabase
    .from("savings_boxes")
    .select("id, name, current_amount, is_active")
    .eq("id", boxId)
    .eq("user_id", user.id)
    .single();

  if (boxError || !savingsBox) {
    return { success: false, error: "Cofrinho não encontrado" };
  }

  if (!savingsBox.is_active) {
    return { success: false, error: "Cofrinho está inativo" };
  }

  if (savingsBox.current_amount < amountInCents) {
    return {
      success: false,
      error: `Saldo insuficiente no cofrinho. Saldo disponível: R$ ${(
        savingsBox.current_amount / 100
      ).toFixed(2)}`,
    };
  }

  // Verificar se a conta existe (se fornecida)
  if (accountId) {
    const { data: account, error: accountError } = await supabase
      .from("financial_accounts")
      .select("id, name")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return { success: false, error: "Conta de destino não encontrada" };
    }
  }

  try {
    // Criar transação de saque
    const { data: transaction, error: transactionError } = await supabase
      .from("savings_transactions")
      .insert({
        savings_box_id: boxId,
        amount: amountInCents,
        type: "WITHDRAW",
        description: description || `Saque do cofrinho ${savingsBox.name}`,
        source_account_id: accountId,
        user_id: user.id,
      })
      .select()
      .single();

    if (transactionError) {
      logger.error("Error creating withdraw transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    // Se foi informada uma conta, creditar o valor nela
    if (accountId) {
      // Buscar saldo atual da conta
      const { data: currentAccount } = await supabase
        .from("financial_accounts")
        .select("balance")
        .eq("id", accountId)
        .eq("user_id", user.id)
        .single();

      if (currentAccount) {
        const newBalance = currentAccount.balance + amountInCents;
        const { error: updateAccountError } = await supabase
          .from("financial_accounts")
          .update({ balance: newBalance })
          .eq("id", accountId)
          .eq("user_id", user.id);

        if (updateAccountError) {
          logger.error("Error updating account balance:", updateAccountError);
          // Reverter a transação do cofrinho se houver erro
          await supabase
            .from("savings_transactions")
            .delete()
            .eq("id", transaction.id);

          return { success: false, error: "Erro ao atualizar saldo da conta" };
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/cofrinhos");

    // Sincronizar metas vinculadas ao cofrinho
    await syncGoalWithSavingsBox(boxId);

    return { success: true, data: transaction };
  } catch (error) {
    logger.error("Error in withdraw operation:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function transferBetweenBoxes(
  fromBoxId: string,
  toBoxId: string,
  amount: number,
  description?: string
) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Validações básicas
  if (!fromBoxId || !toBoxId) {
    return { success: false, error: "IDs dos cofrinhos são obrigatórios" };
  }

  if (fromBoxId === toBoxId) {
    return {
      success: false,
      error: "Não é possível transferir para o mesmo cofrinho",
    };
  }

  if (!amount || amount <= 0) {
    return {
      success: false,
      error: "Valor da transferência deve ser maior que zero",
    };
  }

  // Converter valor de reais para centavos
  const amountInCents = Math.round(amount * 100);

  // Verificar se ambos os cofrinhos existem e pertencem ao usuário
  const { data: boxes, error: boxesError } = await supabase
    .from("savings_boxes")
    .select("id, name, current_amount, is_active")
    .in("id", [fromBoxId, toBoxId])
    .eq("user_id", user.id);

  if (boxesError || !boxes || boxes.length !== 2) {
    return {
      success: false,
      error: "Um ou ambos os cofrinhos não foram encontrados",
    };
  }

  const fromBox = boxes.find((box) => box.id === fromBoxId);
  const toBox = boxes.find((box) => box.id === toBoxId);

  if (!fromBox || !toBox) {
    return { success: false, error: "Erro ao identificar os cofrinhos" };
  }

  if (!fromBox.is_active || !toBox.is_active) {
    return { success: false, error: "Um dos cofrinhos está inativo" };
  }

  if (fromBox.current_amount < amountInCents) {
    return {
      success: false,
      error: `Saldo insuficiente no cofrinho "${
        fromBox.name
      }". Saldo disponível: R$ ${(fromBox.current_amount / 100).toFixed(2)}`,
    };
  }

  try {
    // Criar transação de transferência
    const { data: transaction, error: transactionError } = await supabase
      .from("savings_transactions")
      .insert({
        savings_box_id: fromBoxId,
        amount: amountInCents,
        type: "TRANSFER",
        description:
          description ||
          `Transferência de "${fromBox.name}" para "${toBox.name}"`,
        target_savings_box_id: toBoxId,
        user_id: user.id,
      })
      .select()
      .single();

    if (transactionError) {
      logger.error("Error creating transfer transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/cofrinhos");

    // Sincronizar metas vinculadas aos cofrinhos (origem e destino)
    await Promise.all([
      syncGoalWithSavingsBox(fromBoxId),
      syncGoalWithSavingsBox(toBoxId),
    ]);

    return { success: true, data: transaction };
  } catch (error) {
    logger.error("Error in transfer operation:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function getSavingsTransactions(boxId?: string, limit?: number) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let query = supabase
    .from("savings_transactions")
    .select(
      `
      *,
      savings_box:savings_boxes!savings_box_id(
        id,
        name,
        color,
        icon
      ),
      target_box:savings_boxes!target_savings_box_id(
        id,
        name,
        color,
        icon
      ),
      source_account:financial_accounts!source_account_id(
        id,
        name,
        type
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (boxId) {
    query = query.or(
      `savings_box_id.eq.${boxId},target_savings_box_id.eq.${boxId}`
    );
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching savings transactions:", error);
    return [];
  }

  return data;
}

export async function getSavingsTransactionsByUser(limit?: number) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  let query = supabase
    .from("savings_transactions")
    .select(
      `
      *,
      savings_box:savings_boxes!savings_box_id(
        id,
        name,
        color,
        icon
      ),
      target_box:savings_boxes!target_savings_box_id(
        id,
        name,
        color,
        icon
      ),
      source_account:financial_accounts!source_account_id(
        id,
        name,
        type
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching user savings transactions:", error);
    return [];
  }

  return data;
}

export async function deleteSavingsTransaction(transactionId: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Verificar se a transação existe e pertence ao usuário
  const { data: transaction, error: fetchError } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !transaction) {
    return { success: false, error: "Transação não encontrada" };
  }

  // Note: Excluir transações é uma operação delicada porque afeta os saldos
  // Em um sistema real, seria melhor apenas marcar como cancelada
  return {
    success: false,
    error:
      "Exclusão de transações não é permitida. Entre em contato com o suporte se necessário.",
  };
}

// Função para obter estatísticas de movimentação
export async function getSavingsTransactionsStats(boxId?: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    let query = supabase
      .from("savings_transactions")
      .select("amount, type, created_at")
      .eq("user_id", user.id);

    if (boxId) {
      query = query.or(
        `savings_box_id.eq.${boxId},target_savings_box_id.eq.${boxId}`
      );
    }

    const { data: transactions, error } = await query;

    if (error) {
      logger.error("Error fetching savings transactions stats:", error);
      return null;
    }

    const stats = {
      total_transactions: transactions.length,
      total_deposits: transactions.filter((t) => t.type === "DEPOSIT").length,
      total_withdraws: transactions.filter((t) => t.type === "WITHDRAW").length,
      total_transfers: transactions.filter((t) => t.type === "TRANSFER").length,
      total_deposited: transactions
        .filter((t) => t.type === "DEPOSIT")
        .reduce((sum, t) => sum + t.amount, 0),
      total_withdrawn: transactions
        .filter((t) => t.type === "WITHDRAW")
        .reduce((sum, t) => sum + t.amount, 0),
      total_transferred: transactions
        .filter((t) => t.type === "TRANSFER")
        .reduce((sum, t) => sum + t.amount, 0),
    };

    return stats;
  } catch (error) {
    logger.error("Error calculating savings transactions stats:", error);
    return null;
  }
}

// Função para sincronizar o valor da meta com o cofrinho
export async function syncGoalWithSavingsBox(savingsBoxId: string) {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    // Buscar o cofrinho atual
    const { data: savingsBox, error: boxError } = await supabase
      .from("savings_boxes")
      .select("id, current_amount")
      .eq("id", savingsBoxId)
      .eq("user_id", user.id)
      .single();

    if (boxError || !savingsBox) {
      logger.error("Savings box not found:", boxError);
      return { success: false, error: "Cofrinho não encontrado" };
    }

    // Buscar metas vinculadas a este cofrinho
    const { data: goals, error: goalsError } = await supabase
      .from("financial_goals")
      .select("id, current_amount")
      .eq("savings_box_id", savingsBoxId)
      .eq("user_id", user.id);

    if (goalsError) {
      logger.error("Error fetching linked goals:", goalsError);
      return { success: false, error: "Erro ao buscar metas vinculadas" };
    }

    if (!goals || goals.length === 0) {
      // Não há metas vinculadas, isso é normal
      return { success: true, message: "Nenhuma meta vinculada encontrada" };
    }

    // Atualizar cada meta vinculada com o valor atual do cofrinho
    const updatePromises = goals.map(async (goal) => {
      if (goal.current_amount !== savingsBox.current_amount) {
        const { error: updateError } = await supabase
          .from("financial_goals")
          .update({ current_amount: savingsBox.current_amount })
          .eq("id", goal.id)
          .eq("user_id", user.id);

        if (updateError) {
          logger.error(`Error updating goal ${goal.id}:`, {
            data: updateError,
          });
          return {
            success: false,
            goalId: goal.id,
            error: updateError.message,
          };
        }
        return { success: true, goalId: goal.id };
      }
      return { success: true, goalId: goal.id, skipped: true };
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    logger.info(
      `Sync completed: ${successful.length} successful, ${failed.length} failed`
    );

    // Revalidar páginas relacionadas
    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard");

    return {
      success: true,
      synchronized: successful.length,
      failed: failed.length,
      details: results,
    };
  } catch (error) {
    logger.error("Error syncing goal with savings box:", error);
    return { success: false, error: "Erro interno ao sincronizar" };
  }
}
