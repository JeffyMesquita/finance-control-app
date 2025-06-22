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
import { CurrencyInput } from "@/components/ui/currency-input";
import { useToast } from "@/hooks/use-toast";
import { createGoal, updateGoal } from "@/app/actions/goals";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { getSavingsBoxes } from "@/app/actions/savings-boxes";

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

type SavingsBox = {
  id: string;
  name: string;
  current_amount: number;
  color: string;
  icon: string;
};

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  category_id: string | null;
  account_id: string;
  savings_box_id: string | null;
  is_completed: boolean;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
};

type FormData = {
  name: string;
  target_amount: string;
  current_amount: string;
  start_date: string;
  target_date: string;
  category_id: string;
  savings_box_id: string;
};

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  onSuccess?: () => void;
}

// Função utilitária para obter a data atual local
const getCurrentLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Função para obter data 90 dias no futuro
const getFutureDate = (days: number = 90) => {
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const year = future.getFullYear();
  const month = String(future.getMonth() + 1).padStart(2, "0");
  const day = String(future.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const INITIAL_FORM_DATA: FormData = {
  name: "",
  target_amount: "",
  current_amount: "0",
  start_date: getCurrentLocalDate(),
  target_date: getFutureDate(),
  category_id: "",
  savings_box_id: "",
};

export function GoalDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: GoalDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingsBoxes, setSavingsBoxes] = useState<SavingsBox[]>([]);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const isEditing = !!goal;

  useEffect(() => {
    if (open) {
      fetchData();

      if (goal) {
        // Formato das datas para input
        const startDate = new Date(goal.start_date).toISOString().split("T")[0];
        const targetDate = new Date(goal.target_date)
          .toISOString()
          .split("T")[0];

        setFormData({
          name: goal.name,
          target_amount: (goal.target_amount / 100).toString(),
          current_amount: (goal.current_amount / 100).toString(),
          start_date: startDate,
          target_date: targetDate,
          category_id: goal.category_id || "",
          savings_box_id: goal.savings_box_id || "",
        });
      } else {
        // Reset form para nova meta
        setFormData(INITIAL_FORM_DATA);
      }
    }
  }, [open, goal]);

  async function fetchData() {
    try {
      const [accountsData, categoriesData, savingsBoxesData] =
        await Promise.all([getAccounts(), getCategories(), getSavingsBoxes()]);
      setAccounts(accountsData);
      setCategories(categoriesData.filter((c) => c.type === "EXPENSE"));
      setSavingsBoxes(savingsBoxesData);
    } catch (error) {
      logger.error("Erro ao carregar dados:", error as Error);
      toast({
        title: "Erro ao Carregar",
        description:
          "Não foi possível carregar as contas, categorias e cofrinhos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange =
    (field: "target_amount" | "current_amount") => (value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value?.toString() || "",
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (!formData.name.trim()) {
        throw new Error("O nome da meta é obrigatório");
      }

      if (!formData.target_amount || Number(formData.target_amount) <= 0) {
        throw new Error("O valor da meta deve ser maior que zero");
      }

      if (!accounts[0]?.id) {
        throw new Error("Nenhuma conta disponível");
      }

      if (new Date(formData.target_date) <= new Date(formData.start_date)) {
        throw new Error("A data alvo deve ser posterior à data de início");
      }

      // Formatar os dados
      const goalData = {
        name: formData.name.trim(),
        target_amount: Number.parseFloat(formData.target_amount),
        current_amount: Number.parseFloat(formData.current_amount),
        start_date: new Date(formData.start_date).toISOString(),
        target_date: new Date(formData.target_date).toISOString(),
        category_id: formData.category_id || null,
        account_id: accounts[0].id, // Sempre usa a primeira conta
        savings_box_id: formData.savings_box_id || null,
      };

      let result;

      if (isEditing) {
        result = await updateGoal(goal.id, goalData);
      } else {
        result = await createGoal(goalData);
      }

      if (result.success) {
        toast({
          title: isEditing ? "Meta Atualizada" : "Meta Criada",
          description: isEditing
            ? "Sua meta financeira foi atualizada com sucesso."
            : "Sua meta financeira foi criada com sucesso e já está disponível no dashboard.",
          variant: "success",
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Falha ao processar meta");
      }
    } catch (error) {
      logger.error("Erro ao processar meta:", error as Error);
      toast({
        title: isEditing ? "Erro ao Atualizar" : "Erro ao Criar",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível processar sua meta financeira. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Meta Financeira" : "Nova Meta Financeira"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize os detalhes da sua meta financeira."
                : "Defina uma nova meta financeira para acompanhar o progresso das suas economias."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nome da Meta */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Viagem para Europa"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount">Valor Alvo</Label>
                <CurrencyInput
                  id="target_amount"
                  name="target_amount"
                  placeholder="R$ 0,00"
                  value={
                    formData.target_amount ? Number(formData.target_amount) : 0
                  }
                  onValueChange={handleCurrencyChange("target_amount")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_amount">Valor Atual</Label>
                <CurrencyInput
                  id="current_amount"
                  name="current_amount"
                  placeholder="R$ 0,00"
                  value={
                    formData.current_amount
                      ? Number(formData.current_amount)
                      : 0
                  }
                  onValueChange={handleCurrencyChange("current_amount")}
                  required
                />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_date">Data Alvo</Label>
                <Input
                  id="target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Conta */}
            <div className="space-y-2 hidden">
              <Label htmlFor="account">Conta</Label>
              <Select
                value={accounts[0]?.id || ""}
                onValueChange={() => {}} // Select está oculto, não precisa fazer nada
                required
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecione uma conta" />
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

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria (Opcional)</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) =>
                  handleSelectChange(
                    "category_id",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cofrinho */}
            <div className="space-y-2">
              <Label htmlFor="savings_box">Cofrinho (Opcional)</Label>
              <Select
                value={formData.savings_box_id || "none"}
                onValueChange={(value) =>
                  handleSelectChange(
                    "savings_box_id",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger id="savings_box">
                  <SelectValue placeholder="Selecione um cofrinho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {savingsBoxes.map((box) => (
                    <SelectItem key={box.id} value={box.id}>
                      {box.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Atualizando..."
                  : "Criando..."
                : isEditing
                  ? "Atualizar Meta"
                  : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

