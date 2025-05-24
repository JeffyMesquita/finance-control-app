"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  PieChart,
  BarChart3,
  LineChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";
import { getMonthlyData, getExpenseBreakdown } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { ExpensesComparisonChart } from "@/components/expenses-comparison-chart";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

const monthNames: { [key: string]: string } = {
  Jan: "Jan",
  Feb: "Fev",
  Mar: "Mar",
  Apr: "Abr",
  May: "Mai",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Ago",
  Sep: "Set",
  Oct: "Out",
  Nov: "Nov",
  Dec: "Dez",
};

interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
  savings: number;
}

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

export function ReportsOverview() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [monthlyResult, expenseResult] = await Promise.all([
          getMonthlyData(),
          getExpenseBreakdown(),
        ]);

        console.log("monthlyResult", monthlyResult);
        console.log("expenseResult", expenseResult);
        setMonthlyData(monthlyResult);
        setExpenseData(expenseResult);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-stone-100 dark:bg-stone-900 shadow-sm">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>
              Comparação mensal de receitas e despesas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Despesa por Categoria</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
          <CardDescription>
            Comparação mensal de receitas e despesas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(value: string) => monthNames[value] || value}
              />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value)}
                tickSize={30}
                textLength="60"
                textAnchor="middle"
                tickLine={{ stroke: "transparent" }}
                axisLine={{ stroke: "transparent" }}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Entradas" />
              <Bar dataKey="expenses" fill="#ef4444" name="Saídas" />
              <Bar dataKey="savings" fill="#3b82f6" name="Saldo" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <CardTitle>Despesa por Categoria</CardTitle>
          <CardDescription>Distribuição por categoria</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {expenseData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa disponível
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart data={expenseData}>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) =>
                    `${name}: ${formatCurrency(value)} (${(
                      percent * 100
                    ).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <ExpensesComparisonChart />
      <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <CardTitle>Tendência de Economia</CardTitle>
          <CardDescription>Seu saldo ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#3b82f6"
                name="Savings"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>
              Baixe ou visualize os relatórios detalhados
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly">
            <TabsList className="mb-4">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Current Month Summary"
                  description="Complete financial summary for the current month"
                  icon={FileText}
                />
                <ReportCard
                  title="Current Month Expenses"
                  description="Detailed expense breakdown by category"
                  icon={PieChart}
                />
                <ReportCard
                  title="Current Month Income"
                  description="Income sources and analysis"
                  icon={BarChart3}
                />
              </div>
            </TabsContent>
            <TabsContent value="quarterly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Current Quarter Summary"
                  description="Complete financial summary for the current quarter"
                  icon={FileText}
                />
                <ReportCard
                  title="Current Quarter Trends"
                  description="Financial trends and patterns"
                  icon={LineChart}
                />
              </div>
            </TabsContent>
            <TabsContent value="yearly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Current Year Report"
                  description="Complete financial summary for the current year"
                  icon={FileText}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

function ReportCard({ title, description, icon: Icon }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
