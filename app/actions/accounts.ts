"use server";

import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  AccountData,
  CreateAccountData,
  UpdateAccountData,
  BaseActionResult,
} from "@/lib/types/actions";

export async function getAccounts(): Promise<BaseActionResult<AccountData[]>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    logger.error("Error fetching accounts:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: data as AccountData[],
  };
}

export async function createAccount(
  account: CreateAccountData
): Promise<BaseActionResult<AccountData>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .insert({
      ...account,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    logger.error("Error creating account:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    data: data as AccountData,
  };
}

export async function updateAccount(
  id: string,
  account: UpdateAccountData
): Promise<BaseActionResult<AccountData>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("financial_accounts")
    .update(account)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    logger.error("Error updating account:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    data: data as AccountData,
  };
}

export async function deleteAccount(
  id: string
): Promise<BaseActionResult<void>> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("financial_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error deleting account:", error as Error);
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

export async function getAccountWithStats(
  id: string
): Promise<
  BaseActionResult<
    AccountData & { stats: { totalTransactions: number; balance: number } }
  >
> {
  const supabase = createActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get account data
  const { data: account, error: accountError } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (accountError) {
    logger.error("Error fetching account:", accountError as Error);
    return {
      success: false,
      error: accountError.message,
    };
  }

  // Get transaction count
  const { count } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("account_id", id)
    .eq("user_id", user.id);

  return {
    success: true,
    data: {
      ...(account as AccountData),
      stats: {
        totalTransactions: count || 0,
        balance: account.balance || 0,
      },
    },
  };
}
