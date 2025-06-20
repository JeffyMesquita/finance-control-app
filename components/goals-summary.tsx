"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getGoals } from "@/app/actions/goals";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  is_completed: boolean;
  savings_box?: {
    id: string;
    name: string;
    color: string;
  };
}

interface GoalsStats {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_target: number;
  total_saved: number;
  average_progress: number;
  overdue_goals: number;
}

interface GoalsSummaryProps {
  onCreateClick?: () => void; // Prop opcional para abrir modal diretamente
}

export function GoalsSummary({ onCreateClick }: GoalsSummaryProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Verifica se estamos na página de metas
  const isOnGoalsPage = pathname === "/dashboard/goals";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const goalsData = await getGoals();
      setGoals(goalsData || []);

      // Calcular estatísticas
      const stats: GoalsStats = {
        total_goals: goalsData.length,
        active_goals: goalsData.filter((g) => !g.is_completed).length,
        completed_goals: goalsData.filter((g) => g.is_completed).length,
        total_target: goalsData.reduce(
          (sum, g) => sum + g.target_amount / 100,
          0
        ),
        total_saved: goalsData.reduce(
          (sum, g) => sum + g.current_amount / 100,
          0
        ),
        average_progress:
          goalsData.length > 0
            ? Math.round(
                goalsData.reduce(
                  (sum, g) => sum + (g.current_amount / g.target_amount) * 100,
                  0
                ) / goalsData.length
              )
            : 0,
        overdue_goals: goalsData.filter(
          (g) => !g.is_completed && new Date(g.target_date) < new Date()
        ).length,
      };

      setStats(stats);
    } catch (error) {
      console.error("Erro ao carregar dados das metas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-stone-100 dark:bg-stone-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || goals.length === 0) {
    return (
      <Card className="bg-stone-100 dark:bg-stone-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Você ainda não tem nenhuma meta financeira.
          </p>
          {isOnGoalsPage && onCreateClick ? (
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Meta
            </Button>
          ) : (
            <Link href="/dashboard/goals">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Meta
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  // Metas principais (ativas, ordenadas por progresso)
  const topGoals = goals
    .filter((g) => !g.is_completed)
    .sort((a, b) => {
      const progressA = (a.current_amount / a.target_amount) * 100;
      const progressB = (b.current_amount / b.target_amount) * 100;
      return progressB - progressA;
    })
    .slice(0, 3);

  return (
    <Card className="bg-stone-100 dark:bg-stone-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Financeiras
          </CardTitle>
          {!isOnGoalsPage && (
            <Link href="/dashboard/goals">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {stats.active_goals}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              Metas Ativas
            </div>
          </div>
          <div className="text-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {stats.completed_goals}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">
              Concluídas
            </div>
          </div>
        </div>

        {/* Progresso Médio */}
        {stats.active_goals > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Progresso Médio
              </span>
              <span className="font-medium">{stats.average_progress}%</span>
            </div>
            <Progress value={stats.average_progress} className="h-2" />
          </div>
        )}

        {/* Lista das Principais Metas */}
        {topGoals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Principais Metas
            </div>

            {topGoals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const daysLeft = Math.ceil(
                (new Date(goal.target_date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm flex-shrink-0 bg-purple-600">
                    <Target className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{goal.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        R${" "}
                        {(goal.current_amount / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span>/</span>
                      <span>
                        R${" "}
                        {(goal.target_amount / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-1">
                      <Progress
                        value={Math.min(progress, 100)}
                        className="h-1"
                      />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-1 items-end">
                    {Math.round(progress) >= 100 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completa
                      </Badge>
                    )}
                    {isOverdue && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Atrasada
                      </Badge>
                    )}
                    {goal.savings_box && (
                      <Badge variant="outline" className="text-xs">
                        Cofrinho
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estatísticas Adicionais */}
        {stats.total_goals > 3 && (
          <div className="text-center pt-2 border-t">
            <Link href="/dashboard/goals">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <TrendingUp className="mr-2 h-3 w-3" />
                Ver mais {stats.total_goals - 3} metas
              </Button>
            </Link>
          </div>
        )}

        {/* Ação rápida */}
        <div className="pt-2 border-t">
          {isOnGoalsPage && onCreateClick ? (
            <Button
              onClick={onCreateClick}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          ) : (
            <Link href="/dashboard/goals">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
