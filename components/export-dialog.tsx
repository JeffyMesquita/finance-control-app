"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  getTransactionsForExport,
  getAccountsForExport,
  getCategoriesForExport,
  getGoalsForExport,
  getMonthlySummaryForExport,
} from "@/app/actions/export"
import { convertToCSV, downloadCSV, generatePDF } from "@/lib/export-utils"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: any[]
  accounts: any[]
}

export function ExportDialog({ open, onOpenChange, categories, accounts }: ExportDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [exportType, setExportType] = useState("transactions")
  const [fileFormat, setFileFormat] = useState("csv")
  const [dateRange, setDateRange] = useState("all")
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split("T")[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0])
  const [transactionType, setTransactionType] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("")
  const [includeNotes, setIncludeNotes] = useState(true)

  const handleExport = async () => {
    setIsLoading(true)

    try {
      let data = []
      let headers = []
      let fields = []
      let title = ""
      let filename = ""

      // Get data based on export type
      switch (exportType) {
        case "transactions":
          data = await getTransactionsForExport(
            dateRange !== "all" ? dateFrom : undefined,
            dateRange !== "all" ? dateTo : undefined,
            transactionType !== "all" ? transactionType : undefined,
            selectedCategory || undefined,
            selectedAccount || undefined,
          )

          headers = ["Date", "Description", "Category", "Account", "Type", "Amount", ...(includeNotes ? ["Notes"] : [])]

          fields = [
            "date",
            "description",
            "category.name",
            "account.name",
            "type",
            "amount",
            ...(includeNotes ? ["notes"] : []),
          ]

          title = "Transactions Export"
          filename = `transactions_export_${new Date().toISOString().split("T")[0]}`
          break

        case "accounts":
          data = await getAccountsForExport()
          headers = ["Account Name", "Type", "Balance", "Currency"]
          fields = ["name", "type", "balance", "currency"]
          title = "Accounts Export"
          filename = `accounts_export_${new Date().toISOString().split("T")[0]}`
          break

        case "categories":
          data = await getCategoriesForExport()
          headers = ["Category Name", "Type", "Color"]
          fields = ["name", "type", "color"]
          title = "Categories Export"
          filename = `categories_export_${new Date().toISOString().split("T")[0]}`
          break

        case "goals":
          data = await getGoalsForExport()
          headers = [
            "Goal Name",
            "Target Amount",
            "Current Amount",
            "Progress",
            "Start Date",
            "Target Date",
            "Account",
            "Status",
          ]
          fields = [
            "name",
            "target_amount",
            "current_amount",
            // Calculate progress percentage
            (item) => `${Math.round((item.current_amount / item.target_amount) * 100)}%`,
            "start_date",
            "target_date",
            "account.name",
            (item) => (item.is_completed ? "Completed" : "In Progress"),
          ]
          title = "Financial Goals Export"
          filename = `goals_export_${new Date().toISOString().split("T")[0]}`
          break

        case "monthly_summary":
          data = await getMonthlySummaryForExport()
          headers = ["Month", "Income", "Expenses", "Savings"]
          fields = ["month", "income", "expenses", "savings"]
          title = "Monthly Summary Export"
          filename = `monthly_summary_export_${new Date().toISOString().split("T")[0]}`
          break
      }

      // Generate export file
      if (fileFormat === "csv") {
        const csvContent = convertToCSV(data, headers, fields)
        downloadCSV(csvContent, `${filename}.csv`)
      } else {
        generatePDF(
          data,
          headers,
          fields,
          title,
          `${filename}.pdf`,
          exportType === "transactions" ? "landscape" : "portrait",
        )
      }

      toast({
        title: "Export Successful",
        description: `Your ${exportType} data has been exported as ${fileFormat.toUpperCase()}.`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Export Financial Data</DialogTitle>
          <DialogDescription>Export your financial data in CSV or PDF format.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="transactions" onValueChange={(value) => setExportType(value)}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="monthly_summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <RadioGroup defaultValue="all" onValueChange={setDateRange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="date-all" />
                  <Label htmlFor="date-all">All Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="date-custom" />
                  <Label htmlFor="date-custom">Custom Range</Label>
                </div>
              </RadioGroup>

              {dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-from">From</Label>
                    <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-to">To</Label>
                    <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select defaultValue="all" onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="include-notes" checked={includeNotes} onCheckedChange={setIncludeNotes} />
              <Label htmlFor="include-notes">Include Notes</Label>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <p className="text-sm text-muted-foreground mb-4">
              Export all your financial accounts with their current balances.
            </p>
          </TabsContent>

          <TabsContent value="categories">
            <p className="text-sm text-muted-foreground mb-4">Export all your transaction categories.</p>
          </TabsContent>

          <TabsContent value="goals">
            <p className="text-sm text-muted-foreground mb-4">
              Export all your financial goals with their current progress.
            </p>
          </TabsContent>

          <TabsContent value="monthly_summary">
            <p className="text-sm text-muted-foreground mb-4">
              Export a monthly summary of your income, expenses, and savings.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>File Format</Label>
          <RadioGroup defaultValue="csv" onValueChange={setFileFormat} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label htmlFor="format-csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="format-pdf" />
              <Label htmlFor="format-pdf">PDF</Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
