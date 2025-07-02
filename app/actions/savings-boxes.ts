"use server";

import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  SavingsBoxData,
  CreateSavingsBoxData,
  UpdateSavingsBoxData,
  BaseActionResult,
} from "@/lib/types/actions";

export async function getSavingsBoxes(): Promise<
  BaseActionResult<SavingsBoxData[]>
> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    // Primeiro, tentar a query completa com relacionamentos específicos
    const { data, error } = await supabase
      .from("savings_boxes")
      .select(
        `
        *,
        savings_transactions!savings_transactions_savings_box_id_fkey(
          id,
          amount,
          type,
          description,
          created_at
        )
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching savings boxes with transactions:",
        error as Error
      );

      // Fallback: buscar sem relacionamentos se houver erro
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("savings_boxes")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fallbackError) {
        logger.error("Error fetching savings boxes (fallback):", fallbackError);
        return {
          success: false,
          error: fallbackError.message,
        };
      }

      // Adicionar array vazio de transações para manter compatibilidade
      const dataWithEmptyTransactions = fallbackData.map((box) => ({
        ...box,
        savings_transactions: [],
      }));

      logger.info(
        "✅ Fallback successful, returning data without transactions"
      );
      return {
        success: true,
        data: dataWithEmptyTransactions as SavingsBoxData[],
      };
    }

    logger.info("✅ Successfully fetched savings boxes with transactions");
    return {
      success: true,
      data: data as unknown as SavingsBoxData[],
    };
  } catch (err) {
    logger.error("Unexpected error in getSavingsBoxes:", err as Error);
    return {
      success: false,
      error: "Erro inesperado ao buscar cofrinhos",
    };
  }
}

export async function getSavingsBoxById(
  id: string
): Promise<BaseActionResult<SavingsBoxData>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("savings_boxes")
    .select(
      `
      *,
      savings_transactions!savings_transactions_savings_box_id_fkey(
        id,
        amount,
        type,
        description,
        source_account_id,
        target_savings_box_id,
        created_at
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    logger.error("Error fetching savings box:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as unknown as SavingsBoxData,
  };
}

export async function createSavingsBox(
  savingsBox: CreateSavingsBoxData
): Promise<BaseActionResult<SavingsBoxData>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Validações básicas
  if (!savingsBox.name || savingsBox.name.trim() === "") {
    return {
      success: false,
      error: "Nome do cofrinho é obrigatório",
    };
  }

  if (savingsBox.target_amount && savingsBox.target_amount <= 0) {
    return {
      success: false,
      error: "Meta deve ser maior que zero",
    };
  }

  // Converter valores de reais para centavos
  const savingsBoxData = {
    name: savingsBox.name,
    description: savingsBox.description || null,
    current_amount: savingsBox.current_amount
      ? Math.round(savingsBox.current_amount * 100)
      : 0,
    target_amount: savingsBox.target_amount
      ? Math.round(savingsBox.target_amount * 100)
      : null,
    color: savingsBox.color || "#3B82F6",
    icon: savingsBox.icon || "piggy-bank",
    is_active: savingsBox.is_active !== false,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("savings_boxes")
    .insert(savingsBoxData)
    .select()
    .single();

  if (error) {
    logger.error("Error creating savings box:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cofrinhos");

  return {
    success: true,
    data: data as SavingsBoxData,
  };
}

export async function updateSavingsBox(
  id: string,
  savingsBox: UpdateSavingsBoxData
): Promise<BaseActionResult<SavingsBoxData>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Validações básicas
  if (
    savingsBox.name !== undefined &&
    (!savingsBox.name || savingsBox.name.trim() === "")
  ) {
    return {
      success: false,
      error: "Nome do cofrinho é obrigatório",
    };
  }

  if (
    savingsBox.target_amount !== undefined &&
    savingsBox.target_amount !== null &&
    savingsBox.target_amount <= 0
  ) {
    return {
      success: false,
      error: "Meta deve ser maior que zero",
    };
  }

  // Converter valores de reais para centavos se estiverem presentes
  const updateData: any = { ...savingsBox };
  if (updateData.current_amount !== undefined) {
    updateData.current_amount = updateData.current_amount
      ? Math.round(updateData.current_amount * 100)
      : 0;
  }
  if (
    updateData.target_amount !== undefined &&
    updateData.target_amount !== null
  ) {
    updateData.target_amount = Math.round(updateData.target_amount * 100);
  }

  const { data, error } = await supabase
    .from("savings_boxes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    logger.error("Error updating savings box:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cofrinhos");

  return {
    success: true,
    data: data as SavingsBoxData,
  };
}

export async function deleteSavingsBox(
  id: string
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Verificar se o cofrinho tem saldo
  const { data: savingsBox } = await supabase
    .from("savings_boxes")
    .select("current_amount, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (savingsBox && (savingsBox.current_amount || 0) > 0) {
    return {
      success: false,
      error: `Não é possível excluir o cofrinho "${savingsBox.name}" porque ele possui saldo. Saque todo o dinheiro antes de excluir.`,
    };
  }

  // Verificar se o cofrinho está vinculado a alguma meta
  const { data: linkedGoals } = await supabase
    .from("financial_goals")
    .select("id, name")
    .eq("savings_box_id", id)
    .eq("user_id", user.id);

  if (linkedGoals && linkedGoals.length > 0) {
    return {
      success: false,
      error: `Não é possível excluir o cofrinho porque ele está vinculado à(s) meta(s): ${linkedGoals
        .map((g) => g.name)
        .join(", ")}. Desvincule primeiro.`,
    };
  }

  // Soft delete: marcar como inativo ao invés de excluir
  const { error } = await supabase
    .from("savings_boxes")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting savings box:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cofrinhos");

  return {
    success: true,
  };
}

export async function getSavingsBoxesTotal(): Promise<number> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("savings_boxes")
    .select("current_amount")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) {
    logger.error("Error fetching savings boxes total:", error as Error);
    return 0;
  }

  const total = data.reduce((sum, box) => sum + (box.current_amount || 0), 0);
  return total;
}

