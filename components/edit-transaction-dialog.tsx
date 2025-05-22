"use client";

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
    type: "EXPENSE",
    amount: "",
    description: "",
    category_id: "",
    account_id: "",
    date: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (transaction && open) {
      // Converter a data para o formato local
      const date = new Date(transaction.date);
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      setFormData({
        type: transaction.type || "EXPENSE",
        amount: (transaction.amount / 100)?.toString() || "",
        description: transaction.description || "",
        category_id: transaction.category_id || "",
        account_id: transaction.account_id || "",
        date: localDate,
        notes: transaction.notes || "",
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
      console.error("Erro ao carregar dados:", error);
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

      console.log(formData.amount);

      const updatedTransaction = {
        ...formData,
        amount: Number(formData.amount) * 100,
        date: brasiliaDate.toISOString(),
        type: formData.type as "EXPENSE" | "INCOME",
      };

      const result = await updateTransaction(
        transaction.id,
        updatedTransaction
      );

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso",
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error || "Falha ao atualizar transação");
      }
    } catch (error: unknown) {
      console.error("Erro ao atualizar transação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Falha ao atualizar transação",
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
            <div className="space-y-2">
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
