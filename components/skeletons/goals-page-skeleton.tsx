import { Card, CardContent } from "@/components/ui/card";

export function GoalsPageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
      <div className="space-y-4">
        {/* Search bar skeleton */}
        <div className="relative">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Filters and controls skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex flex-1 gap-3">
            <div className="h-10 flex-1 sm:w-40 sm:flex-none bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 flex-1 sm:w-32 sm:flex-none bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Goals Grid Skeleton */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Values */}
              <div className="space-y-3 mb-4">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex justify-between text-sm">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Skeleton */}
      <Card className="bg-stone-100 dark:bg-stone-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats cards */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  >
                    <div className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals list */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 animate-pulse"
                >
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
