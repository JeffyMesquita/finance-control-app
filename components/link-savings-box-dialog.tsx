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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSavingsBoxes } from "@/app/actions/savings-boxes";
import { updateGoal } from "@/app/actions/goals";
import {
  PiggyBank,
  Link2,
  Unlink,
  Target,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type SavingsBox = {
  id: string;
  name: string;
  current_amount: number;
  target_amount?: number;
  color: string;
  icon: string;
};

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  savings_box_id: string | null;
  savings_box?: {
    id: string;
    name: string;
    color: string;
  };
};

interface LinkSavingsBoxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSuccess?: () => void;
}

export function LinkSavingsBoxDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: LinkSavingsBoxDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingsBoxes, setSavingsBoxes] = useState<SavingsBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(true);

  const isCurrentlyLinked = !!goal?.savings_box_id;

  useEffect(() => {
    if (open && goal) {
      fetchSavingsBoxes();
      setSelectedBoxId(goal.savings_box_id || "none");
    }
  }, [open, goal]);

  const fetchSavingsBoxes = async () => {
    setIsLoading(true);
    try {
      const result = await getSavingsBoxes();
      if (result.success && result.data) {
        setSavingsBoxes(result.data || []);
      } else {
        setSavingsBoxes([]);
      }
    } catch (error) {
      logger.error("Erro ao carregar cofrinhos:", error as Error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar os cofrinhos disponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setIsSubmitting(true);

    try {
      const newSavingsBoxId = selectedBoxId === "none" ? null : selectedBoxId;

      // Se estamos vinculando a um cofrinho, sincronizar o valor atual
      let newCurrentAmount = goal.current_amount;
      if (newSavingsBoxId) {
        const selectedBox = savingsBoxes.find(
          (box) => box.id === newSavingsBoxId
        );
        if (selectedBox) {
          newCurrentAmount = selectedBox.current_amount;
        }
      }

      const result = await updateGoal(goal.id, {
        savings_box_id: newSavingsBoxId,
        current_amount: newCurrentAmount,
      });

      if (result.success) {
        const isLinking = !isCurrentlyLinked && newSavingsBoxId;
        const isUnlinking = isCurrentlyLinked && !newSavingsBoxId;
        const isChanging =
          isCurrentlyLinked &&
          newSavingsBoxId &&
          goal.savings_box_id !== newSavingsBoxId;

        let message = "";
        if (isLinking) {
          message = "Meta vinculada ao cofrinho com sucesso!";
        } else if (isUnlinking) {
          message = "Meta desvinculada do cofrinho com sucesso!";
        } else if (isChanging) {
          message = "Vinculação da meta atualizada com sucesso!";
        } else {
          message = "Nenhuma alteração realizada.";
        }

        toast({
          title: "Sucesso",
          description: message,
          variant: "success",
        });

        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Falha ao atualizar vinculação");
      }
    } catch (error) {
      logger.error("Erro ao atualizar vinculação:", error as Error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Falha ao atualizar vinculação da meta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Vincular Meta ao Cofrinho
            </DialogTitle>
            <DialogDescription>
              Vincule sua meta "{goal.name}" a um cofrinho para sincronizar
              automaticamente os valores e facilitar o controle das suas
              economias.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Atual */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{goal.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(goal.current_amount / 100)} de{" "}
                      {formatCurrency(goal.target_amount / 100)}
                    </p>
                  </div>
                  {isCurrentlyLinked ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Vinculada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <Unlink className="h-3 w-3 mr-1" />
                      Sem vínculo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cofrinho Atual (se vinculado) */}
            {isCurrentlyLinked && goal.savings_box && (
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: goal.savings_box.color }}
                    >
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Cofrinho Atual</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.savings_box.name}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seleção de Cofrinho */}
            <div className="space-y-3">
              <Label htmlFor="savings_box">
                {isCurrentlyLinked
                  ? "Alterar Vinculação"
                  : "Selecionar Cofrinho"}
              </Label>

              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              ) : (
                <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
                  <SelectTrigger id="savings_box">
                    <SelectValue placeholder="Selecione um cofrinho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Unlink className="h-4 w-4" />
                        Nenhum (desvincular)
                      </div>
                    </SelectItem>
                    {savingsBoxes.map((box) => (
                      <SelectItem key={box.id} value={box.id}>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: box.color }}
                          ></div>
                          <span>{box.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatCurrency(box.current_amount / 100)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Preview da Sincronização */}
            {selectedBoxId !== "none" &&
              selectedBoxId !== goal.savings_box_id && (
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800">
                          Sincronização de Valores
                        </h4>
                        <p className="text-sm text-blue-700">
                          O valor atual da meta será automaticamente
                          sincronizado com o valor do cofrinho selecionado.
                        </p>
                        {(() => {
                          const selectedBox = savingsBoxes.find(
                            (box) => box.id === selectedBoxId
                          );
                          return (
                            selectedBox && (
                              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                                <div className="flex justify-between">
                                  <span>Valor atual da meta:</span>
                                  <span className="font-mono">
                                    {formatCurrency(goal.current_amount / 100)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Valor do cofrinho:</span>
                                  <span className="font-mono">
                                    {formatCurrency(
                                      selectedBox.current_amount / 100
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                                  <span>Novo valor da meta:</span>
                                  <span className="font-mono text-blue-700">
                                    {formatCurrency(
                                      selectedBox.current_amount / 100
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Cofrinhos Disponíveis (se não há muitos) */}
            {savingsBoxes.length === 0 && !isLoading && (
              <Card className="border-amber-200 bg-amber-50/30">
                <CardContent className="p-4 text-center">
                  <PiggyBank className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-amber-700 font-medium">
                    Nenhum cofrinho disponível
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Crie um cofrinho primeiro para poder vincular à esta meta.
                  </p>
                </CardContent>
              </Card>
            )}
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
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  {selectedBoxId === "none"
                    ? "Desvincular"
                    : isCurrentlyLinked
                      ? "Alterar Vinculação"
                      : "Vincular Meta"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
