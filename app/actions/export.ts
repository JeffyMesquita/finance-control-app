"use server"

import { createActionClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"

// Export transactions
export async function getTransactionsForExport(
  dateFrom?: string,
  dateTo?: string,
  type?: string,
  categoryId?: string,
  accountId?: string,
) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

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
    `,
    )
    .eq("user_id", user.id)

  // Apply filters
  if (dateFrom) {
    query = query.gte("date", dateFrom)
  }
  if (dateTo) {
    query = query.lte("date", dateTo)
  }
  if (type && (type === "INCOME" || type === "EXPENSE")) {
    query = query.eq("type", type)
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }
  if (accountId) {
    query = query.eq("account_id", accountId)
  }

  // Order by date
  query = query.order("date", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching transactions for export:", error)
    return []
  }

  return data
}

// Export accounts
export async function getAccountsForExport() {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase.from("financial_accounts").select("*").eq("user_id", user.id).order("name")

  if (error) {
    console.error("Error fetching accounts for export:", error)
    return []
  }

  return data
}

// Export categories
export async function getCategoriesForExport() {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

  if (error) {
    console.error("Error fetching categories for export:", error)
    return []
  }

  return data
}

// Export goals
export async function getGoalsForExport() {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("financial_goals")
    .select(
      `
      *,
      category:categories(id, name),
      account:financial_accounts(id, name)
    `,
    )
    .eq("user_id", user.id)
    .order("target_date")

  if (error) {
    console.error("Error fetching goals for export:", error)
    return []
  }

  return data
}

// Get monthly summary for export
export async function getMonthlySummaryForExport(year?: number) {
  const supabase = createActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const currentYear = year || new Date().getFullYear()
  const startDate = new Date(currentYear, 0, 1).toISOString()
  const endDate = new Date(currentYear, 11, 31).toISOString()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, date")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    console.error("Error fetching monthly summary for export:", error)
    return []
  }

  // Group by month
  const monthlyData = Array(12)
    .fill(0)
    .map((_, index) => {
      return {
        month: new Date(currentYear, index, 1).toLocaleString("default", { month: "long" }),
        income: 0,
        expenses: 0,
        savings: 0,
      }
    })

  data.forEach((transaction) => {
    const date = new Date(transaction.date)
    const month = date.getMonth()

    if (transaction.type === "INCOME") {
      monthlyData[month].income += transaction.amount
    } else {
      monthlyData[month].expenses += transaction.amount
    }
  })

  // Calculate savings
  monthlyData.forEach((month) => {
    month.savings = month.income - month.expenses
  })

  return monthlyData
}

// Função de exportação de dados
export async function exportData(
  type: string,
  format: "csv" | "pdf",
  filters: {
    dateFrom?: string
    dateTo?: string
    transactionType?: string
    categoryId?: string
    accountId?: string
    year?: number
  },
) {
  let data: any[] = []
  let filename = ""
  let headers: string[] = []

  // Obter dados com base no tipo
  switch (type) {
    case "transactions":
      data = await getTransactionsForExport(
        filters.dateFrom,
        filters.dateTo,
        filters.transactionType,
        filters.categoryId,
        filters.accountId,
      )
      filename = `transacoes_${new Date().toISOString().split("T")[0]}`
      headers = ["ID", "Descrição", "Valor", "Data", "Tipo", "Categoria", "Conta", "Notas"]

      // Formatar dados para exportação
      data = data.map((item) => ({
        id: item.id,
        description: item.description,
        amount: (item.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        date: new Date(item.date).toLocaleDateString("pt-BR"),
        type: item.type === "INCOME" ? "Receita" : "Despesa",
        category: item.category?.name || "",
        account: item.account?.name || "",
        notes: item.notes || "",
      }))
      break

    case "accounts":
      data = await getAccountsForExport()
      filename = `contas_${new Date().toISOString().split("T")[0]}`
      headers = ["ID", "Nome", "Saldo", "Moeda", "Tipo"]

      // Formatar dados para exportação
      data = data.map((item) => ({
        id: item.id,
        name: item.name,
        balance: (item.balance / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        currency: item.currency,
        type: item.type,
      }))
      break

    case "categories":
      data = await getCategoriesForExport()
      filename = `categorias_${new Date().toISOString().split("T")[0]}`
      headers = ["ID", "Nome", "Tipo", "Cor", "Ícone"]

      // Formatar dados para exportação
      data = data.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type === "INCOME" ? "Receita" : "Despesa",
        color: item.color,
        icon: item.icon,
      }))
      break

    case "goals":
      data = await getGoalsForExport()
      filename = `metas_${new Date().toISOString().split("T")[0]}`
      headers = [
        "ID",
        "Nome",
        "Valor Alvo",
        "Valor Atual",
        "Data Inicial",
        "Data Alvo",
        "Categoria",
        "Conta",
        "Concluída",
      ]

      // Formatar dados para exportação
      data = data.map((item) => ({
        id: item.id,
        name: item.name,
        targetAmount: (item.target_amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        currentAmount: (item.current_amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        startDate: new Date(item.start_date).toLocaleDateString("pt-BR"),
        targetDate: new Date(item.target_date).toLocaleDateString("pt-BR"),
        category: item.category?.name || "",
        account: item.account?.name || "",
        isCompleted: item.is_completed ? "Sim" : "Não",
      }))
      break

    case "monthly":
      data = await getMonthlySummaryForExport(filters.year)
      filename = `resumo_mensal_${filters.year || new Date().getFullYear()}`
      headers = ["Mês", "Receitas", "Despesas", "Economia"]

      // Formatar dados para exportação
      data = data.map((item) => ({
        month: item.month,
        income: (item.income / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        expenses: (item.expenses / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        savings: (item.savings / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      }))
      break

    default:
      throw new Error("Tipo de exportação inválido")
  }

  // Exportar dados no formato solicitado
  if (format === "csv") {
    return exportToCSV(data, headers, filename)
  } else {
    return exportToPDF(data, headers, filename, type)
  }
}
