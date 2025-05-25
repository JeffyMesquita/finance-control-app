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
import { createTransaction } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { getAccounts } from "@/app/actions/accounts";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Category = {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
};

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTransactionDialogProps) {
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
    date: new Date().toISOString().split("T")[0],
    notes: "",
    is_recurring: false,
    installment_number: "1",
  });

  useEffect(() => {
    if (open) {
      fetchData();
      // Reset form when dialog opens
      setFormData({
        type: "EXPENSE",
        amount: "",
        description: "",
        category_id: "",
        account_id: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        is_recurring: false,
        installment_number: "1",
      });
    }
  }, [open]);

  async function fetchData() {
    try {
      const [categoriesData, accountsData] = await Promise.all([
        getCategories(),
        getAccounts(),
      ]);
      setCategories(categoriesData);
      setAccounts(accountsData);

      console.log(categoriesData);
      console.log(accountsData);

      // Set default account if available
      if (accountsData.length > 0) {
        setFormData((prev) => ({ ...prev, account_id: accountsData[0].id }));
      }
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

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
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

      // Criar transação base
      const baseTransaction = {
        ...formData,
        amount: Number(formData.amount) * 100,
        date: brasiliaDate.toISOString(),
      };

      // Se for parcelado, criar múltiplas transações
      if (
        formData.type === "EXPENSE" &&
        Number(formData.installment_number) > 1
      ) {
        const installments = Number(formData.installment_number);
        const installmentAmount = Math.floor(
          (Number(formData.amount) * 100) / installments
        );
        const remainder = (Number(formData.amount) * 100) % installments;

        const installmentPromises = [];

        for (let i = 0; i < installments; i++) {
          // Calcular a data da parcela (mesmo dia em meses subsequentes)
          const installmentDate = new Date(brasiliaDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          // Ajustar o valor da última parcela para incluir o resto da divisão
          const amount =
            i === installments - 1
              ? installmentAmount + remainder
              : installmentAmount;

          const installmentTransaction = {
            ...baseTransaction,
            type: baseTransaction.type as "EXPENSE" | "INCOME",
            description: `${baseTransaction.description} (${
              i + 1
            }/${installments})`,
            date: installmentDate.toISOString(),
            is_recurring: false,
            installment_number: i + 1,
            total_installments: installments,
          };

          installmentPromises.push(createTransaction(installmentTransaction));
        }

        const results = await Promise.all(installmentPromises);
        const hasError = results.some((result) => !result.success);

        if (hasError) {
          throw new Error("Ocorreu um erro ao criar algumas parcelas");
        }

        toast({
          title: "Sucesso",
          description: `Transação parcelada em ${installments}x criada com sucesso`,
        });
      } else {
        // Transação única (não parcelada)
        const transaction = {
          ...baseTransaction,
          amount: Number(baseTransaction.amount),
          installment_number: null,
          total_installments: null,
          type: baseTransaction.type as "EXPENSE" | "INCOME",
        };

        const result = await createTransaction(transaction);

        if (result.success) {
          toast({
            title: "Transação Criada",
            description:
              "Sua transação foi registrada com sucesso e já está disponível no histórico.",
            variant: "success",
          });
          onSuccess();
          onOpenChange(false);
        } else {
          throw new Error(result.error || "Falha ao criar transação");
        }
      }
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast({
        title: "Erro ao Criar",
        description:
          "Não foi possível registrar a transação. Tente novamente mais tarde.",
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
            <DialogTitle>Adicionar Transação</DialogTitle>
            <DialogDescription>
              Adicione uma nova transação aos seus registros financeiros.
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
                  defaultValue={categories[0]?.id || ""}
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
                defaultValue={accounts[0]?.id || ""}
                required
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

            {formData.type === "EXPENSE" && (
              <div className="space-y-2">
                <Label htmlFor="installment_number">Parcelas</Label>
                <Select
                  value={formData.installment_number}
                  onValueChange={(value) =>
                    handleSelectChange("installment_number", value)
                  }
                >
                  <SelectTrigger id="installments">
                    <SelectValue placeholder="Selecione o número de parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x (à vista)</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="3">3x</SelectItem>
                    <SelectItem value="4">4x</SelectItem>
                    <SelectItem value="5">5x</SelectItem>
                    <SelectItem value="6">6x</SelectItem>
                    <SelectItem value="7">7x</SelectItem>
                    <SelectItem value="8">8x</SelectItem>
                    <SelectItem value="9">9x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="11">11x</SelectItem>
                    <SelectItem value="12">12x</SelectItem>
                    <SelectItem value="18">18x</SelectItem>
                    <SelectItem value="24">24x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
              {isSubmitting ? "Adicionando..." : "Adicionar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
