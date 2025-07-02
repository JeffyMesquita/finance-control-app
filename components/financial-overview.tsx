"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency } from "@/lib/utils";
import { useFinancialOverviewQuery } from "@/useCases/useFinancialOverviewQuery";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FinancialOverviewProps {
  className?: string;
}

type MonthlyData = {
  name: string;
  income: number;
  expenses: number;
  savings: number;
};

const CATEGORY_LABEL_MAX = 10;
const ellipsis = (str: string, max: number) =>
  str.length > max ? str.slice(0, max) + "…" : str;

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

const YAxisCustomTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-background p-2 rounded shadow text-xs">
        <div>
          <strong>Mês:</strong> {monthNames[entry.name] || entry.name}
        </div>
        {entry.income !== undefined && (
          <div>
            <strong>Receitas:</strong> {formatCurrency(entry.income)}
          </div>
        )}
        {entry.expenses !== undefined && (
          <div>
            <strong>Despesas:</strong> {formatCurrency(entry.expenses)}
          </div>
        )}
        {entry.savings !== undefined && (
          <div>
            <strong>Economia:</strong> {formatCurrency(entry.savings)}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function FinancialOverview({ className }: FinancialOverviewProps) {
  const { data, isLoading } = useFinancialOverviewQuery();
  const monthlyData = data || [];

  if (isLoading) {
    return (
      <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
        <CardHeader>
          <CardTitle>Visão Geral Financeira</CardTitle>
          <CardDescription>
            Visualize seu desempenho financeiro ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
      <CardHeader>
        <CardTitle>Visão Geral Financeira</CardTitle>
        <CardDescription>
          Visualize seu desempenho financeiro ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly">
          <TabsList className="mb-4">
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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
                <YAxis tick={YAxisCustomTick} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="quarterly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
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
                <YAxis tick={YAxisCustomTick} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  name="Receitas"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  name="Despesas"
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3b82f6"
                  name="Economia"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="yearly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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
                <YAxis tick={YAxisCustomTick} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                <Bar dataKey="savings" fill="#3b82f6" name="Economia" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
