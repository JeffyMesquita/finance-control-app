"use client";

import { logger } from "@/lib/utils/logger";

import { deleteGoal, getGoals } from "@/app/actions/goals";
import { ContributeDialog } from "@/components/contribute-dialog";
import { GoalCard } from "@/components/goal-card";
import { GoalDialog } from "@/components/goal-dialog";
import { GoalsSummary } from "@/components/goals-summary";
import { LinkSavingsBoxDialog } from "@/components/link-savings-box-dialog";
import { GoalsPageSkeleton } from "@/components/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";
type SortBy = "name" | "progress" | "target_date" | "target_amount" | "created";
type FilterStatus = "all" | "active" | "completed" | "overdue";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  category_id: string | null;
  account_id: string;
  savings_box_id: string | null;
  is_completed: boolean;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  account?: {
    id: string;
    name: string;
  };
  savings_box?: {
    id: string;
    name: string;
    color: string;
  };
};

export default function GoalsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados da interface
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("target_date");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getGoals();
      setGoals(data || []);
    } catch (err) {
      logger.error("Erro ao carregar metas:", err);
      setError("Erro ao carregar dados das metas");
      toast({
        title: "Erro",
        description: "Falha ao carregar metas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setIsDialogOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setGoalToDelete(goal);
      setIsDeleteAlertOpen(true);
    }
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      const result = await deleteGoal(goalToDelete.id);
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Meta excluída com sucesso",
          variant: "success",
        });
        fetchGoals();
      } else {
        throw new Error(result.error || "Falha ao excluir meta");
      }
    } catch (error) {
      logger.error("Erro ao excluir meta:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao excluir meta",
        variant: "destructive",
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setGoalToDelete(null);
    }
  };

  const handleContributeToGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsContributeDialogOpen(true);
  };

  const handleLinkSavingsBox = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsLinkDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchGoals();
  };

  // Calcular estatísticas
  const stats = {
    total_goals: goals.length,
    active_goals: goals.filter((g) => !g.is_completed).length,
    completed_goals: goals.filter((g) => g.is_completed).length,
    total_target: goals.reduce((sum, g) => sum + g.target_amount, 0),
    total_saved: goals.reduce((sum, g) => sum + g.current_amount, 0),
    average_progress:
      goals.length > 0
        ? Math.round(
            goals.reduce(
              (sum, g) => sum + (g.current_amount / g.target_amount) * 100,
              0
            ) / goals.length
          )
        : 0,
    overdue_goals: goals.filter(
      (g) => !g.is_completed && new Date(g.target_date) < new Date()
    ).length,
  };

  // Filtros e ordenação
  const filteredAndSortedGoals = goals
    .filter((goal) => {
      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!goal.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro por status
      if (filterStatus === "active" && goal.is_completed) return false;
      if (filterStatus === "completed" && !goal.is_completed) return false;
      if (
        filterStatus === "overdue" &&
        (goal.is_completed || new Date(goal.target_date) >= new Date())
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          const progressA = (a.current_amount / a.target_amount) * 100;
          const progressB = (b.current_amount / b.target_amount) * 100;
          return progressB - progressA;
        case "target_amount":
          return b.target_amount - a.target_amount;
        case "target_date":
          return (
            new Date(a.target_date).getTime() -
            new Date(b.target_date).getTime()
          );
        case "created":
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

  // Estado de carregamento
  if (isLoading) {
    return <GoalsPageSkeleton />;
  }

  // Estado de erro
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center py-12 bg-stone-100 dark:bg-stone-900">
          <CardContent>
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Erro ao carregar metas
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchGoals}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado vazio
  if (goals.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Metas Financeiras
            </h1>
            <p className="text-muted-foreground">
              Defina e acompanhe suas metas de economia
            </p>
          </div>
        </div>

        <Card className="text-center py-16 bg-stone-100 dark:bg-stone-900">
          <CardContent>
            <Target className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-4">
              Suas primeiras metas
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Crie metas financeiras para organizar seus objetivos: viagem, casa
              própria, emergência, ou qualquer sonho que você tenha.
            </p>
            <Button size="lg" onClick={handleCreateGoal}>
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>

        <GoalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          goal={selectedGoal || undefined}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Metas Financeiras
          </h1>
          <p className="text-muted-foreground">
            {stats.total_goals} {stats.total_goals === 1 ? "meta" : "metas"} •
            R${" "}
            {(stats.total_saved / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}{" "}
            economizados de R${" "}
            {(stats.total_target / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <Button onClick={handleCreateGoal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-stone-100 dark:bg-stone-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {stats.active_goals}
            </div>
            <div className="text-sm text-muted-foreground">Metas Ativas</div>
          </CardContent>
        </Card>
        <Card className="bg-stone-100 dark:bg-stone-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {stats.completed_goals}
            </div>
            <div className="text-sm text-muted-foreground">Concluídas</div>
          </CardContent>
        </Card>
        <Card className="bg-stone-100 dark:bg-stone-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {stats.average_progress}%
            </div>
            <div className="text-sm text-muted-foreground">Progresso Médio</div>
          </CardContent>
        </Card>
        <Card className="bg-stone-100 dark:bg-stone-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">
              {stats.overdue_goals}
            </div>
            <div className="text-sm text-muted-foreground">Atrasadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <div className="space-y-4">
        {/* Linha superior: Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Linha inferior: Filtros e visualização */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Filtros */}
          <div className="flex flex-1 gap-3">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortBy)}
            >
              <SelectTrigger className="flex-1 sm:w-[160px] sm:flex-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="target_date">Data Alvo</SelectItem>
                <SelectItem value="progress">Maior Progresso</SelectItem>
                <SelectItem value="target_amount">Maior Valor</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="created">Mais Recente</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
            >
              <SelectTrigger className="flex-1 sm:w-[140px] sm:flex-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="overdue">Atrasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Controles de visualização */}
          <div className="flex justify-center sm:justify-end">
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none px-3"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none px-3"
              >
                <List className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Lista</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid/Lista de Metas */}
      {filteredAndSortedGoals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma meta encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou criar uma nova meta
            </p>
            <Button onClick={handleCreateGoal}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredAndSortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onContribute={handleContributeToGoal}
              onLinkSavingsBox={handleLinkSavingsBox}
            />
          ))}
        </div>
      )}

      {/* Resumo Interativo */}
      {goals.length > 0 && (
        <div className="mt-8">
          <GoalsSummary onCreateClick={handleCreateGoal} />
        </div>
      )}

      {/* Dialogs */}
      <GoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        goal={selectedGoal || undefined}
        onSuccess={handleSuccess}
      />

      <ContributeDialog
        open={isContributeDialogOpen}
        onOpenChange={setIsContributeDialogOpen}
        goal={selectedGoal}
        onSuccess={handleSuccess}
        onLinkSavingsBox={() => {
          setIsContributeDialogOpen(false);
          setIsLinkDialogOpen(true);
        }}
      />

      <LinkSavingsBoxDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        goal={selectedGoal}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente a meta "{goalToDelete?.name}".
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGoal}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
