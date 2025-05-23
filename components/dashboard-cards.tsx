"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";

export function DashboardCards() {
  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
    gastosFuturos: 0,
    incomeCount: 0,
    maxIncome: 0,
    expenseCount: 0,
    maxExpense: 0,
    savings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Erro ao carregar dados do painel:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  console.log(data.totalBalance);

  return (
    <>
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-100">
            Saldo Total
          </CardTitle>
          <span className="text-orange-100 dark:text-orange-700 bg-orange-400 dark:bg-orange-200 rounded-full p-2">
            <DollarSign className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.totalBalance)
            )}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-300">
            Seu saldo atual em todas as contas
          </p>
        </CardContent>
      </Card>
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
            Receitas
          </CardTitle>
          <span className="text-green-100 dark:text-green-700 bg-green-400 dark:bg-green-200 rounded-full p-2">
            <ArrowUpIcon className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500 dark:text-green-400">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.monthlyIncome)
            )}
          </div>
          <p className="text-xs text-green-600 dark:text-green-300">
            Total de receitas deste mês
          </p>
        </CardContent>
      </Card>
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800 dark:text-red-100">
            Despesas
          </CardTitle>
          <span className="text-red-100 dark:text-red-700 bg-red-400 dark:bg-red-200 rounded-full p-2">
            <ArrowDownIcon className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500 dark:text-red-400">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.monthlyExpenses)
            )}
          </div>
          <p className="text-xs text-red-600 dark:text-red-300">
            Total de despesas deste mês
          </p>
        </CardContent>
      </Card>
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-100">
            Economia
          </CardTitle>
          <span className="text-blue-100 dark:text-blue-700 bg-blue-400 dark:bg-blue-200 rounded-full p-2">
            <CreditCard className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.monthlySavings)
            )}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            Total economizado neste mês
          </p>
        </CardContent>
      </Card>
      <Card className="bg-purple-100 dark:bg-purple-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-100">
            Gastos Futuros
          </CardTitle>
          <span className="text-purple-100 dark:text-purple-700 bg-purple-400 dark:bg-purple-200 rounded-full p-2">
            <Calendar className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.gastosFuturos)
            )}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            Total de despesas agendadas para o futuro
          </p>
        </CardContent>
      </Card>
      <Card className="bg-emerald-100 dark:bg-emerald-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-100">
            Entradas
          </CardTitle>
          <span className="text-emerald-100 dark:text-emerald-700 bg-emerald-400 dark:bg-emerald-200 rounded-full p-2">
            <TrendingUp className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
            {isLoading ? (
              <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              `${data.incomeCount} entradas`
            )}
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300">
            Maior entrada:{" "}
            {isLoading ? (
              <span className="h-4 w-12 inline-block animate-pulse rounded bg-muted"></span>
            ) : (
              formatCurrency(data.maxIncome)
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-rose-100 dark:bg-rose-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-100">
            Despesas
          </CardTitle>
          <span className="text-rose-100 dark:text-rose-700 bg-rose-400 dark:bg-rose-200 rounded-full p-2">
            <TrendingDown className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-rose-500 dark:text-rose-400">
            {isLoading ? (
              <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              `${data.expenseCount} despesas`
            )}
          </div>
          <div className="text-xs text-rose-700 dark:text-rose-300">
            Maior despesa:{" "}
            {isLoading ? (
              <span className="h-4 w-12 inline-block animate-pulse rounded bg-muted"></span>
            ) : (
              formatCurrency(data.maxExpense)
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-yellow-100 dark:bg-yellow-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-100">
            Poupança
          </CardTitle>
          <span className="text-yellow-100 dark:text-yellow-700 bg-yellow-400 dark:bg-yellow-200 rounded-full p-2">
            <PiggyBank className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              formatCurrency(data.savings)
            )}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-300">
            Dinheiro guardado na poupança
          </p>
        </CardContent>
      </Card>
    </>
  );
}
