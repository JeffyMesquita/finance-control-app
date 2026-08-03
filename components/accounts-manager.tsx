"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import type { AccountData, CreateAccountData } from "@/lib/types/actions";
import { useAccountsQuery } from "@/useCases/accounts/useAccountsQuery";
import { useCreateAccountMutation } from "@/useCases/accounts/useCreateAccountMutation";
import { useDeleteAccountMutation } from "@/useCases/accounts/useDeleteAccountMutation";
import { useUpdateAccountMutation } from "@/useCases/accounts/useUpdateAccountMutation";

const accountTypes = [
  { value: "CHECKING", label: "Conta corrente" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "INVESTMENT", label: "Investimento" },
] as const;

const initialForm: CreateAccountData = {
  name: "",
  type: "CHECKING",
  balance: 0,
  currency: "BRL",
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", { currency, style: "currency" }).format(value);
}

function getAccountTypeLabel(type: string): string {
  return accountTypes.find((accountType) => accountType.value === type)?.label ?? type;
}

export function AccountsManager() {
  const { toast } = useToast();
  const accountsQuery = useAccountsQuery();
  const createAccount = useCreateAccountMutation();
  const updateAccount = useUpdateAccountMutation();
  const deleteAccount = useDeleteAccountMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [form, setForm] = useState<CreateAccountData>(initialForm);

  const accounts = accountsQuery.data?.data ?? [];
  const isSaving = createAccount.isPending || updateAccount.isPending;

  function openCreateDialog(): void {
    setEditingAccount(null);
    setForm(initialForm);
    setDialogOpen(true);
  }

  function openEditDialog(account: AccountData): void {
    setEditingAccount(account);
    setForm({
      name: account.name,
      type: account.type,
      currency: account.currency,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      const result = editingAccount
        ? await updateAccount.mutateAsync({ account: form, id: editingAccount.id })
        : await createAccount.mutateAsync(form);

      if (!result.success) {
        throw new Error(result.error ?? "Não foi possível salvar a conta.");
      }

      setDialogOpen(false);
      toast({
        title: "Conta salva",
        description: editingAccount
          ? "As alterações foram aplicadas."
          : "A conta foi criada com sucesso.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(account: AccountData): Promise<void> {
    if (!window.confirm(`Excluir a conta ${account.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const result = await deleteAccount.mutateAsync(account.id);
      if (!result.success) {
        throw new Error(result.error ?? "Não foi possível excluir a conta.");
      }

      toast({ title: "Conta excluída", description: "A conta foi removida.", variant: "success" });
    } catch (error) {
      toast({
        title: "Não foi possível excluir",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
  }

  if (accountsQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (accountsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Não foi possível carregar as contas</CardTitle>
          <CardDescription>Tente novamente para consultar suas contas financeiras.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void accountsQuery.refetch()} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Gerencie as contas usadas nas suas transações.
        </p>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Nova conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma conta cadastrada</CardTitle>
            <CardDescription>Crie sua primeira conta para registrar transações.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreateDialog}>Criar conta</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <CardDescription>{getAccountTypeLabel(account.type)}</CardDescription>
                <CardTitle className="text-xl">{account.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl font-semibold">
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => openEditDialog(account)} size="sm" variant="outline">
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    disabled={deleteAccount.isPending}
                    onClick={() => void handleDelete(account)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Editar conta" : "Nova conta"}</DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Atualize o nome, tipo ou moeda desta conta."
                : "Informe os dados iniciais da sua conta financeira."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="account-name">Nome</Label>
              <Input
                id="account-name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                value={form.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-type">Tipo</Label>
              <Select
                onValueChange={(type) => setForm((current) => ({ ...current, type }))}
                value={form.type}
              >
                <SelectTrigger id="account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((accountType) => (
                    <SelectItem key={accountType.value} value={accountType.value}>
                      {accountType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editingAccount ? (
              <div className="space-y-2">
                <Label htmlFor="account-balance">Saldo inicial</Label>
                <Input
                  id="account-balance"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, balance: Number(event.target.value) || 0 }))
                  }
                  step="0.01"
                  type="number"
                  value={form.balance ?? 0}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="account-currency">Moeda</Label>
              <Input
                id="account-currency"
                maxLength={3}
                onChange={(event) =>
                  setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))
                }
                required
                value={form.currency ?? "BRL"}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)} type="button" variant="outline">
                Cancelar
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Salvando..." : "Salvar conta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
