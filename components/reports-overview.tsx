"use client";

import { logger } from "@/lib/utils/logger";

import {
  getExpenseBreakdown,
  getGoalsStats,
  getMonthlyData,
} from "@/app/actions/dashboard";
import { getSavingsBoxesStats } from "@/app/actions/savings-boxes";
import { ExpensesComparisonChart } from "@/components/expenses-comparison-chart";
import { ReportsOverviewSkeleton as ReportsSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle,
  Download,
  FileText,
  LineChart,
  Link,
  PieChart,
  PiggyBank,
  Target,
  TrendingUp,
  Unlink,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

interface GoalsStats {
  total_goals: number;
  completed_goals: number;
  overdue_goals: number;
  linked_to_savings_boxes: number;
  average_progress: number;
  total_target_amount: number;
  total_current_amount: number;
  goals_by_month: Array<{
    name: string;
    goals_created: number;
    goals_completed: number;
    target_amount: number;
  }>;
}

interface SavingsBoxStats {
  total_boxes: number;
  total_amount: number;
  total_with_goals: number;
  total_completed_goals: number;
  average_completion: number;
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
  const [goalsStats, setGoalsStats] = useState<GoalsStats | null>(null);
  const [savingsBoxStats, setSavingsBoxStats] =
    useState<SavingsBoxStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [monthlyResult, expenseResult, goalsResult, savingsResult] =
          await Promise.all([
            getMonthlyData(),
            getExpenseBreakdown(),
            getGoalsStats(),
            getSavingsBoxesStats(),
          ]);

        setMonthlyData(monthlyResult.data || ([] as MonthlyData[]));
        setExpenseData(expenseResult.data || []);
        setGoalsStats(goalsResult.data || null);
        setSavingsBoxStats(savingsResult.data || null);
      } catch (error) {
        logger.error("Error fetching report data:", error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalExpenses = expenseData.reduce((sum, e) => sum + e.value, 0);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Receitas vs Despesas */}
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

      {/* Despesa por Categoria */}
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <CardTitle>Despesa por Categoria</CardTitle>
          <CardDescription>Distribuição por categoria</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {expenseData?.length === 0 ? (
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

      {/* Estatísticas de Metas */}
      {goalsStats && (
        <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Metas Financeiras
              </CardTitle>
              <CardDescription>Visão geral das suas metas</CardDescription>
            </div>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {goalsStats.completed_goals}
                </div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {goalsStats.overdue_goals}
                </div>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span>Progresso Médio</span>
                <span className="font-medium">
                  {goalsStats.average_progress}%
                </span>
              </div>
              <Progress
                value={goalsStats.average_progress}
                className="h-2 mt-1"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Badge variant="secondary" className="justify-center">
                <Link className="h-3 w-3 mr-1" />
                {goalsStats.linked_to_savings_boxes} vinculadas
              </Badge>
              <Badge variant="outline" className="justify-center">
                Total: {goalsStats.total_goals}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas de Cofrinhos */}
      {savingsBoxStats && (
        <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Cofrinhos Digitais
              </CardTitle>
              <CardDescription>Resumo dos seus cofrinhos</CardDescription>
            </div>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {savingsBoxStats.total_boxes}
                </div>
                <p className="text-xs text-muted-foreground">Cofrinhos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(savingsBoxStats.total_amount / 100)}
                </div>
                <p className="text-xs text-muted-foreground">Total Poupado</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span>Progresso Médio</span>
                <span className="font-medium">
                  {savingsBoxStats.average_completion}%
                </span>
              </div>
              <Progress
                value={savingsBoxStats.average_completion}
                className="h-2 mt-1"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Badge variant="secondary" className="justify-center">
                <Link className="h-3 w-3 mr-1" />
                {savingsBoxStats.total_with_goals} c/ metas
              </Badge>
              <Badge variant="outline" className="justify-center">
                {savingsBoxStats.total_completed_goals} completos
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise de Integração */}
      {goalsStats && savingsBoxStats && (
        <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Análise de Integração
              </CardTitle>
              <CardDescription>
                Metas e cofrinhos trabalhando juntos
              </CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600">
                  {Math.round(
                    (goalsStats.linked_to_savings_boxes /
                      Math.max(goalsStats.total_goals, 1)) *
                      100
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Metas Integradas
                </p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {Math.round(
                    (savingsBoxStats.total_with_goals /
                      Math.max(savingsBoxStats.total_boxes, 1)) *
                      100
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Cofrinhos c/ Metas
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              {goalsStats.linked_to_savings_boxes > 0 ? (
                <Badge
                  variant="default"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Estratégia Integrada Ativa
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-300"
                >
                  <Unlink className="h-3 w-3 mr-1" />
                  Potencial de Integração
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Comparison Chart */}
      <ExpensesComparisonChart />

      {/* Tendência de Economia */}
      <Card className="lg:col-span-2 bg-stone-100 dark:bg-stone-900 shadow-sm">
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
                strokeWidth={2}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução de Metas */}
      {goalsStats && (
        <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
          <CardHeader>
            <CardTitle>Evolução de Metas</CardTitle>
            <CardDescription>Criação de metas por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={goalsStats.goals_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fontFamily: "Inter, Roboto, Arial, sans-serif",
                    fontWeight: 700,
                  }}
                  tickFormatter={(value: string) => monthNames[value] || value}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fontFamily: "Inter, Roboto, Arial, sans-serif",
                    fontWeight: 700,
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "goals_created"
                      ? `${value} criadas`
                      : `${value} concluídas`,
                    name === "goals_created"
                      ? "Metas Criadas"
                      : "Metas Concluídas",
                  ]}
                />
                <Legend />
                <Bar dataKey="goals_created" fill="#8884d8" name="Criadas" />
                <Bar
                  dataKey="goals_completed"
                  fill="#22c55e"
                  name="Concluídas"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Relatórios Disponíveis */}
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
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
              <TabsTrigger value="yearly">Anual</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Resumo Mensal Completo"
                  description="Resumo financeiro completo do mês atual"
                  icon={FileText}
                />
                <ReportCard
                  title="Despesas do Mês"
                  description="Análise detalhada de despesas por categoria"
                  icon={PieChart}
                />
                <ReportCard
                  title="Receitas do Mês"
                  description="Fontes de renda e análise"
                  icon={BarChart3}
                />
                <ReportCard
                  title="Metas e Cofrinhos"
                  description="Relatório de progresso de metas e cofrinhos"
                  icon={Target}
                />
                <ReportCard
                  title="Análise de Economia"
                  description="Tendências de poupança e economia"
                  icon={TrendingUp}
                />
                <ReportCard
                  title="Resumo de Integração"
                  description="Análise de metas vinculadas a cofrinhos"
                  icon={Link}
                />
              </div>
            </TabsContent>
            <TabsContent value="quarterly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Resumo Trimestral"
                  description="Resumo financeiro completo do trimestre atual"
                  icon={FileText}
                />
                <ReportCard
                  title="Tendências Trimestrais"
                  description="Padrões e tendências financeiras"
                  icon={LineChart}
                />
                <ReportCard
                  title="Performance de Metas"
                  description="Análise trimestral do progresso das metas"
                  icon={Target}
                />
              </div>
            </TabsContent>
            <TabsContent value="yearly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Relatório Anual"
                  description="Resumo financeiro completo do ano atual"
                  icon={FileText}
                />
                <ReportCard
                  title="Análise de Crescimento"
                  description="Evolução financeira ao longo do ano"
                  icon={TrendingUp}
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
