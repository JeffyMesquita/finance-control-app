import { ReportsOverview } from "@/components/reports-overview"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
      </div>

      <p className="text-muted-foreground">
        Visualize relatórios detalhados sobre suas finanças para tomar decisões mais informadas.
      </p>

      <ReportsOverview />
    </div>
  )
}
