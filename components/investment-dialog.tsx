"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { createInvestment } from "@/app/actions/investments";
import {
  INVESTMENT_CATEGORIES,
  InvestmentCategory,
  Investment,
} from "@/lib/types/investments";
import { toast } from "sonner";

interface InvestmentDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  investment?: Investment | null;
  onSuccess?: () => void;
}

export function InvestmentDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  investment,
  onSuccess,
}: InvestmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "" as InvestmentCategory,
    description: "",
    initial_amount: 0,
    target_amount: 0,
    investment_date: new Date().toISOString().split("T")[0],
  });

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name,
        category: investment.category,
        description: investment.description || "",
        initial_amount: investment.initial_amount,
        target_amount: investment.target_amount || 0,
        investment_date: investment.investment_date,
      });
    } else {
      setFormData({
        name: "",
        category: "" as InvestmentCategory,
        description: "",
        initial_amount: 0,
        target_amount: 0,
        investment_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome do investimento é obrigatório");
      return;
    }

    if (!formData.category) {
      toast.error("Categoria é obrigatória");
      return;
    }

    if (formData.initial_amount <= 0) {
      toast.error("Valor inicial deve ser maior que zero");
      return;
    }

    setLoading(true);

    try {
      // Por enquanto apenas criação - edição será implementada futuramente
      const result = await createInvestment({
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        initial_amount: formData.initial_amount,
        target_amount:
          formData.target_amount > 0 ? formData.target_amount : undefined,
        investment_date: formData.investment_date,
      });

      if (result.success) {
        toast.success(
          investment
            ? "Investimento atualizado com sucesso!"
            : "Investimento criado com sucesso!"
        );
        setOpen(false);
        setFormData({
          name: "",
          category: "" as InvestmentCategory,
          description: "",
          initial_amount: 0,
          target_amount: 0,
          investment_date: new Date().toISOString().split("T")[0],
        });
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao criar investimento");
      }
    } catch (error) {
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {investment ? "Editar Investimento" : "Novo Investimento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Investimento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Tesouro Direto, Ações PETR4..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value: InvestmentCategory) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INVESTMENT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_amount">Valor Inicial</Label>
              <CurrencyInput
                value={formData.initial_amount}
                onValueChange={(value) =>
                  setFormData({ ...formData, initial_amount: value || 0 })
                }
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_amount">Meta (Opcional)</Label>
              <CurrencyInput
                value={formData.target_amount}
                onValueChange={(value) =>
                  setFormData({ ...formData, target_amount: value || 0 })
                }
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment_date">Data do Investimento</Label>
            <Input
              id="investment_date"
              type="date"
              value={formData.investment_date}
              onChange={(e) =>
                setFormData({ ...formData, investment_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Observações sobre este investimento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? investment
                  ? "Salvando..."
                  : "Criando..."
                : investment
                  ? "Salvar Alterações"
                  : "Criar Investimento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
