"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/export-button"
import { FileSpreadsheet, FileText, BarChart3, CreditCard, Tag, Goal } from "lucide-react"

export default function ExportsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Exportar Dados</h1>
      </div>

      <p className="text-muted-foreground">
        Exporte seus dados financeiros em formato CSV ou PDF para manter registros ou analisar em ferramentas externas.
      </p>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="all">Todos os Dados</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="accounts">Contas e Categorias</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Todas as Transações"
              description="Exporte seu histórico completo de transações"
              icon={FileSpreadsheet}
            />
            <ExportCard
              title="Contas Financeiras"
              description="Exporte todas as suas contas e saldos"
              icon={CreditCard}
            />
            <ExportCard title="Categorias" description="Exporte suas categorias de transação" icon={Tag} />
            <ExportCard title="Metas Financeiras" description="Exporte suas metas e progresso" icon={Goal} />
            <ExportCard
              title="Resumo Mensal"
              description="Exporte resumo mensal de receitas e despesas"
              icon={BarChart3}
            />
            <ExportCard
              title="Exportação Personalizada"
              description="Crie uma exportação personalizada"
              icon={FileText}
            />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Todas as Transações"
              description="Exporte seu histórico completo de transações"
              icon={FileSpreadsheet}
            />
            <ExportCard
              title="Transações de Receita"
              description="Exporte apenas transações de receita"
              icon={FileSpreadsheet}
            />
            <ExportCard
              title="Transações de Despesa"
              description="Exporte apenas transações de despesa"
              icon={FileSpreadsheet}
            />
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Contas Financeiras"
              description="Exporte todas as suas contas e saldos"
              icon={CreditCard}
            />
            <ExportCard title="Categorias" description="Exporte suas categorias de transação" icon={Tag} />
            <ExportCard title="Metas Financeiras" description="Exporte suas metas e progresso" icon={Goal} />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Resumo Mensal"
              description="Exporte resumo mensal de receitas e despesas"
              icon={BarChart3}
            />
            <ExportCard
              title="Detalhamento por Categoria"
              description="Exporte detalhamento de despesas por categoria"
              icon={BarChart3}
            />
            <ExportCard title="Relatório Anual" description="Exporte resumo financeiro anual" icon={BarChart3} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ExportCardProps {
  title: string
  description: string
  icon: React.ElementType
}

function ExportCard({ title, description, icon: Icon }: ExportCardProps) {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter>
        <ExportButton variant="default" />
      </CardFooter>
    </Card>
  )
}
