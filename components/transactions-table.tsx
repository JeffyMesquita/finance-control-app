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
import { getTransactions, deleteTransaction } from "@/app/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useIsMobile } from "@/components/ui/use-mobile";

type Category = {
  id: string;
  icon: string;
  name: string;
  type: string;
  color: string;
  user_id: string;
};

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
};

type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  category: Category;
  account: Account;
};

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
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (!transactions.length) return;

    let filtered = [...transactions];

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((t) => t.type.toLowerCase() === filter);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.category?.name?.toLowerCase().includes(searchLower) ||
          t.account?.name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filter, search]);

  async function fetchTransactions() {
    try {
      setIsLoading(true);
      const data = await getTransactions();
      console.log(data, "data");
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar transações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Transação excluída com sucesso",
        });
        fetchTransactions();
      } else {
        throw new Error(result.error || "Falha ao excluir transação");
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao excluir transação",
        variant: "destructive",
      });
    }
  };

  // Traduzir tipos de transação
  const translateType = (type: string) => {
    return type === "INCOME" ? "Receita" : "Despesa";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            className="w-full sm:w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Transações</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-md border">
          <div className="h-[400px] w-full animate-pulse bg-muted"></div>
        </div>
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
      ) : isMobile ? (
        <div className="flex flex-col gap-4">
          {filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="bg-stone-100 dark:bg-stone-900 shadow-sm rounded-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <div>
                  <CardTitle className="text-base">
                    {transaction.description}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(transaction.date)}
                  </CardDescription>
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
                  <span className="text-xs text-muted-foreground">Conta:</span>
                  <span className="text-xs">
                    {transaction.account?.name || "Desconhecida"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tipo:</span>
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
                  <span className="text-xs text-muted-foreground">Valor:</span>
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
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
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
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        color: transaction.category?.color || undefined,
                        borderColor: transaction.category?.color || undefined,
                      }}
                    >
                      {transaction.category?.name || "Sem categoria"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.account?.name || "Desconhecida"}
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
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação excluirá permanentemente esta
                                transação. Esta ação não pode ser desfeita.
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
    </div>
  );
}
