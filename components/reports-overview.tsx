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

const CATEGORY_LABEL_MAX = 10;
const ellipsis = (str: string, max: number) =>
  str.length > max ? str.slice(0, max) + "…" : str;

const PIE_LABEL_MAX = 10;
const PieLabel = (props: any) => {
  const {
    name,
    percent,
    cx,
    cy,
    midAngle,
    outerRadius,
    color,
    value,
    payload,
  } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 40;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const displayName = ellipsis(name, PIE_LABEL_MAX);
  return (
    <g>
      <foreignObject x={x - 60} y={y - 12} width="120" height="24">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginRight: 4,
              color: color,
              display: "inline-block",
            }}
          >
            {displayName}
          </span>
          <span style={{ fontSize: "12px", color: color, fontWeight: 700 }}>
            {(percent * 100).toFixed(0)}%
          </span>
        </div>
      </foreignObject>
    </g>
  );
};

const YAxisCustomTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={25}
        y={0}
        dy={2}
        textAnchor="end"
        fontSize={10}
        fontFamily="Inter, Roboto, Arial, sans-serif"
        fontWeight={800}
        fill="#64748b"
        transform="rotate(-10)"
      >
        {formatCurrency(payload.value)}
      </text>
    </g>
  );
};

export function ReportsOverview() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null);

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

  const totalExpenses = expenseData.reduce((sum, e) => sum + e.value, 0);

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
                tick={{
                  fontSize: 12,
                  fontFamily: "Inter, Roboto, Arial, sans-serif",
                  fontWeight: 700,
                }}
                tickFormatter={(value: string) => monthNames[value] || value}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={(props) => <YAxisCustomTick {...props} />}
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
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
                  label={PieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                  onClick={(_, index) => setSelectedPieIndex(index)}
                  activeIndex={
                    selectedPieIndex === null ? undefined : selectedPieIndex
                  }
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <PieCustomTooltip
                      selected={selectedPieIndex}
                      expenseData={expenseData}
                      totalExpenses={totalExpenses}
                    />
                  }
                  isAnimationActive={false}
                  wrapperStyle={
                    selectedPieIndex != null
                      ? { opacity: 1, pointerEvents: "auto" }
                      : {}
                  }
                />
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
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12,
                  fontFamily: "Inter, Roboto, Arial, sans-serif",
                  fontWeight: 700,
                }}
                tickFormatter={(value: string) => monthNames[value] || value}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={(props) => <YAxisCustomTick {...props} />}
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
                tickSize={30}
                textLength="60"
                textAnchor="middle"
                tickLine={{ stroke: "transparent" }}
                axisLine={{ stroke: "transparent" }}
              />
              <Tooltip content={<SavingsTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#3b82f6"
                name="Economia"
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

const SavingsTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-background p-2 rounded shadow text-xs">
        <div>
          <strong>Mês:</strong> {entry.name}
        </div>
        <div>
          <strong>Economia:</strong> {formatCurrency(entry.savings)}
        </div>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({
  active,
  payload,
  selected,
  expenseData,
  totalExpenses,
}: any) => {
  let entry,
    percent = 0;
  if (typeof selected === "number" && expenseData[selected]) {
    entry = expenseData[selected];
    percent = totalExpenses ? entry.value / totalExpenses : 0;
  } else if (active && payload && payload.length) {
    entry = payload[0].payload;
    percent = totalExpenses ? entry.value / totalExpenses : 0;
  }
  if (!entry) return null;
  return (
    <div className="bg-background p-2 rounded shadow text-xs">
      <div>
        <strong>Categoria:</strong> {entry.name}
      </div>
      <div>
        <strong>Valor:</strong> {formatCurrency(entry.value)}
      </div>
      <div>
        <strong>Percentual:</strong> {(percent * 100).toFixed(1)}%
      </div>
    </div>
  );
};
