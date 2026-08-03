"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateInvestmentMutation, useUpdateInvestmentMutation } from "@/lib/api/investments";
import {
  INVESTMENT_CATEGORIES,
  type Investment,
  type InvestmentCategory,
} from "@/lib/types/investments";

interface InvestmentDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  investment?: Investment | null;
  onSuccess?: () => void;
}

const emptyForm = () => ({
  name: "",
  category: "" as InvestmentCategory,
  description: "",
  initial_amount: 0,
  target_amount: 0,
  investment_date: new Date().toISOString().slice(0, 10),
});

export function InvestmentDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  investment,
  onSuccess,
}: InvestmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [formData, setFormData] = useState(emptyForm);
  const createMutation = useCreateInvestmentMutation();
  const updateMutation = useUpdateInvestmentMutation();
  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (investment)
      setFormData({
        name: investment.name,
        category: investment.category,
        description: investment.description ?? "",
        initial_amount: investment.initial_amount,
        target_amount: investment.target_amount ?? 0,
        investment_date: investment.investment_date,
      });
    else setFormData(emptyForm());
  }, [investment]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.category ||
      (!investment && formData.initial_amount <= 0)
    ) {
      toast.error("Preencha nome, categoria e valor inicial maior que zero");
      return;
    }
    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim() || undefined,
      target_amount: formData.target_amount > 0 ? formData.target_amount : undefined,
      investment_date: formData.investment_date,
    };
    try {
      if (investment) await updateMutation.mutateAsync({ id: investment.id, ...payload });
      else
        await createMutation.mutateAsync({ ...payload, initial_amount: formData.initial_amount });
      toast.success(investment ? "Investimento atualizado" : "Investimento criado");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o investimento"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{investment ? "Editar Investimento" : "Novo Investimento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investment-name">Nome</Label>
            <Input
              id="investment-name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as InvestmentCategory })
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
              <Label>Valor inicial</Label>
              <CurrencyInput
                value={formData.initial_amount}
                onValueChange={(value) => setFormData({ ...formData, initial_amount: value ?? 0 })}
                disabled={Boolean(investment)}
              />
            </div>
            <div className="space-y-2">
              <Label>Meta (opcional)</Label>
              <CurrencyInput
                value={formData.target_amount}
                onValueChange={(value) => setFormData({ ...formData, target_amount: value ?? 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={formData.investment_date}
              onChange={(event) =>
                setFormData({ ...formData, investment_date: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
