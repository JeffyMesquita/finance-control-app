import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DashboardCards } from "@/components/dashboard-cards";
import { RecentTransactions } from "@/components/recent-transactions";
import { FinancialOverview } from "@/components/financial-overview";
import { GoalsSummary } from "@/components/goals-summary";
import { WelcomeCard } from "@/components/welcome-card";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { PixSupportAlert } from "@/components/pix-support-alert";
import { ShareAppAlert } from "@/components/share-app-alert";
import { PaymentReminders } from "@/components/payment-reminders";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 overflow-x-clip">
      <PixSupportAlert />
      <ShareAppAlert />
      <WelcomeCard />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 max-w-full">
        <DashboardCards />
      </div>
      <ExpensesByCategoryChart className="w-full bg-stone-100 dark:bg-stone-900 shadow-sm" />
      <PaymentReminders />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 max-w-full">
        <FinancialOverview className="lg:col-span-4" />
        <div className="flex flex-col gap-4 lg:col-span-3">
          <GoalsSummary />
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
