"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, CreditCard } from "lucide-react"
import { getDashboardData } from "@/app/actions/dashboard"
import { formatCurrency } from "@/lib/utils"

export function DashboardCards() {
  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getDashboardData()
        setData(dashboardData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.totalBalance)
            )}
          </div>
          <p className="text-xs text-muted-foreground">Your current balance across all accounts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.monthlyIncome)
            )}
          </div>
          <p className="text-xs text-muted-foreground">This month's total income</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.monthlyExpenses)
            )}
          </div>
          <p className="text-xs text-muted-foreground">This month's total expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.monthlySavings)
            )}
          </div>
          <p className="text-xs text-muted-foreground">This month's total savings</p>
        </CardContent>
      </Card>
    </>
  )
}
