"use client";

import { logger } from "@/lib/utils/logger";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useToast } from "@/hooks/use-toast";
import { updateTransaction } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { getAccounts } from "@/app/actions/accounts";
import { Switch } from "@/components/ui/switch";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onSuccess?: () => void;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Função utilitária para converter data para formato local sem problemas de timezone
const formatDateToLocal = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    type: transaction.type || "EXPENSE",
    amount: (transaction.amount / 100)?.toString() || "",
    description: transaction.description || "",
    category_id: transaction.category_id || "",
    account_id: transaction.account_id || "",
    date: transaction.date
      ? formatDateToLocal(transaction.date)
      : new Date().toISOString().split("T")[0],
    notes: transaction.notes || "",
    is_recurring: transaction.is_recurring || false,
    recurring_interval: transaction.recurring_interval || null,
    installment_number: transaction.installment_number || "1",
    total_installments: transaction.total_installments || null,
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (transaction && open) {
      setFormData({
        type: transaction.type || "EXPENSE",
        amount: (transaction.amount / 100)?.toString() || "",
        description: transaction.description || "",
        category_id: transaction.category_id || "",
        account_id: transaction.account_id || "",
        date: transaction.date
          ? formatDateToLocal(transaction.date)
          : new Date().toISOString().split("T")[0],
        notes: transaction.notes || "",
        is_recurring: transaction.is_recurring || false,
        recurring_interval: transaction.recurring_interval || null,
        installment_number: transaction.installment_number || "1",
        total_installments: transaction.total_installments || null,
      });
    }
  }, [transaction, open]);

  async function fetchData() {
    try {
      const [categoriesData, accountsData] = await Promise.all([
        getCategories(),
        getAccounts(),
      ]);

      setCategories(categoriesData);
      setAccounts(accountsData);
    } catch (error) {
      logger.error("Erro ao carregar dados:", error as Error);
      toast({
        title: "Erro",
        description: "Falha ao carregar categorias e contas",
        variant: "destructive",
      });
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (value: number | null) => {
    setFormData((prev) => ({ ...prev, amount: value?.toString() || "" }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (!formData.amount || Number(formData.amount) <= 0) {
        throw new Error("O valor da transação deve ser maior que zero");
      }

      if (!formData.description.trim()) {
        throw new Error("A descrição é obrigatória");
      }

      if (!formData.account_id) {
        throw new Error("Selecione uma conta");
      }

      // Corrigir o fuso horário da data
      const [year, month, day] = formData.date.split("-").map(Number);
      // Cria a data como meia-noite no horário de Brasília (UTC-3)
      const brasiliaDate = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));

      // Formatar recurring_interval se existir
      let formattedRecurringInterval = null;
      if (formData.is_recurring && formData.recurring_interval) {
        const [intervalYear, intervalMonth] = formData.recurring_interval
          .split("-")
          .map(Number);
        formattedRecurringInterval = new Date(
          Date.UTC(intervalYear, intervalMonth - 1, 1, 3, 0, 0)
        ).toISOString();
      }

      const updatedTransaction = {
        ...formData,
        amount: Math.round(Number(formData.amount) * 100),
        date: brasiliaDate.toISOString(),
        type: formData.type as "EXPENSE" | "INCOME",
        recurring_interval: formData.is_recurring
          ? formattedRecurringInterval || null
          : null,
      };

      const result = await updateTransaction(
        transaction.id,
        updatedTransaction
      );

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso",
          variant: "success",
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Falha ao atualizar transação");
      }
    } catch (error) {
      logger.error("Erro ao atualizar transação:", error as Error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao atualizar transação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da transação selecionada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                  defaultValue={formData.type}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <CurrencyInput
                  id="amount"
                  name="amount"
                  value={formData.amount ? Number(formData.amount) : 0}
                  onValueChange={handleCurrencyChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    handleSelectChange("category_id", value)
                  }
                  required
                  defaultValue={formData.category_id}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2 hidden">
              <Label htmlFor="account">Conta</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  handleSelectChange("account_id", value)
                }
                required
                defaultValue={formData.account_id}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (Opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) =>
                  handleSwitchChange("is_recurring", checked)
                }
              />
              <Label htmlFor="is_recurring">Transação Recorrente</Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring_interval">
                  Data da Finalização da Recorrência
                </Label>
                <Input
                  id="recurring_interval"
                  name="recurring_interval"
                  type="month"
                  value={formData.recurring_interval || ""}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Atualizando..." : "Atualizar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

