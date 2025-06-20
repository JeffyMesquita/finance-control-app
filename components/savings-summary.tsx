"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getSavingsBoxesSummary,
  getSavingsBoxesStats,
  getSavingsBoxesTotal,
} from "@/app/actions/savings-boxes";
import { PiggyBank, Plus, TrendingUp, Target, Coins } from "lucide-react";
import Link from "next/link";

interface SavingsBoxSummaryItem {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number | null;
  color: string;
  icon: string;
  progress_percentage: number;
  is_goal_linked: boolean;
  linked_goal: any;
}

interface SavingsStats {
  total_boxes: number;
  total_amount: number;
  total_with_goals: number;
  total_completed_goals: number;
  average_completion: number;
}

export function SavingsSummary() {
  const [summary, setSummary] = useState<SavingsBoxSummaryItem[]>([]);
  const [stats, setStats] = useState<SavingsStats | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, statsData, totalData] = await Promise.all([
        getSavingsBoxesSummary(),
        getSavingsBoxesStats(),
        getSavingsBoxesTotal(),
      ]);

      setSummary(summaryData || []);
      setStats(statsData);
      setTotalAmount(totalData || 0);
    } catch (error) {
      console.error("Erro ao carregar dados dos cofrinhos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-stone-100 dark:bg-stone-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Cofrinhos Digitais
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

  if (!stats || summary.length === 0) {
    return (
      <Card className="bg-stone-100 dark:bg-stone-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Cofrinhos Digitais
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Você ainda não tem nenhum cofrinho digital.
          </p>
          <Link href="/dashboard/cofrinhos">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Cofrinho
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-stone-100 dark:bg-stone-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Cofrinhos Digitais
          </CardTitle>
          <Link href="/dashboard/cofrinhos">
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              R${" "}
              {totalAmount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-blue-600">Total Guardado</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {stats.total_boxes}
            </div>
            <div className="text-sm text-green-600">
              {stats.total_boxes === 1 ? "Cofrinho" : "Cofrinhos"}
            </div>
          </div>
        </div>

        {/* Indicadores de Progresso */}
        {stats.total_with_goals > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Target className="h-3 w-3" />
                Progresso Médio das Metas
              </span>
              <span className="font-medium">{stats.average_completion}%</span>
            </div>
            <Progress value={stats.average_completion} className="h-2" />
          </div>
        )}

        {/* Lista dos Principais Cofrinhos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Coins className="h-4 w-4" />
            Principais Cofrinhos
          </div>

          {summary.slice(0, 3).map((box) => (
            <div
              key={box.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm flex-shrink-0"
                style={{ backgroundColor: box.color }}
              >
                <PiggyBank className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{box.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    R${" "}
                    {box.current_amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  {box.target_amount && (
                    <>
                      <span>/</span>
                      <span>
                        R${" "}
                        {box.target_amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </>
                  )}
                </div>

                {/* Barra de progresso para metas */}
                {box.target_amount && (
                  <div className="mt-1">
                    <Progress value={box.progress_percentage} className="h-1" />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1 items-end">
                {box.progress_percentage >= 100 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    ✓ Completo
                  </Badge>
                )}
                {box.is_goal_linked && (
                  <Badge variant="outline" className="text-xs">
                    Meta
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas Adicionais */}
        {stats.total_boxes > 3 && (
          <div className="text-center pt-2 border-t">
            <Link href="/dashboard/cofrinhos">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <TrendingUp className="mr-2 h-3 w-3" />
                Ver mais {stats.total_boxes - 3} cofrinhos
              </Button>
            </Link>
          </div>
        )}

        {/* Ação rápida */}
        <div className="pt-2 border-t">
          <Link href="/dashboard/cofrinhos">
            <Button className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cofrinho
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
