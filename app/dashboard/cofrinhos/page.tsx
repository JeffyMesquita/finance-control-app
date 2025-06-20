"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SavingsBoxCard } from "@/components/savings-box-card";
import { SavingsBoxDialog } from "@/components/savings-box-dialog";
import { SavingsHistoryList } from "@/components/savings-history-list";
import { SavingsSummary } from "@/components/savings-summary";
import {
  getSavingsBoxes,
  getSavingsBoxesStats,
} from "@/app/actions/savings-boxes";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  PiggyBank,
  TrendingUp,
  Target,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { SavingsBoxWithRelations } from "@/lib/types/savings-boxes";

type ViewMode = "grid" | "list";
type SortBy = "name" | "amount" | "progress" | "created";

export default function CofrinhosDashboard() {
  const [savingsBoxes, setSavingsBoxes] = useState<SavingsBoxWithRelations[]>(
    []
  );
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados da interface
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("amount");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [boxesData, statsData] = await Promise.all([
        getSavingsBoxes(),
        getSavingsBoxesStats(),
      ]);

      setSavingsBoxes(boxesData || []);
      setStats(statsData);
    } catch (err) {
      setError("Erro ao carregar dados dos cofrinhos");
      toast.error("Erro ao carregar dados dos cofrinhos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadData();
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    loadData();
  };

  // Filtros e ordenação
  const filteredAndSortedBoxes = savingsBoxes
    .filter((box) => {
      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !box.name.toLowerCase().includes(searchLower) &&
          !box.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Filtro por status
      if (filterStatus === "with-goal" && !box.target_amount) return false;
      if (filterStatus === "without-goal" && box.target_amount) return false;
      if (
        filterStatus === "completed" &&
        (!box.target_amount || (box.current_amount || 0) < box.target_amount)
      )
        return false;
      if (filterStatus === "empty" && (box.current_amount || 0) > 0)
        return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "amount":
          return (b.current_amount || 0) - (a.current_amount || 0);
        case "progress":
          const progressA = a.target_amount
            ? ((a.current_amount || 0) / a.target_amount) * 100
            : 0;
          const progressB = b.target_amount
            ? ((b.current_amount || 0) / b.target_amount) * 100
            : 0;
          return progressB - progressA;
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
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-2 w-full bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Erro ao carregar cofrinhos
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado vazio
  if (savingsBoxes.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cofrinhos Digitais
            </h1>
            <p className="text-muted-foreground">
              Organize suas economias em cofrinhos separados
            </p>
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <PiggyBank className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-4">
              Seus primeiros cofrinhos
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Crie cofrinhos digitais para organizar suas economias por
              objetivo: viagem, emergência, compras, ou qualquer meta que você
              tenha.
            </p>
            <Button size="lg" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeiro Cofrinho
            </Button>
          </CardContent>
        </Card>

        <SavingsBoxDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
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
            Cofrinhos Digitais
          </h1>
          <p className="text-muted-foreground">
            {savingsBoxes.length}{" "}
            {savingsBoxes.length === 1 ? "cofrinho" : "cofrinhos"} • R${" "}
            {(stats?.total_amount || 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}{" "}
            guardados
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cofrinho
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {stats.total_boxes}
              </div>
              <div className="text-sm text-muted-foreground">Cofrinhos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                R${" "}
                {stats.total_amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Guardado
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">
                {stats.total_with_goals}
              </div>
              <div className="text-sm text-muted-foreground">Com Metas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-700">
                {stats.average_completion}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progresso Médio
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Controles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cofrinhos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortBy)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amount">Maior Saldo</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
            <SelectItem value="progress">Maior Progresso</SelectItem>
            <SelectItem value="created">Mais Recente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="with-goal">Com Meta</SelectItem>
            <SelectItem value="without-goal">Sem Meta</SelectItem>
            <SelectItem value="completed">Completos</SelectItem>
            <SelectItem value="empty">Vazios</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid/Lista de Cofrinhos */}
      {filteredAndSortedBoxes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum cofrinho encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou criar um novo cofrinho
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Cofrinho
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredAndSortedBoxes.map((box) => (
            <SavingsBoxCard
              key={box.id}
              savingsBox={box}
              onUpdate={handleUpdateSuccess}
            />
          ))}
        </div>
      )}

      {/* Histórico Recente */}
      {savingsBoxes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SavingsHistoryList limit={8} showFilters={false} />
          </div>
          <div>
            <SavingsSummary />
          </div>
        </div>
      )}

      {/* Dialog de Criação */}
      <SavingsBoxDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
