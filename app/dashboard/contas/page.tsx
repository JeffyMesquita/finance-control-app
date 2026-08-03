import { AccountsManager } from "@/components/accounts-manager";

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contas</h1>
        <p className="text-muted-foreground">Acompanhe seus saldos e contas financeiras.</p>
      </div>
      <AccountsManager />
    </div>
  );
}
