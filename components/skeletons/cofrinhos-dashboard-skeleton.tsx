import { Card, CardContent } from "@/components/ui/card";

export function CofrinhosDashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="h-9 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-stone-100 dark:bg-stone-900">
            <CardContent className="p-4 text-center animate-pulse">
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Savings Boxes Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-stone-100 dark:bg-stone-900"
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Amount */}
              <div className="text-center mb-4">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Last transaction */}
              <div className="mb-4">
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* History Skeleton */}
        <div className="lg:col-span-2">
          <Card className="bg-stone-100 dark:bg-stone-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Skeleton */}
        <div className="lg:col-span-2">
          <Card className="bg-stone-100 dark:bg-stone-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
                  <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                  <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
                </div>
                <div className="text-center p-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
                  <div className="h-6 w-8 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                  <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
