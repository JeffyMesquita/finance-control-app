"use client";

import { DashboardCards } from "@/components/dashboard-cards";
import { RecentTransactions } from "@/components/recent-transactions";
import { FinancialOverview } from "@/components/financial-overview";
import { GoalsSummary } from "@/components/goals-summary";
import { SavingsSummary } from "@/components/savings-summary";
import { WelcomeCard } from "@/components/welcome-card";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { PixSupportAlert } from "@/components/pix-support-alert";
import { ShareAppAlert } from "@/components/share-app-alert";
import { PaymentReminders } from "@/components/payment-reminders";
import { AuthGuard } from "@/components/auth-guard";
import { useEffect } from "react";
import { ReferralTrigger } from "@/components/referral-trigger";

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
        <PaymentReminders />

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
