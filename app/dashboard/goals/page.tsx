"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { GoalCard } from "@/components/goal-card"
import { GoalDialog } from "@/components/goal-dialog"
import { ContributeDialog } from "@/components/contribute-dialog"
import { getGoals, deleteGoal } from "@/app/actions/goals"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function GoalsPage() {
  const { toast } = useToast()
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    try {
      setIsLoading(true)
      const data = await getGoals()
      setGoals(data)
    } catch (error) {
      console.error("Erro ao carregar metas:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar metas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGoal = () => {
    setSelectedGoal(null)
    setIsDialogOpen(true)
  }

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal)
    setIsDialogOpen(true)
  }

  const handleDeleteGoal = (id) => {
    const goal = goals.find((g) => g.id === id)
    setGoalToDelete(goal)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return

    try {
      const result = await deleteGoal(goalToDelete.id)
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Meta excluída com sucesso",
        })
        fetchGoals()
      } else {
        throw new Error(result.error || "Falha ao excluir meta")
      }
    } catch (error) {
      console.error("Erro ao excluir meta:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir meta",
        variant: "destructive",
      })
    } finally {
      setIsDeleteAlertOpen(false)
      setGoalToDelete(null)
    }
  }

  const handleContributeToGoal = (goal) => {
    setSelectedGoal(goal)
    setIsContributeDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Metas Financeiras</h1>
        <Button onClick={handleCreateGoal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[250px] animate-pulse rounded-lg border bg-muted"></div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Nenhuma meta ainda</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Crie sua primeira meta financeira para começar a acompanhar seu progresso.
          </p>
          <Button onClick={handleCreateGoal}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Meta
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onContribute={handleContributeToGoal}
            />
          ))}
        </div>
      )}

      <GoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} goal={selectedGoal} onSuccess={fetchGoals} />

      <ContributeDialog
        open={isContributeDialogOpen}
        onOpenChange={setIsContributeDialogOpen}
        goal={selectedGoal}
        onSuccess={fetchGoals}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente a meta "{goalToDelete?.name}". Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGoal} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
