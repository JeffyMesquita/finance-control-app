"use client";

import { logger } from "@/lib/utils/logger";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useToast } from "@/hooks/use-toast";
import { updateGoalProgress } from "@/app/actions/goals";
import { depositToSavingsBox } from "@/app/actions/savings-transactions";
import { createTransaction } from "@/app/actions/transactions";
import { formatCurrency } from "@/lib/utils";
import {
  Target,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Link2,
  Plus,
  ArrowRight,
} from "lucide-react";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  account_id: string;
  is_completed: boolean;
  savings_box_id: string | null;
  savings_box?: {
    id: string;
    name: string;
    color: string;
  };
};

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSuccess?: () => void;
  onLinkSavingsBox?: () => void;
}

export function ContributeDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
  onLinkSavingsBox,
}: ContributeDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState<number>(0);

  const isLinkedToSavingsBox = !!goal?.savings_box_id;

  // Converter valores de centavos para reais
  const currentAmount = goal ? goal.current_amount / 100 : 0;
  const targetAmount = goal ? goal.target_amount / 100 : 0;
  const remainingAmount = targetAmount - currentAmount;
  const progressPercentage = goal ? (currentAmount / targetAmount) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || amount <= 0) return;

    setIsSubmitting(true);

    try {
      if (isLinkedToSavingsBox && goal.savings_box_id) {
        const result = await depositToSavingsBox(
          goal.savings_box_id,
          amount,
          goal.account_id,
          `Contribuição para meta: ${goal.name}`
        );

        if (!result.success) {
          throw new Error(result.error || "Falha ao depositar no cofrinho");
        }

        toast({
          title: "Contribuição Realizada!",
          description: `${formatCurrency(amount)} depositados no cofrinho "${
            goal.savings_box?.name
          }". Sua meta foi atualizada automaticamente.`,
          variant: "success",
        });
      } else {
        const result = await updateGoalProgress(goal.id, amount);

        if (!result.success) {
          throw new Error(
            result.error || "Falha ao atualizar progresso da meta"
          );
        }

        await createTransaction({
          type: "EXPENSE",
          amount: -amount,
          description: `Contribuição para meta: ${goal.name}`,
          date: new Date().toISOString(),
          category_id: null,
          account_id: goal.account_id,
          notes: `Contribuição direta para meta ${goal.name}`,
        });

        toast({
          title: "Contribuição Realizada!",
          description: `${formatCurrency(amount)} adicionados à sua meta "${
            goal.name
          }".`,
          variant: "success",
        });
      }

      onOpenChange(false);
      setAmount(0);
      onSuccess?.();
    } catch (error) {
      logger.error("Erro ao realizar contribuição:", error);
      toast({
        title: "Erro na Contribuição",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível realizar a contribuição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkSavingsBox = () => {
    onOpenChange(false);
    onLinkSavingsBox?.();
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Contribuir para Meta
            </DialogTitle>
            <DialogDescription>
              {isLinkedToSavingsBox
                ? `Faça um depósito no cofrinho "${goal.savings_box?.name}" para contribuir com sua meta "${goal.name}".`
                : `Adicione fundos diretamente à sua meta "${goal.name}".`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{goal.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(currentAmount)} de{" "}
                      {formatCurrency(targetAmount)} •{" "}
                      {Math.round(progressPercentage)}% concluído
                    </p>
                  </div>
                  {isLinkedToSavingsBox ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                    >
                      <Link2 className="h-3 w-3 mr-1" />
                      Vinculada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Direta
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLinkedToSavingsBox && goal.savings_box && (
              <Card className="border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/30 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: goal.savings_box.color }}
                    >
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Cofrinho Vinculado</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.savings_box.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <CheckCircle className="h-5 w-5 text-emerald-600 ml-auto" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                        Sync automático
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sugestão de Vinculação (se não vinculada) */}
            {!isLinkedToSavingsBox && onLinkSavingsBox && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Sugestão
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Vincule esta meta a um cofrinho para melhor organização
                        e controle das suas economias.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLinkSavingsBox}
                        className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100 dark:border-blue-600"
                      >
                        <Link2 className="mr-2 h-3 w-3" />
                        Vincular Cofrinho
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount">Valor da Contribuição</Label>
                <span className="text-sm text-muted-foreground">
                  Restante: {formatCurrency(remainingAmount)}
                </span>
              </div>

              <CurrencyInput
                id="amount"
                name="amount"
                placeholder="R$ 0,00"
                value={amount}
                onValueChange={(value) => setAmount(value || 0)}
                className="text-lg font-medium"
                required
              />
            </div>

            {amount > 0 && (
              <Card className="border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <ArrowRight className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Após a contribuição</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Valor atual:
                        </span>
                        <p className="font-mono">
                          {formatCurrency(currentAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Novo valor:
                        </span>
                        <p className="font-mono font-medium text-green-700 dark:text-green-300">
                          {formatCurrency(currentAmount + amount)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Progresso:</span>
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {Math.round(
                            ((currentAmount + amount) / targetAmount) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              ((currentAmount + amount) / targetAmount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Meta será concluída */}
                    {currentAmount + amount >= targetAmount && (
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded p-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Meta será concluída! 🎉
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {isLinkedToSavingsBox && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
                <strong>Como funciona:</strong> O valor será depositado no
                cofrinho "{goal.savings_box?.name}" e sua meta será
                automaticamente atualizada com o novo saldo.
              </div>
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
              disabled={isSubmitting || amount <= 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4 animate-spin" />
                  {isLinkedToSavingsBox ? "Depositando..." : "Contribuindo..."}
                </>
              ) : (
                <>
                  {isLinkedToSavingsBox ? (
                    <PiggyBank className="mr-2 h-4 w-4" />
                  ) : (
                    <TrendingUp className="mr-2 h-4 w-4" />
                  )}
                  {isLinkedToSavingsBox
                    ? `Depositar ${formatCurrency(amount)}`
                    : `Contribuir ${formatCurrency(amount)}`}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
