import { TransactionsTable } from "@/components/transactions-table";
import { ExportButton } from "@/components/export-button";
import { AuthGuard } from "@/components/auth-guard";

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <ExportButton />
        </div>
        <TransactionsTable />
      </div>
    </AuthGuard>
  );
}
