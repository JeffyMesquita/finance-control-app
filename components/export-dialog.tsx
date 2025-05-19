"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { exportData } from "@/app/actions/export"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  categories: { id: string; name: string }[]
  accounts: { id: string; name: string }[]
}

export function ExportDialog({ isOpen, onClose, categories, accounts }: ExportDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [exportType, setExportType] = useState("transactions")
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [accountId, setAccountId] = useState<string | undefined>(undefined)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [useFilters, setUseFilters] = useState(false)

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  const handleExport = async () => {
    try {
      setIsLoading(true)

      const filters = useFilters
        ? {
            dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
            dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
            transactionType,
            categoryId,
            accountId,
            year,
          }
        : {}

      await exportData(exportType, exportFormat, filters)

      toast({
        title: "Exportação concluída",
        description: `Seus dados foram exportados com sucesso no formato ${exportFormat.toUpperCase()}.`,
      })
      onClose()
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Dados</DialogTitle>
          <DialogDescription>Escolha o tipo de dados e o formato para exportação.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="export-type">Tipo de Dados</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger id="export-type">
                <SelectValue placeholder="Selecione o tipo de dados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactions">Transações</SelectItem>
                <SelectItem value="accounts">Contas</SelectItem>
                <SelectItem value="categories">Categorias</SelectItem>
                <SelectItem value="goals">Metas Financeiras</SelectItem>
                <SelectItem value="monthly">Resumo Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="export-format">Formato</Label>
            <RadioGroup
              id="export-format"
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as "csv" | "pdf")}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="use-filters" checked={useFilters} onCheckedChange={(checked) => setUseFilters(!!checked)} />
            <Label htmlFor="use-filters">Usar filtros</Label>
          </div>

          {useFilters && (
            <div className="grid gap-4 mt-2">
              {exportType === "monthly" ? (
                <div className="grid gap-2">
                  <Label htmlFor="year">Ano</Label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date-from">Data Inicial</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-from"
                            variant={"outline"}
                            className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="date-to">Data Final</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-to"
                            variant={"outline"}
                            className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {exportType === "transactions" && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="transaction-type">Tipo de Transação</Label>
                        <Select value={transactionType || ""} onValueChange={setTransactionType}>
                          <SelectTrigger id="transaction-type">
                            <SelectValue placeholder="Todos os tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            <SelectItem value="INCOME">Receitas</SelectItem>
                            <SelectItem value="EXPENSE">Despesas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={categoryId || ""} onValueChange={setCategoryId}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Todas as categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="account">Conta</Label>
                        <Select value={accountId || ""} onValueChange={setAccountId}>
                          <SelectTrigger id="account">
                            <SelectValue placeholder="Todas as contas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as contas</SelectItem>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Exportando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
