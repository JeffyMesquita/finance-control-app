"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowRightLeft, PiggyBank } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
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
import type { SavingsBox } from "@/lib/types/savings-boxes";
import { useSavingsBoxesQuery } from "@/useCases/savings-boxes/useSavingsBoxesQuery";
import { useSavingsTransactionMutation } from "@/useCases/savings-boxes/useSavingsTransactionMutation";

const formSchema = z.object({
  to_box_id: z.string().min(1, "Selecione o cofrinho de destino"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SavingsTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromSavingsBox: SavingsBox;
  onSuccess?: () => void;
}

export function SavingsTransferDialog({
  open,
  onOpenChange,
  fromSavingsBox,
  onSuccess,
}: SavingsTransferDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBoxes, setAvailableBoxes] = useState<SavingsBox[]>([]);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(false);
  const transferMutation = useSavingsTransactionMutation("transfers");
  const boxesQuery = useSavingsBoxesQuery();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to_box_id: "",
      amount: undefined,
      description: "",
    },
  });

  const loadSavingsBoxes = useCallback(async () => {
    setIsLoadingBoxes(true);
    try {
      const result = await boxesQuery.refetch();
      const filtered = (result.data ?? []).filter(
        (box) => box.id !== fromSavingsBox.id && box.is_active
      );
      setAvailableBoxes(filtered as SavingsBox[]);
    } catch {
      toast.error("Erro ao carregar cofrinhos");
      setAvailableBoxes([]);
    } finally {
      setIsLoadingBoxes(false);
    }
  }, [boxesQuery.refetch, fromSavingsBox.id]);

  // Carregar cofrinhos quando o dialog abre
  useEffect(() => {
    if (open) {
      void loadSavingsBoxes();
    }
  }, [open, loadSavingsBoxes]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await transferMutation.mutateAsync({
        boxId: fromSavingsBox.id,
        target_savings_box_id: data.to_box_id,
        amount: data.amount,
        description: data.description || null,
      });

      if (result) {
        const destinationBox = availableBoxes.find((box) => box.id === data.to_box_id);
        toast.success(
          `Transferência de R$ ${data.amount.toFixed(2)} para "${
            destinationBox?.name
          }" realizada com sucesso!`
        );
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      }
    } catch {
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

  const selectedDestinationBox = availableBoxes.find((box) => box.id === form.watch("to_box_id"));
  const currentAmount = (fromSavingsBox.current_amount || 0) / 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            Transferir entre Cofrinhos
          </DialogTitle>
          <DialogDescription>
            Transfira dinheiro do cofrinho "{fromSavingsBox.name}" para outro cofrinho
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da transferência */}
        <div className="space-y-3">
          {/* Cofrinho de origem */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="text-sm text-muted-foreground mb-2">De:</div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm"
                style={{ backgroundColor: fromSavingsBox.color || "#3B82F6" }}
              >
                <PiggyBank className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">{fromSavingsBox.name}</div>
                <div className="text-sm text-muted-foreground">
                  Saldo disponível: R${" "}
                  {currentAmount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Cofrinho de destino (preview) */}
          {selectedDestinationBox && (
            <div className="rounded-lg border p-3 bg-green-50">
              <div className="text-sm text-muted-foreground mb-2">Para:</div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm"
                  style={{
                    backgroundColor: selectedDestinationBox.color || "#3B82F6",
                  }}
                >
                  <PiggyBank className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{selectedDestinationBox.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Saldo atual: R${" "}
                    {((selectedDestinationBox.current_amount || 0) / 100).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Cofrinho de destino */}
            <FormField
              control={form.control}
              name="to_box_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cofrinho de Destino *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingBoxes
                              ? "Carregando cofrinhos..."
                              : "Selecione o cofrinho de destino"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBoxes.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Nenhum outro cofrinho disponível
                        </div>
                      ) : (
                        availableBoxes.map((box) => (
                          <SelectItem key={box.id} value={box.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: box.color || "#3B82F6",
                                }}
                              />
                              <div>
                                <div className="font-medium">{box.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  R${" "}
                                  {((box.current_amount || 0) / 100).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                  {box.target_amount && (
                                    <span>
                                      {" "}
                                      / R${" "}
                                      {(box.target_amount / 100).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>
                    Máximo disponível: R${" "}
                    {currentAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Validação de saldo */}
            {form.watch("amount") && currentAmount > 0 && (
              <div className="text-sm">
                {form.watch("amount") > currentAmount ? (
                  <div className="text-red-600 bg-red-50 p-2 rounded">
                    ⚠️ Valor maior que o saldo disponível
                  </div>
                ) : (
                  <div className="text-green-600 bg-green-50 p-2 rounded">
                    ✓ Valor válido para transferência
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
                      placeholder="Motivo da transferência (opcional)"
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
                disabled={isSubmitting || availableBoxes.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Transferindo..." : "Confirmar Transferência"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
