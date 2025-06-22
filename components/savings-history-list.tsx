"use client";

import { logger } from "@/lib/utils/logger";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSavingsTransactionsByUser } from "@/app/actions/savings-transactions";
import { getSavingsBoxes } from "@/app/actions/savings-boxes";
import {
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  PiggyBank,
  Filter,
  Calendar,
  Wallet,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SavingsTransaction {
  id: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  description: string | null;
  created_at: string;
  savings_box: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  target_box: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  source_account: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface SavingsHistoryListProps {
  limit?: number;
  showFilters?: boolean;
  boxId?: string;
}

export function SavingsHistoryList({
  limit = 10,
  showFilters = true,
  boxId,
}: SavingsHistoryListProps) {
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [allBoxes, setAllBoxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBox, setFilterBox] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [limit]);

  useEffect(() => {
    if (showFilters) {
      loadBoxes();
    }
  }, [showFilters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getSavingsTransactionsByUser(limit);
      setTransactions(data || []);
    } catch (error) {
      logger.error("Erro ao carregar transações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBoxes = async () => {
    try {
      const data = await getSavingsBoxes();
      setAllBoxes(data || []);
    } catch (error) {
      logger.error("Erro ao carregar cofrinhos:", error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "WITHDRAW":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "TRANSFER":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <PiggyBank className="h-4 w-4" />;
    }
  };

  const getTransactionTitle = (transaction: SavingsTransaction) => {
    switch (transaction.type) {
      case "DEPOSIT":
        return `Depósito em ${transaction.savings_box?.name}`;
      case "WITHDRAW":
        return `Saque de ${transaction.savings_box?.name}`;
      case "TRANSFER":
        return `Transferência para ${transaction.target_box?.name}`;
      default:
        return "Transação";
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return (
          <Badge
            variant="secondary"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Depósito
          </Badge>
        );
      case "WITHDRAW":
        return (
          <Badge
            variant="secondary"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Saque
          </Badge>
        );
      case "TRANSFER":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Transferência
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (
      boxId &&
      transaction.savings_box?.id !== boxId &&
      transaction.target_box?.id !== boxId
    ) {
      return false;
    }

    if (filterType !== "all" && transaction.type !== filterType) {
      return false;
    }

    if (filterBox !== "all") {
      if (
        transaction.savings_box?.id !== filterBox &&
        transaction.target_box?.id !== filterBox
      ) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <Card className="bg-stone-100 dark:bg-stone-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Movimentações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-3 p-3"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-stone-100 dark:bg-stone-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Movimentações
          </CardTitle>
          {showFilters && (
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          )}
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="flex gap-2 mt-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="DEPOSIT">Depósitos</SelectItem>
                <SelectItem value="WITHDRAW">Saques</SelectItem>
                <SelectItem value="TRANSFER">Transferências</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBox} onValueChange={setFilterBox}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cofrinho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cofrinhos</SelectItem>
                {allBoxes.map((box) => (
                  <SelectItem key={box.id} value={box.id}>
                    {box.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {transactions.length === 0
                ? "Nenhuma movimentação encontrada."
                : "Nenhuma movimentação corresponde aos filtros selecionados."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {/* Ícone da transação */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {getTransactionIcon(transaction.type)}
                </div>

                {/* Informações da transação */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">
                      {getTransactionTitle(transaction)}
                    </h4>
                    {getTransactionBadge(transaction.type)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(transaction.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>

                    {transaction.source_account && (
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        {transaction.source_account.name}
                      </span>
                    )}
                  </div>

                  {transaction.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {transaction.description}
                    </p>
                  )}
                </div>

                {/* Valor */}
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      transaction.type === "DEPOSIT"
                        ? "text-green-600"
                        : transaction.type === "WITHDRAW"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  >
                    {transaction.type === "WITHDRAW" ? "-" : ""}
                    R${" "}
                    {transaction.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>

                  {/* Preview dos cofrinhos envolvidos */}
                  <div className="flex items-center gap-1 mt-1">
                    {transaction.savings_box && (
                      <div
                        className="w-3 h-3 rounded"
                        style={{
                          backgroundColor:
                            transaction.savings_box.color || "#3B82F6",
                        }}
                        title={transaction.savings_box.name}
                      />
                    )}
                    {transaction.type === "TRANSFER" &&
                      transaction.target_box && (
                        <>
                          <ArrowRightLeft className="h-2 w-2 text-muted-foreground" />
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor:
                                transaction.target_box.color || "#3B82F6",
                            }}
                            title={transaction.target_box.name}
                          />
                        </>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
