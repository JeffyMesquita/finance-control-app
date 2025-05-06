import { DataSummary } from "@/components/data-summary"

export default function DataVerificationPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Data Verification</h1>
      </div>
      <p className="text-muted-foreground">
        This page displays a summary of the sample data that has been seeded into your database.
      </p>
      <DataSummary />
    </div>
  )
}
