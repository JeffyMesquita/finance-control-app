"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useExpenseBreakdownQuery } from "@/useCases/useExpenseBreakdownQuery";
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

interface ExpensesByCategoryChartProps {
  className?: string;
  month?: "current" | "previous";
}

const CATEGORY_LABEL_MAX = 10;
const ellipsis = (str: string, max: number) =>
  str.length > max ? str.slice(0, max) + "…" : str;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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

const YAxisCustomTick = (props: any) => {
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
        {formatCurrency(payload.value)}
      </text>
    </g>
  );
};

export function ExpensesByCategoryChart({
  className,
  month = "current",
}: ExpensesByCategoryChartProps) {
  const { toast } = useToast();

  const {
    data: expenseData,
    isLoading,
    error,
  } = useExpenseBreakdownQuery({
    month,
    onError(error) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>
    );
  }

  if (error || !expenseData) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {expenseData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa disponível
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
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
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
