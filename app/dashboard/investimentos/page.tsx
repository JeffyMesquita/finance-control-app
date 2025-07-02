"use client";

import { logger } from "@/lib/utils/logger";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  PiggyBank,
  Search,
  Filter,
  Grid3X3,
  List,
  AlertCircle,
} from "lucide-react";
import {
  Investment,
  InvestmentSummary,
  InvestmentCategoryStats,
  INVESTMENT_CATEGORIES,
  InvestmentCategory,
  INVESTMENT_CATEGORY_COLORS,
} from "@/lib/types/investments";
import { InvestmentsPageSkeleton } from "@/components/skeletons";

// Hooks TanStack Query
import { useInvestmentsQuery } from "@/useCases/investments/useInvestmentsQuery";
import { useInvestmentSummaryQuery } from "@/useCases/investments/useInvestmentSummaryQuery";

type ViewMode = "grid" | "list";
type SortBy = "name" | "return" | "amount" | "category" | "date";
type FilterCategory = "all" | InvestmentCategory;

export default function InvestimentosPage() {
  const { toast } = useToast();

  // Hooks TanStack Query
  const {
    data: investments = [],
    isLoading,
    error,
    refetch,
  } = useInvestmentsQuery();
  const { data: summary, isLoading: isSummaryLoading } =
    useInvestmentSummaryQuery();

  // Estados da interface
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filtros e ordenação com useMemo para otimização
  const filteredAndSortedInvestments = useMemo(
    () =>
      investments
        .filter((investment) => {
          // Filtro por busca
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            if (!investment.name.toLowerCase().includes(searchLower)) {
              return false;
            }
          }

          // Filtro por categoria
          if (
            filterCategory !== "all" &&
            investment.category !== filterCategory
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "name":
              return a.name.localeCompare(b.name);
            case "return":
              const returnA =
                ((a.current_amount - a.initial_amount) / a.initial_amount) *
                100;
              const returnB =
                ((b.current_amount - b.initial_amount) / b.initial_amount) *
                100;
              return returnB - returnA;
            case "amount":
              return b.current_amount - a.current_amount;
            case "category":
              return INVESTMENT_CATEGORIES[a.category].localeCompare(
                INVESTMENT_CATEGORIES[b.category]
              );
            case "date":
              return (
                new Date(b.investment_date).getTime() -
                new Date(a.investment_date).getTime()
              );
            default:
              return 0;
          }
        }),
    [investments, searchTerm, filterCategory, sortBy]
  );

  // Estados de carregamento
  if (isLoading) {
    return <InvestmentsPageSkeleton />;
  }

  // Estado de erro
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center py-12 bg-stone-100 dark:bg-stone-900">
          <CardContent>
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Erro ao carregar investimentos
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Erro inesperado"}
            </p>
            <Button onClick={() => refetch()}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado vazio
  if (investments.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
            <p className="text-muted-foreground">
              Gerencie sua carteira de investimentos
            </p>
          </div>
        </div>

        <Card className="text-center py-16 bg-stone-100 dark:bg-stone-900">
          <CardContent>
            <TrendingUp className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-4">
              Sua primeira carteira
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Comece a acompanhar seus investimentos: ações, renda fixa, fundos
              e muito mais. Mantenha controle total da sua carteira.
            </p>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeiro Investimento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
          <p className="text-muted-foreground">
            {summary?.active_investments || 0}{" "}
            {(summary?.active_investments || 0) === 1
              ? "investimento"
              : "investimentos"}{" "}
            •{formatCurrency(summary?.current_value || 0)} •
            {(summary?.return_percentage || 0) >= 0 ? "+" : ""}
            {(summary?.return_percentage || 0).toFixed(2)}%
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Investimento
        </Button>
      </div>

      {/* Cards de Resumo */}
      {summary && !isSummaryLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Investido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_invested)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.current_value)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rentabilidade
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_return)}
              </div>
              <p
                className={`text-xs ${
                  summary.return_percentage >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {summary.return_percentage >= 0 ? "+" : ""}
                {summary.return_percentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Investimentos Ativos
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.active_investments}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.active_investments === 1
                  ? "investimento"
                  : "investimentos"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Controles */}
      <div className="space-y-4">
        {/* Linha superior: Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar investimentos..."
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
                <SelectItem value="date">Mais Recente</SelectItem>
                <SelectItem value="return">Maior Retorno</SelectItem>
                <SelectItem value="amount">Maior Valor</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterCategory}
              onValueChange={(value) =>
                setFilterCategory(value as FilterCategory)
              }
            >
              <SelectTrigger className="flex-1 sm:w-[160px] sm:flex-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {Object.entries(INVESTMENT_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
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

      {/* Lista de Investimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Meus Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedInvestments.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nenhum investimento encontrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tente ajustar os filtros ou criar um novo investimento
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Investimento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedInvestments.map((investment) => {
                const returnAmount =
                  investment.current_amount - investment.initial_amount;
                const returnPercentage =
                  investment.initial_amount > 0
                    ? (returnAmount / investment.initial_amount) * 100
                    : 0;
                const isPositive = returnAmount >= 0;

                return (
                  <div
                    key={investment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: investment.color }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{investment.name}</h3>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {INVESTMENT_CATEGORIES[investment.category]}
                          </span>
                          {!investment.is_active && (
                            <span className="text-xs border border-muted-foreground text-muted-foreground px-2 py-1 rounded">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Investido: {formatCurrency(investment.initial_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(investment.current_amount)}
                      </p>
                      <div
                        className={`flex items-center text-sm ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendingUp
                          className={`h-3 w-3 mr-1 ${
                            !isPositive ? "rotate-180" : ""
                          }`}
                        />
                        {isPositive ? "+" : ""}
                        {formatCurrency(returnAmount)} (
                        {returnPercentage.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
