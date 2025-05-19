"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getMonthlyData } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";

interface FinancialOverviewProps {
  className?: string;
}

type MonthlyData = {
  name: string;
  income: number;
  expenses: number;
  savings: number;
};

export function FinancialOverview({ className }: FinancialOverviewProps) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const monthlyData = await getMonthlyData();
        setData(monthlyData);
      } catch (error) {
        console.error("Erro ao carregar dados mensais:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
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
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="quarterly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
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
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
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
