"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Pencil,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getTransactions,
  deleteTransaction,
  deleteTransactions,
} from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import TransactionsSkeleton from "@/components/TransactionsSkeleton";
import { Category } from "@/app/actions/dashboard";
import { Transaction } from "@/app/actions/dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabaseCache } from "@/lib/supabase/cache";

const CACHE_KEY = "transactions-data";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function TransactionsTable() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const pageSize = 10;
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const months = [
    { value: "all", label: "Todos os Meses" },
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
  ];

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [currentPage, selectedMonth, filter, selectedCategory, search]);

  useEffect(() => {
    if (!transactions.length) return;
    setFilteredTransactions(transactions);
  }, [transactions]);

  async function fetchTransactions() {
    try {
      setIsLoading(true);
      const result = await getTransactions(
        currentPage,
        pageSize,
        selectedMonth,
        filter,
        selectedCategory,
        search
      );
      setTransactions(result.data);
      setFilteredTransactions(result.data);
      setTotalTransactions(result.total);
      supabaseCache.set(CACHE_KEY, result.data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro ao Carregar",
        description:
          "Não foi possível carregar as transações. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro ao Carregar",
        description:
          "Não foi possível carregar as categorias. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso.",
        variant: "success",
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(filteredTransactions.map((t) => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, id]);
    } else {
      setSelectedTransactions(selectedTransactions.filter((t) => t !== id));
    }
  };

  const handleBatchDelete = async () => {
    try {
      await deleteTransactions(selectedTransactions);
      setSelectedTransactions([]);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Sucesso",
        description: `${selectedTransactions.length} transações excluídas com sucesso.`,
        variant: "success",
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transactions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir as transações.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 justify-between">
        <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <div className="flex items-center gap-2 w-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              className="w-full sm:w-[300px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Transações</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedMonth}
            onValueChange={(value) => {
              setSelectedMonth(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Top Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-2 sm:gap-0">
        <div className="flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
          {Math.min(currentPage * pageSize, totalTransactions)} de{" "}
          {totalTransactions} transações
        </div>
        <div className="flex items-center justify-between space-x-2 sm:space-x-6 lg:space-x-8 max-sm:w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm font-medium">
            Página {currentPage} de {Math.ceil(totalTransactions / pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * pageSize >= totalTransactions}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Batch Delete Button */}
      {selectedTransactions.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-stone-100 dark:bg-stone-900 rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedTransactions.length} item(ns) selecionado(s)
          </span>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-2" />
                Excluir Selecionados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação excluirá permanentemente{" "}
                  {selectedTransactions.length} transação(ões). Esta ação não
                  pode ser desfeita.
                </AlertDialogDescription>
                <div className="mt-4 max-h-[200px] overflow-y-auto">
                  <p className="text-sm font-medium mb-2">
                    Transações a serem excluídas:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {filteredTransactions
                      .filter((t) => selectedTransactions.includes(t.id))
                      .map((t) => (
                        <li key={t.id} className="flex items-center gap-2">
                          <span className="w-4 h-4">
                            {t.type === "INCOME" ? (
                              <ArrowUp className="text-green-600" />
                            ) : (
                              <ArrowDown className="text-red-600" />
                            )}
                          </span>
                          {t.description} - {formatCurrency(t.amount)}
                        </li>
                      ))}
                  </ul>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBatchDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isLoading ? (
        <TransactionsSkeleton />
      ) : filteredTransactions.length === 0 ? (
        <div className="rounded-md border p-8 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">
            Nenhuma transação encontrada
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Transação
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: hidden on md+ | Desktop: hidden below md */}
          <div className="md:hidden">
            <div className="flex flex-col gap-4">
              {filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className={cn(
                    "bg-stone-100 dark:bg-stone-900 shadow-sm rounded-sm",
                    selectedTransactions.includes(transaction.id) &&
                      "ring-2 ring-primary"
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTransaction(
                            transaction.id,
                            checked as boolean
                          )
                        }
                      />
                      <div>
                        <CardTitle className="text-base">
                          {transaction.description}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatDate(transaction.date)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        color: transaction.category?.color || undefined,
                        borderColor: transaction.category?.color || undefined,
                      }}
                    >
                      {transaction.category?.name || "Sem categoria"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Conta:
                      </span>
                      <span className="text-xs">
                        {transaction.account?.name || "Desconhecida"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Tipo:
                      </span>
                      <span className="flex items-center gap-1">
                        {transaction.type === "INCOME" ? (
                          <>
                            <ArrowUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">
                              Receita
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">
                              Despesa
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Recorrente:
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          transaction.is_recurring
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {transaction.is_recurring ? "Sim" : "Não"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Valor:
                      </span>
                      <span
                        className={
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Notas:
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{transaction.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash className="h-4 w-4 mr-1" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação excluirá permanentemente esta transação.
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedTransactions.length ===
                          filteredTransactions.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[200px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Recorrente</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end">
                        Valor
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className={cn(
                        selectedTransactions.includes(transaction.id) &&
                          "bg-stone-100 dark:bg-stone-900"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.includes(
                            transaction.id
                          )}
                          onCheckedChange={(checked) =>
                            handleSelectTransaction(
                              transaction.id,
                              checked as boolean
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            color: transaction.category?.color || undefined,
                            borderColor:
                              transaction.category?.color || undefined,
                          }}
                        >
                          {transaction.category?.name || "Sem categoria"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-base font-medium",
                          transaction.is_recurring
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {transaction.is_recurring ? "Sim" : "Não"}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{transaction.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            transaction.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(transaction)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Tem certeza?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação excluirá permanentemente esta
                                    transação. Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(transaction.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Bottom Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-2 sm:gap-0 max-sm:pb-12">
            <div className="flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, totalTransactions)} de{" "}
              {totalTransactions} transações
            </div>
            <div className="flex items-center justify-between space-x-2 sm:space-x-6 lg:space-x-8 max-sm:w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium">
                Página {currentPage} de{" "}
                {Math.ceil(totalTransactions / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * pageSize >= totalTransactions}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchTransactions}
      />

      {selectedTransaction && (
        <EditTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          transaction={selectedTransaction}
          onSuccess={fetchTransactions}
        />
      )}

      {selectedTransactions.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Excluir Selecionados ({selectedTransactions.length})
          </Button>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {selectedTransactions.length}{" "}
              transações? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
