"use client";

import { History, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InvestmentDialog } from "@/components/investment-dialog";
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
import {
  useCreateInvestmentTransactionMutation,
  useDeleteInvestmentMutation,
  useInvestmentTransactionsQuery,
} from "@/lib/api/investments";
import type { Investment, InvestmentTransactionType } from "@/lib/types/investments";

const MOVEMENT_LABELS: Record<InvestmentTransactionType, string> = {
  aporte: "Aporte",
  resgate: "Resgate",
  rendimento: "Rendimento",
  taxa: "Taxa",
};

export function InvestmentRowActions({ investment }: { investment: Investment }) {
  const [movementOpen, setMovementOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [type, setType] = useState<InvestmentTransactionType>("aporte");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const movement = useCreateInvestmentTransactionMutation();
  const remove = useDeleteInvestmentMutation();
  const history = useInvestmentTransactionsQuery({ investment_id: investment.id });

  async function submitMovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount <= 0) {
      toast.error("Informe um valor maior que zero");
      return;
    }
    try {
      await movement.mutateAsync({
        investment_id: investment.id,
        type,
        amount,
        description: description.trim() || undefined,
        transaction_date: date,
      });
      toast.success("Movimentação registrada");
      setMovementOpen(false);
      setAmount(0);
      setDescription("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível registrar a movimentação"
      );
    }
  }

  async function deleteInvestment() {
    if (!window.confirm(`Excluir ${investment.name}?`)) return;
    try {
      await remove.mutateAsync(investment.id);
      toast.success("Investimento excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir o investimento"
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <InvestmentDialog investment={investment}>
        <Button variant="ghost" size="icon" aria-label="Editar investimento">
          <Pencil className="h-4 w-4" />
        </Button>
      </InvestmentDialog>
      <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Registrar movimentação">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova movimentação</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitMovement} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as InvestmentTransactionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MOVEMENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <CurrencyInput value={amount} onValueChange={(value) => setAmount(value ?? 0)} />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <Button className="w-full" type="submit" disabled={movement.isPending}>
              {movement.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Ver histórico">
            <History className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico — {investment.name}</DialogTitle>
          </DialogHeader>
          {history.isLoading && <p>Carregando...</p>}
          {history.error && (
            <p className="text-destructive">Não foi possível carregar o histórico.</p>
          )}
          <div className="max-h-72 space-y-2 overflow-auto">
            {(history.data ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <span>
                  {MOVEMENT_LABELS[item.type]} · {item.transaction_date}
                </span>
                <span>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    item.amount
                  )}
                </span>
              </div>
            ))}
            {!history.isLoading && !history.error && (history.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Excluir investimento"
        onClick={deleteInvestment}
        disabled={remove.isPending}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
