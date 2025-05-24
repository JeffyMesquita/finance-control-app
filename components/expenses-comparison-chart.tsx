"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { getExpenseBreakdown } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyExpenses {
  currentMonth: ExpenseData[];
  previousMonth: ExpenseData[];
}

const CATEGORY_LABEL_MAX = 10;
const ellipsis = (str: string, max: number) =>
  str.length > max ? str.slice(0, max) + "…" : str;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-background p-2 rounded shadow text-xs">
        <div>
          <strong>Categoria:</strong> {entry.name}
        </div>
        <div>
          <strong>Valor:</strong> {formatCurrency(entry.value)}
        </div>
      </div>
    );
  }
  return null;
};

export function ExpensesComparisonChart() {
  const [expenseData, setExpenseData] = useState<MonthlyExpenses>({
    currentMonth: [],
    previousMonth: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar dados do mês atual
        const currentMonthData = await getExpenseBreakdown();

        // Buscar dados do mês anterior
        const previousMonthData = await getExpenseBreakdown("previous");

        setExpenseData({
          currentMonth: currentMonthData,
          previousMonth: previousMonthData,
        });
      } catch (error) {
        console.error("Error fetching expense data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <CardTitle>Comparação de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
      <CardHeader>
        <CardTitle>Comparação de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico do Mês Atual */}
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-2">Mês Atual</h3>
            {expenseData.currentMonth.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma despesa disponível
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData.currentMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fontFamily: "Inter, Roboto, Arial, sans-serif",
                      fontWeight: 700,
                    }}
                    tickFormatter={(value) =>
                      ellipsis(value, CATEGORY_LABEL_MAX)
                    }
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value">
                    {expenseData.currentMonth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico do Mês Anterior */}
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-2">Mês Anterior</h3>
            {expenseData.previousMonth.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma despesa disponível
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData.previousMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fontFamily: "Inter, Roboto, Arial, sans-serif",
                      fontWeight: 700,
                    }}
                    tickFormatter={(value) =>
                      ellipsis(value, CATEGORY_LABEL_MAX)
                    }
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value">
                    {expenseData.previousMonth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
