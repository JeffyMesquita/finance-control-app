import { CategoriesTable } from "@/components/categories-table"

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
      </div>
      <CategoriesTable />
    </div>
  )
}
