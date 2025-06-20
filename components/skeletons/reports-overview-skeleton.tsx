import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReportsOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Receitas vs Despesas */}
      <Card className="lg:col-span-2 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>

      {/* Despesa por Categoria */}
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>

      {/* Cards de Estatísticas - Metas */}
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-2 w-full bg-muted animate-pulse rounded" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-6 w-full bg-muted animate-pulse rounded" />
            <div className="h-6 w-full bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas - Cofrinhos */}
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-muted animate-pulse rounded" />
            <div className="h-4 w-52 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-2 w-full bg-muted animate-pulse rounded" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-6 w-full bg-muted animate-pulse rounded" />
            <div className="h-6 w-full bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Análise de Integração */}
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-2">
            <div className="h-5 w-44 bg-muted animate-pulse rounded" />
            <div className="h-4 w-56 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
              <div className="h-6 w-12 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto" />
            </div>
            <div className="space-y-2 text-center">
              <div className="h-6 w-12 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="h-6 w-40 bg-muted animate-pulse rounded mx-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Comparison Chart Skeleton */}
      <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <div className="h-6 w-52 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>

      {/* Tendência de Economia */}
      <Card className="lg:col-span-2 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>

      {/* Evolução de Metas */}
      <Card className="bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <div className="h-6 w-36 bg-muted animate-pulse rounded" />
          <div className="h-4 w-44 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px] w-full animate-pulse bg-muted rounded" />
      </Card>

      {/* Relatórios Disponíveis */}
      <Card className="lg:col-span-3 bg-stone-100 dark:bg-stone-900 shadow-sm">
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="h-10 w-20 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end">
                    <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
