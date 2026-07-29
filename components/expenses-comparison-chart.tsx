"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useExpenseBreakdownQuery } from "@/useCases/useExpenseBreakdownQuery";

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyExpenses {
  currentMonth: ExpenseData[];
  previousMonth: ExpenseData[];
}

const CATEGORY_LABEL_MAX = 10;
const ellipsis = (str: string, max: number) => (str.length > max ? `${str.slice(0, max)}…` : str);

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ExpenseData }>;
}) => {
  if (active && payload?.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-background p-2 rounded shadow text-xs">
        <div>
          <strong>Categoria:</strong> {entry.name}
        </div>
        <div>
          <strong>Valor:</strong> {formatCurrency(entry.value)}
        </div>
      </div>
    );
  }
  return null;
};

export function ExpensesComparisonChart() {
  const currentQuery = useExpenseBreakdownQuery({ month: "current" });
  const previousQuery = useExpenseBreakdownQuery({ month: "previous" });
  const isLoading = currentQuery.isLoading || previousQuery.isLoading;
  if (isLoading) {
    return (
      <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <CardTitle>ComparaÃ§Ã£o de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse rounded bg-muted" />
      </Card>
    );
  }

  const expenseData: MonthlyExpenses = {
    currentMonth: currentQuery.data ?? [],
    previousMonth: previousQuery.data ?? [],
  };

  return (
    <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
      <CardHeader>
        <CardTitle>Comparação de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico do Mês Atual */}
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-2">Mês Atual</h3>
            {expenseData.currentMonth.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhuma despesa disponível</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData.currentMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fontFamily: "Inter, Roboto, Arial, sans-serif",
                      fontWeight: 700,
                    }}
                    tickFormatter={(value) => ellipsis(value, CATEGORY_LABEL_MAX)}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis tick={YAxisCustomTick} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value">
                    {expenseData.currentMonth.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico do Mês Anterior */}
          <div className="h-[300px]">
            <h3 className="text-sm font-medium mb-2">Mês Anterior</h3>
            {expenseData.previousMonth.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhuma despesa disponível</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData.previousMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fontFamily: "Inter, Roboto, Arial, sans-serif",
                      fontWeight: 700,
                    }}
                    tickFormatter={(value) => ellipsis(value, CATEGORY_LABEL_MAX)}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis tick={YAxisCustomTick} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value">
                    {expenseData.previousMonth.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const YAxisCustomTick = (props: { x?: number; y?: number; payload?: { value?: number } }) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={2}
        textAnchor="end"
        fontSize={10}
        fontFamily="Inter, Roboto, Arial, sans-serif"
        fontWeight={800}
        fill="#64748b"
        transform="rotate(-10)"
      >
        {formatCurrency(payload?.value ?? 0)}
      </text>
    </g>
  );
};
