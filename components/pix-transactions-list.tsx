import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logger } from "@/lib/utils/logger";

export function PixTransactionsList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const { user, loading: userLoading } = useCurrentUser();

  const fetchTransactions = async () => {
    if (!user) return;

    // try {
    //   const { data, error: transactionsError } = await supabase
    //     .from("pix_transactions")
    //     .select("*")
    //     .eq("user_id", user.id)
    //     .order("created_at", { ascending: false });

    //   if (transactionsError) throw transactionsError;

    //   setTransactions(data || []);
    // } catch (error) {
    //   logger.error("Error fetching PIX transactions:", error as Error);
    //   toast({
    //     title: "Erro",
    //     description: "Não foi possível carregar as transações PIX.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchTransactions();
    }
  }, [user, userLoading]);

  if (loading || userLoading) {
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
