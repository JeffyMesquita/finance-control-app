import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardCards } from "@/components/dashboard-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { FinancialOverview } from "@/components/financial-overview"
import { GoalsSummary } from "@/components/goals-summary"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <FinancialOverview className="lg:col-span-4" />
        <div className="flex flex-col gap-4 lg:col-span-3">
          <GoalsSummary />
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
