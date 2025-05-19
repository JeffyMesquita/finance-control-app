"use client";

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

// type Transaction
// {
//     "id": "a72e98c4-0ff5-41ca-aeff-d27141e6a4f8",
//     "amount": 2097,
//     "description": "Alimentação",
//     "date": "2025-05-18T00:00:00+00:00",
//     "type": "EXPENSE",
//     "is_recurring": false,
//     "notes": "Mussarela",
//     "receipt_url": null,
//     "category_id": "74f44da5-64aa-4c25-86e2-e8f14cae36da",
//     "account_id": "940f1578-e5f4-4c6f-8c45-7735f46a0ca1",
//     "user_id": "5b2ee7d6-63ee-4d84-9e01-6aacb85ef2b4",
//     "created_at": "2025-05-18T19:30:18.810962+00:00",
//     "updated_at": "2025-05-19T11:29:41.639483+00:00",
//     "installment_number": null,
//     "total_installments": null,
//     "recurring_interval": null,
//     "category": {
//         "id": "74f44da5-64aa-4c25-86e2-e8f14cae36da",
//         "icon": "Utensils",
//         "name": "Alimentação",
//         "type": "EXPENSE",
//         "color": "#f97316",
//         "user_id": "5b2ee7d6-63ee-4d84-9e01-6aacb85ef2b4",
//         "created_at": "2025-05-18T13:07:41.626884+00:00",
//         "updated_at": "2025-05-19T00:38:59.398123+00:00"
//     },
//     "account": {
//         "id": "940f1578-e5f4-4c6f-8c45-7735f46a0ca1",
//         "name": "Main Bank Account",
//         "type": "BANK",
//         "balance": 643822,
//         "user_id": "5b2ee7d6-63ee-4d84-9e01-6aacb85ef2b4",
//         "currency": "USD",
//         "created_at": "2025-05-18T13:07:41.626884+00:00",
//         "updated_at": "2025-05-19T17:01:32.545583+00:00"
//     }
// }

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getRecentTransactions(5);
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Suas últimas atividades financeiras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted mr-4"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                  <div className="h-3 w-16 animate-pulse rounded bg-muted"></div>
                </div>
                <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Suas últimas atividades financeiras</CardDescription>
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

  // Traduzir tipos de transação
  const translateType = (type: string) => {
    return type === "INCOME" ? "Receita" : "Despesa";
  };

  return (
    <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>Suas últimas atividades financeiras</CardDescription>
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
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
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
