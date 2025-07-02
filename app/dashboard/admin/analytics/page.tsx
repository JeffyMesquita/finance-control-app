"use client";

// Hook TanStack Query
import { useAdminAnalyticsQuery } from "@/useCases/admin/useAdminAnalyticsQuery";
import { Loader2 } from "lucide-react";

export default function AdminAnalyticsPage() {
  // Hook TanStack Query
  const { data: analytics, isLoading: loading } = useAdminAnalyticsQuery();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Analytics de Uso</h1>
      <p className="text-muted-foreground mb-8">
        Analise de comportamento dos usuarios
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Paginas Visitadas</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>/dashboard: 1,250 visitas</p>
            <p>/transactions: 890 visitas</p>
            <p>/goals: 650 visitas</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Dispositivos</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Desktop: 65%</p>
            <p>Mobile: 30%</p>
            <p>Tablet: 5%</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Navegadores</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Chrome: 70%</p>
            <p>Firefox: 15%</p>
            <p>Safari: 10%</p>
            <p>Edge: 5%</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          📊 Dados simulados para demonstracao. Em producao, integre com Google
          Analytics.
        </p>
      </div>
    </div>
  );
}