export async function getSavingsBoxesSummary(): Promise<
  BaseActionResult<any[]>
> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("savings_boxes")
    .select(
      `
      id,
      name,
      current_amount,
      target_amount,
      color,
      icon,
      financial_goals!savings_box_id(
        id,
        name,
        target_amount,
        current_amount
      )
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("current_amount", { ascending: false })
    .limit(5);

  if (error) {
    logger.error("Error fetching savings boxes summary:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  // Calcular progresso e status de vinculação
  const summary = data.map((box) => ({
    id: box.id,
    name: box.name,
    current_amount: box.current_amount || 0,
    target_amount: box.target_amount,
    color: box.color || "#3B82F6",
    icon: box.icon || "piggy-bank",
    progress_percentage: box.target_amount
      ? Math.min(
          Math.round(((box.current_amount || 0) / box.target_amount) * 100),
          100
        )
      : 0,
    is_goal_linked: box.financial_goals && box.financial_goals.length > 0,
    linked_goal:
      box.financial_goals && box.financial_goals.length > 0
        ? box.financial_goals[0]
        : null,
  }));

  return {
    success: true,
    data: summary,
  };
}

export async function getSavingsBoxesStats(): Promise<BaseActionResult<any>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: boxes, error } = await supabase
    .from("savings_boxes")
    .select(
      `
      id,
      current_amount,
      target_amount,
      financial_goals!savings_box_id(id)
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) {
    logger.error("Error fetching savings boxes stats:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  const totalBoxes = boxes.length;
  const totalAmount = boxes.reduce(
    (sum, box) => sum + (box.current_amount || 0),
    0
  );
  const totalWithGoals = boxes.filter(
    (box) => box.financial_goals && box.financial_goals.length > 0
  ).length;
  const completedGoals = boxes.filter(
    (box) => box.target_amount && (box.current_amount || 0) >= box.target_amount
  ).length;

  const boxesWithTargets = boxes.filter((box) => box.target_amount);
  const averageCompletion =
    boxesWithTargets.length > 0
      ? boxesWithTargets.reduce((sum, box) => {
          const completion = box.target_amount
            ? Math.min(
                ((box.current_amount || 0) / box.target_amount) * 100,
                100
              )
            : 0;
          return sum + completion;
        }, 0) / boxesWithTargets.length
      : 0;

  return {
    success: true,
    data: {
      total_boxes: totalBoxes,
      total_amount: totalAmount,
      total_with_goals: totalWithGoals,
      total_completed_goals: completedGoals,
      average_completion: Math.round(averageCompletion),
    },
  };
}

// Função para restaurar um cofrinho excluído (soft delete)
export async function restoreSavingsBox(
  id: string
): Promise<BaseActionResult<SavingsBoxData>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("savings_boxes")
    .update({ is_active: true })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    logger.error("Error restoring savings box:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cofrinhos");

  return {
    success: true,
    data: data as SavingsBoxData,
  };
}
