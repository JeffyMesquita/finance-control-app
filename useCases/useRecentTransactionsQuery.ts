import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Category {
  id: string;
  icon: string;
  name: string;
  type: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
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
}

async function fetchRecentTransactions(limit = 7): Promise<Transaction[]> {
  const res = await fetch(`/api/recent-transactions?limit=${limit}`);
  if (!res.ok) {
    throw new Error("Erro ao carregar transações recentes");
  }
  const result = await res.json();
  if (!Array.isArray(result)) {
    throw new Error("Dados de transações inválidos");
  }
  return result;
}

export function useRecentTransactionsQuery(limit = 7) {
  const { toast } = useToast();

  const queryFn = useCallback(() => fetchRecentTransactions(limit), [limit]);

  const query = useQuery<Transaction[], Error>({
    queryKey: ["recent-transactions", limit],
    queryFn,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast({
        title: "Erro ao carregar transações recentes",
        description: query.error.message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  return query;
}
