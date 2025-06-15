"use client";

import { DashboardCards } from "@/components/dashboard-cards";
import { RecentTransactions } from "@/components/recent-transactions";
import { FinancialOverview } from "@/components/financial-overview";
import { GoalsSummary } from "@/components/goals-summary";
import { WelcomeCard } from "@/components/welcome-card";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { PixSupportAlert } from "@/components/pix-support-alert";
import { ShareAppAlert } from "@/components/share-app-alert";
import { PaymentReminders } from "@/components/payment-reminders";
import { AuthGuard } from "@/components/auth-guard";
import { useEffect } from "react";
import { handleReferral } from "@/app/actions/referrals";

export default function DashboardPage() {
  useEffect(() => {
    localStorage.removeItem("googleLogin");

    // Processa referral_id se existir
    const processReferral = async () => {
      const referralId = localStorage.getItem("referral_id");
      if (referralId) {
        await handleReferral(referralId);
        localStorage.removeItem("referral_id");
      }
    };
    processReferral();
  }, []);

  return (
    <AuthGuard>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <PixSupportAlert />
        <ShareAppAlert />
        <WelcomeCard />
        <DashboardCards />
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
    </AuthGuard>
  );
}
