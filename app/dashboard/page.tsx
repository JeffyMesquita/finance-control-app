"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardCards } from "@/components/dashboard-cards";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { FinancialOverview } from "@/components/financial-overview";
import { GoalsSummary } from "@/components/goals-summary";
import { PixSupportAlert } from "@/components/pix-support-alert";
import { RecentTransactions } from "@/components/recent-transactions";
import { ReferralTrigger } from "@/components/referral-trigger";
import { SavingsSummary } from "@/components/savings-summary";
import { ShareAppAlert } from "@/components/share-app-alert";
import { WelcomeCard } from "@/components/welcome-card";
import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    localStorage.removeItem("googleLogin");
  }, []);

  return (
    <AuthGuard>
      <ReferralTrigger />
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <PixSupportAlert />
        <ShareAppAlert />
        <WelcomeCard />
        <DashboardCards />
        <ExpensesByCategoryChart className="w-full bg-stone-100 dark:bg-stone-900 shadow-sm" />
        {/* TODO: Implementar lembretes de pagamento */}
        {/* <PaymentReminders /> */}

        <div className="grid gap-4 lg:grid-cols-2 max-w-full">
          <GoalsSummary />
          <SavingsSummary />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 max-w-full">
          <FinancialOverview className="lg:col-span-4" />
          <div className="flex flex-col gap-4 lg:col-span-3">
            <RecentTransactions />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
