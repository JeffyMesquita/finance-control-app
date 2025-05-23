import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Skeleton for table rows (desktop)
function TableSkeleton({ rows = 8 }) {
  return (
    <div className="rounded-md border overflow-hidden hidden md:block">
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left">Data</th>
            <th className="px-4 py-3 text-left">Descrição</th>
            <th className="px-4 py-3 text-left">Categoria</th>
            <th className="px-4 py-3 text-left">Conta</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 w-16 bg-muted rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-32 bg-muted rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 bg-muted rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 bg-muted rounded" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="h-4 w-16 bg-muted rounded ml-auto" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-8 bg-muted rounded ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Skeleton for cards (mobile)
function CardSkeleton({ count = 5 }) {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="bg-stone-100 dark:bg-stone-900 shadow-sm rounded-sm animate-pulse"
        >
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <div>
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="h-5 w-20 bg-muted rounded" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-12 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-10 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="flex gap-2 mt-2">
              <div className="h-8 w-20 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TransactionsSkeleton() {
  return (
    <>
      <TableSkeleton rows={8} />
      <CardSkeleton count={5} />
    </>
  );
}
