"use client";

import {
  InvestmentCategoryStats,
  INVESTMENT_CATEGORIES,
  INVESTMENT_CATEGORY_COLORS,
} from "@/lib/types/investments";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface InvestmentCategoryChartProps {
  data: InvestmentCategoryStats[];
}

export function InvestmentCategoryChart({
  data,
}: InvestmentCategoryChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const chartData = data.map((item) => ({
    name: INVESTMENT_CATEGORIES[item.category],
    value: item.total_amount,
    percentage: item.percentage,
    color: INVESTMENT_CATEGORY_COLORS[item.category],
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Nenhum investimento para exibir
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) =>
              `${name}: ${percentage.toFixed(1)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Valor"]}
            labelFormatter={(label) => label}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
