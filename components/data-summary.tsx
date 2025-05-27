"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData, getExpenseBreakdown } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/utils";

export function DataSummary() {
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
  });
  const [expenseData, setExpenseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [dashboardResult, expenseResult] = await Promise.all([
          getDashboardData(),
          getExpenseBreakdown(),
        ]);
        setDashboardData(dashboardResult);
        setExpenseData(expenseResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
          <CardDescription>
            Overview of your seeded financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Balance
                  </h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboardData.totalBalance)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Monthly Income
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData.monthlyIncome)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Monthly Expenses
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(dashboardData.monthlyExpenses)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Monthly Savings
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(dashboardData.monthlySavings)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Expense Categories
                </h3>
                <div className="space-y-2">
                  {expenseData?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No expense data available
                    </p>
                  ) : (
                    expenseData.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{
                              backgroundColor: category.color || "#64748b",
                            }}
                          ></div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
