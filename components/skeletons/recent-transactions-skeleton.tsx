import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecentTransactionsSkeletonProps {
  className?: string;
}

export function RecentTransactionsSkeleton({
  className,
}: RecentTransactionsSkeletonProps) {
  return (
    <Card className={cn("bg-stone-100 dark:bg-stone-900", className)}>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>Suas últimas transações até hoje</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted mr-4"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                <div className="h-3 w-16 animate-pulse rounded bg-muted"></div>
              </div>
              <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
