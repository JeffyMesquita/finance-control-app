"use client";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  depositToSavingsBox,
  withdrawFromSavingsBox,
} from "@/app/actions/savings-transactions";
import { getAccounts } from "@/app/actions/accounts";
import type { SavingsBox } from "@/lib/types/savings-boxes";
import type { SavingsTransactionType } from "@/lib/types/savings-boxes";
import { Plus, Minus, Wallet, PiggyBank } from "lucide-react";

const formSchema = z.object({
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  source_account_id: z.string().optional(),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SavingsTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsBox: SavingsBox;
  transactionType: SavingsTransactionType;
  onSuccess?: () => void;
}

export function SavingsTransactionDialog({
  open,
  onOpenChange,
  savingsBox,
  transactionType,
  onSuccess,
}: SavingsTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const isDeposit = transactionType === "DEPOSIT";
  const isWithdraw = transactionType === "WITHDRAW";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      source_account_id: "",
      description: "",
    },
  });

  // Carregar contas quando o dialog abre
  useEffect(() => {
    if (open) {
      loadAccounts();
    }
  }, [open]);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const result = await getAccounts();
      if (result.success && result.data) {
        setAccounts(result.data || []);
      } else {
        toast.error("Erro ao carregar contas");
        setAccounts([]);
      }
    } catch (error) {
      toast.error("Erro ao carregar contas");
      setAccounts([]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let result;

      if (isDeposit) {
        result = await depositToSavingsBox(
          savingsBox.id,
          data.amount,
          data.source_account_id || undefined,
          data.description || undefined
        );
      } else {
        result = await withdrawFromSavingsBox(
          savingsBox.id,
          data.amount,
          data.source_account_id || undefined,
          data.description || undefined
        );
      }

      if (result.success) {
        toast.success(
          isDeposit
            ? `Depósito de R$ ${data.amount.toFixed(2)} realizado com sucesso!`
            : `Saque de R$ ${data.amount.toFixed(2)} realizado com sucesso!`
        );
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  const selectedAccount = accounts.find(
    (acc) => acc.id === form.watch("source_account_id")
  );
  const currentAmount = (savingsBox.current_amount || 0) / 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDeposit ? (
              <>
                <Plus className="h-5 w-5 text-green-600" />
                Depósito
              </>
            ) : (
              <>
                <Minus className="h-5 w-5 text-red-600" />
                Saque
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDeposit
              ? `Depositar dinheiro no cofrinho "${savingsBox.name}"`
              : `Sacar dinheiro do cofrinho "${savingsBox.name}"`}
          </DialogDescription>
        </DialogHeader>

        {/* Info do cofrinho */}
        <div className="rounded-lg border p-3 bg-muted/50">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm"
              style={{ backgroundColor: savingsBox.color || "#3B82F6" }}
            >
              <PiggyBank className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{savingsBox.name}</div>
              <div className="text-sm text-muted-foreground">
                Saldo atual: R${" "}
                {currentAmount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Valor */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  {isWithdraw && currentAmount > 0 && (
                    <FormDescription>
                      Máximo disponível: R${" "}
                      {currentAmount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conta */}
            <FormField
              control={form.control}
              name="source_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isDeposit ? "Origem (Conta)" : "Destino (Conta)"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingAccounts
                              ? "Carregando contas..."
                              : "Selecione uma conta (opcional)"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{account.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Saldo: R${" "}
                                {((account.balance || 0) / 100)?.toLocaleString(
                                  "pt-BR",
                                  {
                                    minimumFractionDigits: 2,
                                  }
                                ) || "0,00"}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isDeposit
                      ? "Conta de onde o dinheiro será debitado (opcional)"
                      : "Conta para onde o dinheiro será creditado (opcional)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Validação de saldo para depósito */}
            {isDeposit && selectedAccount && form.watch("amount") && (
              <div className="text-sm">
                {selectedAccount.balance / 100 < form.watch("amount") ? (
                  <div className="text-red-600 bg-red-50 p-2 rounded">
                    ⚠️ Saldo insuficiente na conta selecionada
                  </div>
                ) : (
                  <div className="text-green-600 bg-green-50 p-2 rounded">
                    ✓ Saldo suficiente na conta selecionada
                  </div>
                )}
              </div>
            )}

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isDeposit
                          ? "Motivo do depósito (opcional)"
                          : "Motivo do saque (opcional)"
                      }
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={
                  isDeposit
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isSubmitting
                  ? isDeposit
                    ? "Depositando..."
                    : "Sacando..."
                  : isDeposit
                    ? "Confirmar Depósito"
                    : "Confirmar Saque"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
