"use client";

import { logger } from "@/lib/utils/logger";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { getRecentTransactions } from "@/app/actions/transactions";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { RecentTransactionsSkeleton } from "@/components/skeletons";
import { TransactionData } from "@/lib/types/actions";
import { useRecentTransactionsQuery } from "@/useCases/useRecentTransactionsQuery";

type Category = {
  id: string;
  icon: string;
  name: string;
  type: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  is_recurring: boolean;
  notes: string;
  receipt_url: string;
  category_id: string;
  account_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  installment_number: number;
  total_installments: number;
  recurring_interval: string;
  category: Category;
  account: Account;
};

interface RecentTransactionsProps {
  className?: string;
}

export function RecentTransactions({ className }: RecentTransactionsProps) {
  const { data: transactions, isLoading } = useRecentTransactionsQuery(7);

  if (isLoading) {
    return <RecentTransactionsSkeleton className={className} />;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Suas últimas transações até hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação encontrada
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>Suas últimas transações até hoje</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
                  transaction.type === "INCOME"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {transaction.type === "INCOME" ? (
                  <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className={
                    transaction.type === "INCOME"
                      ? "text-green-600 dark:text-green-400 dark:bg-green-900/50 bg-green-100"
                      : "text-red-600 dark:text-red-400 dark:bg-red-900/50 bg-red-100"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
