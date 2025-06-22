import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardCardsSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}

      {[...Array(2)].map((_, i) => (
        <Card key={i} className="animate-pulse col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}

      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
