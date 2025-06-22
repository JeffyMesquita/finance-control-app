"use client";

import { logger } from "@/lib/utils/logger";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { supabaseCache } from "@/lib/supabase/cache";
import { DashboardCardsSkeleton } from "@/components/skeletons";

const CACHE_KEY = "dashboard-data";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function DashboardCards() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({});

  const toggleVisibility = (cardId: string) => {
    setVisibleCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const fetchData = async () => {
    try {
      // Check cache first
      const cachedData = supabaseCache.get(CACHE_KEY);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      const dashboardData = await getDashboardData();

      if (!dashboardData) {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchData();
          }, RETRY_DELAY);
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      setData(dashboardData);
      // Cache the data
      supabaseCache.set(CACHE_KEY, dashboardData);
    } catch (error) {
      logger.error("Error fetching dashboard data:", error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <DashboardCardsSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4">
      <Card className="relative border-orange-500 bg-orange-300/50 dark:bg-orange-200/20 shadow-sm max-sm:col-span-1 col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-100">
            Saldo Total
          </CardTitle>
          <span className="text-orange-100 dark:text-orange-700 bg-orange-400 dark:bg-orange-200 rounded-full p-2">
            <DollarSign className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.totalBalance)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #78350f 60%, #a16207 100%)",
                  clipPath: visibleCards["totalBalance"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-orange-100/80 dark:bg-orange-900/80 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                onClick={() => toggleVisibility("totalBalance")}
                tabIndex={0}
                aria-label={
                  visibleCards["totalBalance"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["totalBalance"] ? (
                  <EyeOff className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                ) : (
                  <Eye className="h-5 w-5 text-orange-500 dark:text-orange-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-300">
            Seu saldo atual em todas as contas
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-green-500 bg-green-300/50 dark:bg-green-200/20 shadow-sm col-span-1 w-full sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
            Receitas
          </CardTitle>
          <span className="text-green-100 dark:text-green-700 bg-green-400 dark:bg-green-200 rounded-full p-2">
            <ArrowUpIcon className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.monthlyIncome)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #14532d 60%, #22c55e 100%)",
                  clipPath: visibleCards["monthlyIncome"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-green-100/80 dark:bg-green-900/80 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                onClick={() => toggleVisibility("monthlyIncome")}
                tabIndex={0}
                aria-label={
                  visibleCards["monthlyIncome"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["monthlyIncome"] ? (
                  <EyeOff className="h-5 w-5 text-green-500 dark:text-green-300" />
                ) : (
                  <Eye className="h-5 w-5 text-green-500 dark:text-green-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300">
            Total de receitas deste mês
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-red-500 bg-red-300/50 dark:bg-red-200/20 shadow-sm col-span-1 w-full sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800 dark:text-red-100">
            Despesas
          </CardTitle>
          <span className="text-red-100 dark:text-red-700 bg-red-400 dark:bg-red-200 rounded-full p-2">
            <ArrowDownIcon className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.monthlyExpenses)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #7f1d1d 60%, #ef4444 100%)",
                  clipPath: visibleCards["monthlyExpenses"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-red-100/80 dark:bg-red-900/80 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                onClick={() => toggleVisibility("monthlyExpenses")}
                tabIndex={0}
                aria-label={
                  visibleCards["monthlyExpenses"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["monthlyExpenses"] ? (
                  <EyeOff className="h-5 w-5 text-red-500 dark:text-red-300" />
                ) : (
                  <Eye className="h-5 w-5 text-red-500 dark:text-red-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-red-600 dark:text-red-300">
            Total de despesas deste mês
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-blue-500 bg-blue-300/50 dark:bg-blue-200/20 shadow-sm col-span-1 w-full sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-100">
            Economia
          </CardTitle>
          <span className="text-blue-100 dark:text-blue-700 bg-blue-400 dark:bg-blue-200 rounded-full p-2">
            <CreditCard className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.monthlySavings)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a8a 60%, #2563eb 100%)",
                  clipPath: visibleCards["monthlySavings"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-blue-100/80 dark:bg-blue-900/80 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                onClick={() => toggleVisibility("monthlySavings")}
                tabIndex={0}
                aria-label={
                  visibleCards["monthlySavings"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["monthlySavings"] ? (
                  <EyeOff className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            Total economizado neste mês
          </p>
        </CardContent>
      </Card>

      {/* Novos cards */}

      <Card className="relative overflow-hidden border-red-500 bg-red-300/50 dark:bg-red-200/20 shadow-sm col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800 dark:text-red-100">
            Despesas do Próximo Mês
          </CardTitle>
          <span className="text-red-100 dark:text-red-700 bg-red-400 dark:bg-red-200 rounded-full p-2">
            <Calendar className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.nextMonthExpenses)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #6a0113 60%, #ef4444 100%)",
                  clipPath: visibleCards["nextMonthExpenses"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-red-100/80 dark:bg-red-900/80 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                onClick={() => toggleVisibility("nextMonthExpenses")}
                tabIndex={0}
                aria-label={
                  visibleCards["nextMonthExpenses"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["nextMonthExpenses"] ? (
                  <EyeOff className="h-5 w-5 text-red-500 dark:text-red-300" />
                ) : (
                  <Eye className="h-5 w-5 text-red-500 dark:text-red-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-red-600 dark:text-red-300">
            Total de despesas agendadas para o próximo mês
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-emerald-500 bg-emerald-300/50 dark:bg-emerald-200/20 shadow-sm col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-100">
            Receitas do Próximo Mês
          </CardTitle>
          <span className="text-emerald-100 dark:text-emerald-700 bg-emerald-400 dark:bg-emerald-200 rounded-full p-2">
            <Calendar className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.nextMonthIncome)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #09341a 60%, #22c55e 100%)",
                  clipPath: visibleCards["nextMonthIncome"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/80 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                onClick={() => toggleVisibility("nextMonthIncome")}
                tabIndex={0}
                aria-label={
                  visibleCards["nextMonthIncome"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["nextMonthIncome"] ? (
                  <EyeOff className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
                ) : (
                  <Eye className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-300">
            Total de receitas agendadas para o próximo mês
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-purple-500 bg-purple-300/50 dark:bg-purple-200/20 shadow-sm col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-100">
            Gastos Futuros
          </CardTitle>
          <span className="text-purple-100 dark:text-purple-700 bg-purple-400 dark:bg-purple-200 rounded-full p-2">
            <Calendar className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.gastosFuturos)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #3b0764 60%, #a21caf 100%)",
                  clipPath: visibleCards["gastosFuturos"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-purple-100/80 dark:bg-purple-900/80 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                onClick={() => toggleVisibility("gastosFuturos")}
                tabIndex={0}
                aria-label={
                  visibleCards["gastosFuturos"]
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {visibleCards["gastosFuturos"] ? (
                  <EyeOff className="h-5 w-5 text-purple-500 dark:text-purple-300" />
                ) : (
                  <Eye className="h-5 w-5 text-purple-500 dark:text-purple-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            Total de despesas agendadas para o futuro
          </p>
        </CardContent>
      </Card>

      <Card className="border-emerald-500 bg-emerald-300/50 dark:bg-emerald-200/20 shadow-sm col-span-1">
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
            {loading ? (
              <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              `${data.incomeCount} entradas`
            )}
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300">
            Maior entrada:{" "}
            {loading ? (
              <span className="h-4 w-12 inline-block animate-pulse rounded bg-muted"></span>
            ) : (
              formatCurrency(data.maxIncome)
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-500 bg-rose-300/50 dark:bg-rose-200/20 shadow-sm col-span-1">
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
            {loading ? (
              <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              `${data.expenseCount} despesas`
            )}
          </div>
          <div className="text-xs text-rose-700 dark:text-rose-300">
            Maior despesa:{" "}
            {loading ? (
              <span className="h-4 w-12 inline-block animate-pulse rounded bg-muted"></span>
            ) : (
              formatCurrency(data.maxExpense)
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-yellow-500 bg-yellow-300/50 dark:bg-yellow-200/20 shadow-sm col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-100">
            Cofrinhos
          </CardTitle>
          <span className="text-yellow-100 dark:text-yellow-700 bg-yellow-400 dark:bg-yellow-200 rounded-full p-2">
            <PiggyBank className="h-4 w-4" />
          </span>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between items-start mb-2">
            <div className="relative w-full">
              <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
                {loading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                ) : (
                  formatCurrency(data.savings)
                )}
              </div>
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out z-10 rounded-xl`}
                style={{
                  background:
                    "linear-gradient(135deg, #854d0e 60%, #eab308 100%)",
                  clipPath: visibleCards["savings"]
                    ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  transition: "clip-path 0.7s cubic-bezier(.4,0,.2,1)",
                }}
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-yellow-100/80 dark:bg-yellow-900/80 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                onClick={() => toggleVisibility("savings")}
                tabIndex={0}
                aria-label={
                  visibleCards["savings"] ? "Ocultar valor" : "Mostrar valor"
                }
              >
                {visibleCards["savings"] ? (
                  <EyeOff className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
                ) : (
                  <Eye className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-300">
            Total guardado nos cofrinhos digitais
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

