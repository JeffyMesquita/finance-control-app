"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, FileText, PieChart, BarChart3, LineChart } from "lucide-react"
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
} from "recharts"
import { getMonthlyData, getExpenseBreakdown } from "@/app/actions/dashboard"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#8dd1e1"]

export function ReportsOverview() {
  const [monthlyData, setMonthlyData] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [monthlyResult, expenseResult] = await Promise.all([getMonthlyData(), getExpenseBreakdown()])
        setMonthlyData(monthlyResult)
        setExpenseData(expenseResult)
      } catch (error) {
        console.error("Erro ao carregar dados dos relatórios:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Comparação mensal de receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
        </Card>
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Receitas vs Despesas</CardTitle>
          <CardDescription>Comparação mensal de receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Receitas" />
              <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              <Bar dataKey="savings" fill="#3b82f6" name="Economia" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Distribuição de Despesas</CardTitle>
          <CardDescription>Distribuição por categoria</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {expenseData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhum dado de despesa disponível</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card className="lg:col-span-3 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Tendência de Economia</CardTitle>
          <CardDescription>Sua economia ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#3b82f6" name="Economia" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>Baixe ou visualize relatórios detalhados</CardDescription>
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
                  title="Resumo do Mês Atual"
                  description="Resumo financeiro completo para o mês atual"
                  icon={FileText}
                />
                <ReportCard
                  title="Despesas do Mês Atual"
                  description="Detalhamento de despesas por categoria"
                  icon={PieChart}
                />
                <ReportCard title="Receitas do Mês Atual" description="Fontes de receita e análise" icon={BarChart3} />
              </div>
            </TabsContent>
            <TabsContent value="quarterly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Resumo do Trimestre Atual"
                  description="Resumo financeiro completo para o trimestre atual"
                  icon={FileText}
                />
                <ReportCard
                  title="Tendências do Trimestre"
                  description="Tendências e padrões financeiros"
                  icon={LineChart}
                />
              </div>
            </TabsContent>
            <TabsContent value="yearly" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  title="Relatório Anual"
                  description="Resumo financeiro completo para o ano atual"
                  icon={FileText}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface ReportCardProps {
  title: string
  description: string
  icon: React.ElementType
}

function ReportCard({ title, description, icon: Icon }: ReportCardProps) {
  return (
    <Card className="bg-card shadow-sm">
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
            Baixar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
