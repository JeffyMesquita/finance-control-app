"use client";

import { Investment, INVESTMENT_CATEGORIES } from "@/lib/types/investments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvestmentCardProps {
  investment: Investment;
  onEdit?: (investment: Investment) => void;
  onDelete?: (id: string) => void;
}

export function InvestmentCard({
  investment,
  onEdit,
  onDelete,
}: InvestmentCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const returnAmount = investment.current_amount - investment.initial_amount;
  const returnPercentage =
    investment.initial_amount > 0
      ? (returnAmount / investment.initial_amount) * 100
      : 0;

  const isPositive = returnAmount >= 0;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: investment.color }}
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{investment.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {INVESTMENT_CATEGORIES[investment.category]}
            </Badge>
            {!investment.is_active && (
              <Badge variant="outline" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Investido: {formatCurrency(investment.initial_amount)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-medium">
            {formatCurrency(investment.current_amount)}
          </p>
          <div
            className={`flex items-center text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {formatCurrency(returnAmount)} ({returnPercentage.toFixed(2)}%)
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(investment)}>
                Editar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Nova Transação</DropdownMenuItem>
            <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(investment.id)}
              >
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
