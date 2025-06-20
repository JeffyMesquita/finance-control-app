"use server";

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

    // Verificar se a conta tem saldo suficiente
    if (account.balance < amount) {
      return {
        success: false,
        error: `Saldo insuficiente na conta ${
          account.name
        }. Saldo disponível: R$ ${account.balance.toFixed(2)}`,
      };
    }
  }

  try {
    // Iniciar transação
    const { data: transaction, error: transactionError } = await supabase
      .from("savings_transactions")
      .insert({
        savings_box_id: boxId,
        amount: amount,
        type: "DEPOSIT",
        description: description || `Depósito no cofrinho ${savingsBox.name}`,
        source_account_id: accountId,
        user_id: user.id,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating deposit transaction:", transactionError);
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
        const newBalance = currentAccount.balance - amount;
        const { error: updateAccountError } = await supabase
          .from("financial_accounts")
          .update({ balance: newBalance })
          .eq("id", accountId)
          .eq("user_id", user.id);

        if (updateAccountError) {
          console.error("Error updating account balance:", updateAccountError);
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

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Error in deposit operation:", error);
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

  if (savingsBox.current_amount < amount) {
    return {
      success: false,
      error: `Saldo insuficiente no cofrinho. Saldo disponível: R$ ${savingsBox.current_amount.toFixed(
        2
      )}`,
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
        amount: amount,
        type: "WITHDRAW",
        description: description || `Saque do cofrinho ${savingsBox.name}`,
        source_account_id: accountId,
        user_id: user.id,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating withdraw transaction:", transactionError);
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
        const newBalance = currentAccount.balance + amount;
        const { error: updateAccountError } = await supabase
          .from("financial_accounts")
          .update({ balance: newBalance })
          .eq("id", accountId)
          .eq("user_id", user.id);

        if (updateAccountError) {
          console.error("Error updating account balance:", updateAccountError);
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

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Error in withdraw operation:", error);
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

  if (fromBox.current_amount < amount) {
    return {
      success: false,
      error: `Saldo insuficiente no cofrinho "${
        fromBox.name
      }". Saldo disponível: R$ ${fromBox.current_amount.toFixed(2)}`,
    };
  }

  try {
    // Criar transação de transferência
    const { data: transaction, error: transactionError } = await supabase
      .from("savings_transactions")
      .insert({
        savings_box_id: fromBoxId,
        amount: amount,
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
      console.error("Error creating transfer transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/cofrinhos");

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Error in transfer operation:", error);
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
    console.error("Error fetching savings transactions:", error);
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
    console.error("Error fetching user savings transactions:", error);
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

  let query = supabase
    .from("savings_transactions")
    .select("amount, type, created_at")
    .eq("user_id", user.id);

  if (boxId) {
    query = query.or(
      `savings_box_id.eq.${boxId},target_savings_box_id.eq.${boxId}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching savings transactions stats:", error);
    return {
      total_transactions: 0,
      total_deposits: 0,
      total_withdraws: 0,
      total_transfers: 0,
      deposits_amount: 0,
      withdraws_amount: 0,
      transfers_amount: 0,
    };
  }

  const totalTransactions = data.length;
  const deposits = data.filter((t) => t.type === "DEPOSIT");
  const withdraws = data.filter((t) => t.type === "WITHDRAW");
  const transfers = data.filter((t) => t.type === "TRANSFER");

  return {
    total_transactions: totalTransactions,
    total_deposits: deposits.length,
    total_withdraws: withdraws.length,
    total_transfers: transfers.length,
    deposits_amount: deposits.reduce((sum, t) => sum + t.amount, 0),
    withdraws_amount: withdraws.reduce((sum, t) => sum + t.amount, 0),
    transfers_amount: transfers.reduce((sum, t) => sum + t.amount, 0),
  };
}
