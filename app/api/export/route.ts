import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type {
  TransactionData,
  AccountData,
  CategoryData,
  GoalData,
} from "@/lib/types/actions";

export async function POST(request: NextRequest) {
  try {
    const {
      type,
      dateFrom,
      dateTo,
      transactionType,
      categoryId,
      accountId,
      year,
    } = await request.json();

    const supabase = createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let data: any[] = [];
    let error: string | null = null;

    switch (type) {
      case "transactions":
        let query = supabase
          .from("transactions")
          .select(
            `
            id,
            amount,
            description,
            date,
            type,
            notes,
            is_recurring,
            category:categories(id, name),
            account:financial_accounts(id, name, type)
          `
          )
          .eq("user_id", user.id);

        // Apply filters
        if (dateFrom) {
          query = query.gte("date", dateFrom);
        }
        if (dateTo) {
          query = query.lte("date", dateTo);
        }
        if (
          transactionType &&
          (transactionType === "INCOME" || transactionType === "EXPENSE")
        ) {
          query = query.eq("type", transactionType);
        }
        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }
        if (accountId) {
          query = query.eq("account_id", accountId);
        }

        // Order by date
        query = query.order("date", { ascending: false });

        const { data: transactionsData, error: transactionsError } =
          await query;

        if (transactionsError) {
          logger.error(
            "Error fetching transactions for export:",
            transactionsError as Error
          );
          error = transactionsError.message;
        } else {
          data = transactionsData as TransactionData[];
        }
        break;

      case "accounts":
        const { data: accountsData, error: accountsError } = await supabase
          .from("financial_accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (accountsError) {
          logger.error(
            "Error fetching accounts for export:",
            accountsError as Error
          );
          error = accountsError.message;
        } else {
          data = accountsData as AccountData[];
        }
        break;

      case "categories":
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (categoriesError) {
          logger.error(
            "Error fetching categories for export:",
            categoriesError as Error
          );
          error = categoriesError.message;
        } else {
          data = categoriesData as CategoryData[];
        }
        break;

      case "goals":
        const { data: goalsData, error: goalsError } = await supabase
          .from("financial_goals")
          .select(
            `
            *,
            category:categories(id, name),
            account:financial_accounts(id, name)
          `
          )
          .eq("user_id", user.id)
          .order("target_date");

        if (goalsError) {
          logger.error("Error fetching goals for export:", goalsError as Error);
          error = goalsError.message;
        } else {
          data = goalsData as GoalData[];
        }
        break;

      case "monthly_summary":
        const currentYear = year || new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString();
        const endDate = new Date(currentYear, 11, 31).toISOString();

        const { data: summaryData, error: summaryError } = await supabase
          .from("transactions")
          .select("amount, type, date")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate);

        if (summaryError) {
          logger.error(
            "Error fetching monthly summary for export:",
            summaryError as Error
          );
          error = summaryError.message;
        } else {
          // Group by month
          const monthlyData = Array(12)
            .fill(0)
            .map((_, index) => {
              return {
                month: new Date(currentYear, index, 1).toLocaleString(
                  "default",
                  {
                    month: "long",
                  }
                ),
                income: 0,
                expenses: 0,
                savings: 0,
              };
            });

          summaryData.forEach((transaction) => {
            const date = new Date(transaction.date);
            const month = date.getMonth();

            if (transaction.type === "INCOME") {
              monthlyData[month].income += transaction.amount || 0;
            } else {
              monthlyData[month].expenses += transaction.amount || 0;
            }
          });

          // Calculate savings
          monthlyData.forEach((month) => {
            month.savings = month.income - month.expenses;
          });

          data = monthlyData;
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid export type" },
          { status: 400 }
        );
    }

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Error in export route:", error as Error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
