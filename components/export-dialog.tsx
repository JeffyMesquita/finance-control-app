"use client";

import { logger } from "@/lib/utils/logger";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  getTransactionsForExport,
  getAccountsForExport,
  getCategoriesForExport,
  getGoalsForExport,
  getMonthlySummaryForExport,
} from "@/app/actions/export";
import { convertToCSV, downloadCSV, generatePDF } from "@/lib/export-utils";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  accounts: any[];
}

export function ExportDialog({
  open,
  onOpenChange,
  categories,
  accounts,
}: ExportDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState("transactions");
  const [fileFormat, setFileFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("all");
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [transactionType, setTransactionType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [includeNotes, setIncludeNotes] = useState(true);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      let data = [];
      let headers = [];
      let fields = [];
      let title = "";
      let filename = "";

      // Get data based on export type
      switch (exportType) {
        case "transactions":
          data = await getTransactionsForExport(
            dateRange !== "all" ? dateFrom : undefined,
            dateRange !== "all" ? dateTo : undefined,
            transactionType !== "all" ? transactionType : undefined,
            selectedCategory || undefined,
            selectedAccount || undefined
          );

          headers = [
            "Data",
            "Descrição",
            "Categoria",
            "Conta",
            "Tipo",
            "Valor",
            ...(includeNotes ? ["Observações"] : []),
          ];

          fields = [
            "date",
            "description",
            "category.name",
            "account.name",
            "type",
            "amount",
            ...(includeNotes ? ["notes"] : []),
          ];

          title = "Exportação de Transações";
          filename = `transacoes_${new Date().toISOString().split("T")[0]}`;
          break;

        case "accounts":
          data = await getAccountsForExport();
          headers = ["Nome da Conta", "Tipo", "Saldo", "Moeda"];
          fields = ["name", "type", "balance", "currency"];
          title = "Exportação de Contas";
          filename = `contas_${new Date().toISOString().split("T")[0]}`;
          break;

        case "categories":
          data = await getCategoriesForExport();
          headers = ["Nome da Categoria", "Tipo", "Cor"];
          fields = ["name", "type", "color"];
          title = "Exportação de Categorias";
          filename = `categorias_${new Date().toISOString().split("T")[0]}`;
          break;

        case "goals":
          data = await getGoalsForExport();
          headers = [
            "Nome da Meta",
            "Valor Alvo",
            "Valor Atual",
            "Progresso",
            "Data de Início",
            "Data Alvo",
            "Conta",
            "Status",
          ];
          fields = [
            "name",
            "target_amount",
            "current_amount",
            // Calculate progress percentage
            (item: { current_amount: number; target_amount: number }) =>
              `${Math.round(
                (item.current_amount / item.target_amount) * 100
              )}%`,
            "start_date",
            "target_date",
            "account.name",
            (item: { is_completed: boolean }) =>
              item.is_completed ? "Concluído" : "Em Andamento",
          ];
          title = "Exportação de Metas Financeiras";
          filename = `metas_${new Date().toISOString().split("T")[0]}`;
          break;

        case "monthly_summary":
          data = await getMonthlySummaryForExport();
          headers = ["Mês", "Receitas", "Despesas", "Economia"];
          fields = ["month", "income", "expenses", "savings"];
          title = "Resumo Mensal";
          filename = `resumo_mensal_${new Date().toISOString().split("T")[0]}`;
          break;
      }

      // Generate export file
      if (fileFormat === "csv") {
        const csvContent = convertToCSV(data, headers, fields);
        downloadCSV(csvContent, `${filename}.csv`);
      } else {
        generatePDF(
          data,
          headers,
          fields,
          title,
          `${filename}.pdf`,
          exportType === "transactions" ? "landscape" : "portrait"
        );
      }

      toast({
        title: "Sucesso",
        description: `Seus dados foram exportados com sucesso no formato ${fileFormat.toUpperCase()}.`,
        variant: "success",
      });

      onOpenChange(false);
    } catch (error) {
      logger.error("Erro ao exportar dados:", error as Error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao exportar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Exportar Dados Financeiros</DialogTitle>
          <DialogDescription>
            Exporte seus dados financeiros em formato CSV ou PDF.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="transactions"
          onValueChange={(value) => setExportType(value)}
        >
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="monthly_summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <RadioGroup
                defaultValue="all"
                onValueChange={setDateRange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="date-all" />
                  <Label htmlFor="date-all">Todo o Período</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="date-custom" />
                  <Label htmlFor="date-custom">Período Personalizado</Label>
                </div>
              </RadioGroup>

              {dateRange === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-from">De</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-to">Até</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <Select defaultValue="all" onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="INCOME">Receitas</SelectItem>
                  <SelectItem value="EXPENSE">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as Categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta</Label>
                <Select
                  value={selectedAccount}
                  onValueChange={setSelectedAccount}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as Contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Contas</SelectItem>
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
              <Checkbox
                id="include-notes"
                checked={includeNotes}
                onCheckedChange={setIncludeNotes}
              />
              <Label htmlFor="include-notes">Incluir Observações</Label>
            </div>
          </TabsContent>

          <TabsContent value="accounts">
            <p className="text-sm text-muted-foreground mb-4">
              Exporte todas as suas contas financeiras com seus saldos atuais.
            </p>
          </TabsContent>

          <TabsContent value="categories">
            <p className="text-sm text-muted-foreground mb-4">
              Exporte todas as suas categorias de transações.
            </p>
          </TabsContent>

          <TabsContent value="goals">
            <p className="text-sm text-muted-foreground mb-4">
              Exporte todas as suas metas financeiras com seu progresso atual.
            </p>
          </TabsContent>

          <TabsContent value="monthly_summary">
            <p className="text-sm text-muted-foreground mb-4">
              Exporte um resumo mensal das suas receitas, despesas e economias.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Formato do Arquivo</Label>
          <RadioGroup
            defaultValue="csv"
            onValueChange={setFileFormat}
            className="flex space-x-4"
          >
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
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Exportando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

