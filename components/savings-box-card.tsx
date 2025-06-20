"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavingsTransactionDialog } from "@/components/savings-transaction-dialog";
import { SavingsTransferDialog } from "@/components/savings-transfer-dialog";
import { SavingsBoxDialog } from "@/components/savings-box-dialog";
import {
  MoreVertical,
  Plus,
  Minus,
  ArrowRightLeft,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import type { SavingsBoxWithRelations } from "@/lib/types/savings-boxes";
import { toast } from "sonner";
import { deleteSavingsBox } from "@/app/actions/savings-boxes";

interface SavingsBoxCardProps {
  savingsBox: SavingsBoxWithRelations;
  onUpdate?: () => void;
}

export function SavingsBoxCard({ savingsBox, onUpdate }: SavingsBoxCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const currentAmount = savingsBox.current_amount || 0;
  const targetAmount = savingsBox.target_amount;
  const progressPercentage = targetAmount
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;

  const isCompleted = targetAmount ? currentAmount >= targetAmount : false;
  const hasGoal = targetAmount && targetAmount > 0;

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o cofrinho "${savingsBox.name}"?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteSavingsBox(savingsBox.id);

      if (result.success) {
        toast.success("Cofrinho excluído com sucesso!");
        onUpdate?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao excluir cofrinho");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeposit = () => {
    setIsDepositOpen(true);
  };

  const handleWithdraw = () => {
    setIsWithdrawOpen(true);
  };

  const handleTransfer = () => {
    setIsTransferOpen(true);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
        {/* Header com ícone e menu */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-sm"
                style={{ backgroundColor: savingsBox.color || "#3B82F6" }}
              >
                <PiggyBank className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold leading-none tracking-tight">
                  {savingsBox.name}
                </h3>
                {savingsBox.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {savingsBox.description}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Valor atual */}
          <div className="text-center">
            <div className="text-2xl font-bold">
              R${" "}
              {currentAmount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            {hasGoal && (
              <div className="text-sm text-muted-foreground">
                de R${" "}
                {targetAmount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
          </div>

          {/* Progresso para metas */}
          {hasGoal && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {isCompleted && (
                <Badge
                  variant="secondary"
                  className="w-full justify-center bg-green-50 text-green-700 border-green-200"
                >
                  <Target className="mr-1 h-3 w-3" />
                  Meta atingida!
                </Badge>
              )}
            </div>
          )}

          {/* Últimas transações */}
          {savingsBox.transactions &&
            savingsBox.transactions.length > 0 &&
            savingsBox.transactions[0].created_at && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Última movimentação:{" "}
                  {new Date(
                    savingsBox.transactions[0].created_at
                  ).toLocaleDateString("pt-BR")}
                </div>
              </div>
            )}

          {/* Ações */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeposit}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Depositar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWithdraw}
              disabled={currentAmount <= 0}
              className="flex items-center gap-1"
            >
              <Minus className="h-3 w-3" />
              Sacar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTransfer}
              disabled={currentAmount <= 0}
              className="flex items-center gap-1"
            >
              <ArrowRightLeft className="h-3 w-3" />
              Transferir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SavingsTransactionDialog
        open={isDepositOpen}
        onOpenChange={setIsDepositOpen}
        savingsBox={savingsBox}
        transactionType="DEPOSIT"
        onSuccess={() => {
          setIsDepositOpen(false);
          onUpdate?.();
        }}
      />

      <SavingsTransactionDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        savingsBox={savingsBox}
        transactionType="WITHDRAW"
        onSuccess={() => {
          setIsWithdrawOpen(false);
          onUpdate?.();
        }}
      />

      <SavingsTransferDialog
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        fromSavingsBox={savingsBox}
        onSuccess={() => {
          setIsTransferOpen(false);
          onUpdate?.();
        }}
      />

      <SavingsBoxDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        savingsBox={savingsBox}
        onSuccess={() => {
          setIsEditOpen(false);
          onUpdate?.();
        }}
      />
    </>
  );
}
