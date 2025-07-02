import { logger } from "@/lib/utils/logger";
import { createActionClient } from "@/lib/supabase/server";
import type { ExpenseBreakdownItem } from "@/lib/types/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month =
      (searchParams.get("month") as "current" | "previous") || "current";

    const supabase = createActionClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current month's expenses by category
    const now = new Date();
    const monthOffset = month === "previous" ? -1 : 0;

    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    ).toISOString();
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset + 1,
      0
    ).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        amount,
        category:categories(id, name, color)
      `
      )
      .eq("user_id", user.id)
      .eq("type", "EXPENSE")
      .gte("date", firstDayOfMonth)
      .lte("date", lastDayOfMonth);

    if (error) {
      logger.error("Error fetching expense breakdown:", error as Error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao carregar dados de despesas por categoria",
        },
        { status: 500 }
      );
    }

    // Group by category
    const categoryMap = new Map<string, ExpenseBreakdownItem>();

    // Definir interface local para tipagem
    interface TransactionWithCategory {
      amount: number;
      category: {
        id: string;
        name: string;
        color: string | null;
      } | null;
    }

    const typedData = data as unknown as TransactionWithCategory[];

    typedData.forEach((transaction: TransactionWithCategory) => {
      if (!transaction.category) return;

      const categoryId = transaction.category.id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: transaction.category.name,
          color: transaction.category.color || "#64748b",
          value: 0,
        });
      }

      const existingCategory = categoryMap.get(categoryId)!;
      existingCategory.value += transaction.amount;
    });

    return NextResponse.json({
      success: true,
      data: Array.from(categoryMap.values()),
    });
  } catch (error) {
    logger.error("Error in expense breakdown API:", error as Error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar despesas por categoria" },
      { status: 500 }
    );
  }
}
