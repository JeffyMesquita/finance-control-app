"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getGoals } from "@/app/actions/goals";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";

// Tipo para Goal com relações
interface Goal extends Tables<"financial_goals"> {
  category: Tables<"categories"> | null;
  account: Tables<"financial_accounts"> | null;
}

interface GoalsSummaryProps {
  className?: string;
}

export function GoalsSummary({ className }: GoalsSummaryProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const data = await getGoals();
        // Sort by progress percentage (descending)
        const sortedGoals = [...data].sort((a, b) => {
          const progressA = (a.current_amount / a.target_amount) * 100;
          const progressB = (b.current_amount / b.target_amount) * 100;
          return progressB - progressA;
        });
        setGoals(sortedGoals.slice(0, 3)); // Get top 3 goals
      } catch (error) {
        console.error("Erro ao carregar metas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoals();
  }, []);
  if (isLoading) {
    return (
      <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Financeiras
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso das suas metas financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
                  <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
                </div>
                <div className="h-2 animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Metas Financeiras
        </CardTitle>
        <CardDescription>
          Acompanhe o progresso das suas metas financeiras
        </CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Você ainda não definiu nenhuma meta financeira.
            </p>
            <Link href="/dashboard/goals">
              <Button size="sm">Criar uma Meta</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const formattedProgress = Math.min(Math.round(progress), 100);

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span>
                      {formatCurrency(goal.current_amount)} /{" "}
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                  <Progress value={formattedProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formattedProgress}% concluído</span>
                    <span>
                      {goal.is_completed ? "Concluído" : "Em andamento"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {goals.length > 0 && (
        <CardFooter>
          <Link href="/dashboard/goals" className="w-full">
            <Button variant="outline" className="w-full">
              Ver Todas as Metas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
