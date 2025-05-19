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
        <h1 className="text-2xl font-bold tracking-tight">Data Exports</h1>
      </div>

      <p className="text-muted-foreground">
        Export your financial data in CSV or PDF format for record-keeping or analysis in external tools.
      </p>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="all">All Data</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts & Categories</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="All Transactions"
              description="Export your complete transaction history"
              icon={FileSpreadsheet}
            />
            <ExportCard
              title="Financial Accounts"
              description="Export all your accounts and balances"
              icon={CreditCard}
            />
            <ExportCard title="Categories" description="Export your transaction categories" icon={Tag} />
            <ExportCard title="Financial Goals" description="Export your savings goals and progress" icon={Goal} />
            <ExportCard
              title="Monthly Summary"
              description="Export monthly income and expense summary"
              icon={BarChart3}
            />
            <ExportCard title="Custom Export" description="Create a customized data export" icon={FileText} />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="All Transactions"
              description="Export your complete transaction history"
              icon={FileSpreadsheet}
            />
            <ExportCard
              title="Income Transactions"
              description="Export only income transactions"
              icon={FileSpreadsheet}
            />
            <ExportCard
              title="Expense Transactions"
              description="Export only expense transactions"
              icon={FileSpreadsheet}
            />
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Financial Accounts"
              description="Export all your accounts and balances"
              icon={CreditCard}
            />
            <ExportCard title="Categories" description="Export your transaction categories" icon={Tag} />
            <ExportCard title="Financial Goals" description="Export your savings goals and progress" icon={Goal} />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Monthly Summary"
              description="Export monthly income and expense summary"
              icon={BarChart3}
            />
            <ExportCard
              title="Category Breakdown"
              description="Export expense breakdown by category"
              icon={BarChart3}
            />
            <ExportCard title="Annual Report" description="Export annual financial summary" icon={BarChart3} />
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
    <Card>
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
