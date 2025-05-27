import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "pix-transactions-list";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function PixTransactionsList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const fetchTransactions = async () => {
    try {
      // Check cache first
      const cachedTransactions = supabaseCache.get<any[]>(CACHE_KEY);
      if (cachedTransactions) {
        setTransactions(cachedTransactions);
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        if (error.status === 429 && retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchTransactions();
          }, RETRY_DELAY);
          return;
        }
        throw error;
      }

      if (user) {
        const { data, error: transactionsError } = await supabase
          .from("pix_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (transactionsError) throw transactionsError;

        setTransactions(data || []);
        // Cache the transactions
        supabaseCache.set(CACHE_KEY, data || []);
      }
    } catch (error) {
      console.error("Error fetching PIX transactions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações PIX.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transações PIX</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma transação PIX realizada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações PIX</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="space-y-1">
            <p className="text-sm font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              Valor: R$ {transaction.amount}
            </p>
            <p className="text-xs text-muted-foreground">
              Realizada em{" "}
              {new Date(transaction.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
