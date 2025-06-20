"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Edit,
  Trash,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  PiggyBank,
  Link2,
  Unlink,
} from "lucide-react";

interface GoalCardProps {
  goal: any;
  onEdit: (goal: any) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: any) => void;
  onLinkSavingsBox?: (goal: any) => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
  onLinkSavingsBox,
}: GoalCardProps) {
  // Converter valores de centavos para reais
  const currentAmount = goal.current_amount / 100;
  const targetAmount = goal.target_amount / 100;

  const progress = (currentAmount / targetAmount) * 100;
  const formattedProgress = Math.min(Math.round(progress), 100);
  const daysLeft = Math.ceil(
    (new Date(goal.target_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Definir cores baseadas no status
  const getStatusColor = () => {
    if (goal.is_completed) return "emerald";
    if (daysLeft < 0) return "red";
    if (daysLeft <= 7) return "amber";
    return "blue";
  };

  const statusColor = getStatusColor();

  const getStatusText = () => {
    if (goal.is_completed) return "Concluída";
    if (daysLeft < 0) return "Atrasada";
    if (daysLeft === 0) return "Vence hoje";
    if (daysLeft === 1) return "1 dia restante";
    return `${daysLeft} dias restantes`;
  };

  const getStatusIcon = () => {
    if (goal.is_completed) return CheckCircle;
    if (daysLeft < 0) return AlertCircle;
    return Calendar;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg bg-stone-100 dark:bg-stone-900 ${
        goal.is_completed
          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "hover:shadow-md"
      }`}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {goal.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <StatusIcon
                className={`h-4 w-4 ${
                  statusColor === "emerald"
                    ? "text-emerald-600"
                    : statusColor === "red"
                    ? "text-red-600"
                    : statusColor === "amber"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  statusColor === "emerald"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : statusColor === "red"
                    ? "text-red-700 dark:text-red-300"
                    : statusColor === "amber"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 text-muted-foreground hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar meta</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(goal.id)}
              className="h-8 w-8 text-muted-foreground hover:text-red-600"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Excluir meta</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pb-4">
        <div className="space-y-4">
          {/* Valores e Progresso */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {formatCurrency((currentAmount || 0) * 100)}
                </div>
                <div className="text-sm text-muted-foreground">
                  de {formatCurrency((targetAmount || 0) * 100)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Progress
                value={formattedProgress}
                className={`h-2 ${
                  statusColor === "emerald"
                    ? "bg-emerald-100 dark:bg-emerald-950"
                    : statusColor === "red"
                    ? "bg-red-100 dark:bg-red-950"
                    : statusColor === "amber"
                    ? "bg-amber-100 dark:bg-amber-950"
                    : "bg-blue-100 dark:bg-blue-950"
                }`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">{formattedProgress}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Calendar
                  className={`h-3 w-3 ${
                    goal.is_completed
                      ? "text-emerald-600"
                      : daysLeft < 0
                      ? "text-red-600"
                      : daysLeft <= 7
                      ? "text-amber-600"
                      : "text-blue-600"
                  }`}
                />
                <span className="text-xs text-muted-foreground">Data Alvo</span>
              </div>
              <p className="text-sm font-medium">
                {formatDate(goal.target_date)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {goal.savings_box ? (
                  <PiggyBank className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {goal.savings_box ? "Cofrinho" : "Status"}
                </span>
              </div>
              <p className="text-sm font-medium truncate">
                {goal.savings_box
                  ? goal.savings_box.name
                  : "Sem cofrinho vinculado"}
              </p>
            </div>
          </div>

          {/* Badge de Status */}
          {goal.is_completed && (
            <div className="flex justify-center pt-2">
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Meta Concluída
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-0">
        {goal.is_completed ? (
          <Button
            variant="outline"
            className="w-full bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
            disabled
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Meta Concluída
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            {/* Botão de Vinculação */}
            {onLinkSavingsBox && (
              <Button
                onClick={() => onLinkSavingsBox(goal)}
                variant="outline"
                className="flex-1 hover:bg-muted/50"
              >
                {goal.savings_box ? (
                  <>
                    <Link2 className="mr-2 h-4 w-4 text-emerald-600" />
                    Gerenciar Vínculo
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4 text-amber-600" />
                    Vincular Cofrinho
                  </>
                )}
              </Button>
            )}

            {/* Botão de Contribuição */}
            <Button
              onClick={() => onContribute(goal)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Contribuir
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
