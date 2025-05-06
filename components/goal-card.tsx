"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Edit, Trash } from "lucide-react"

interface GoalCardProps {
  goal: any
  onEdit: (goal: any) => void
  onDelete: (id: string) => void
  onContribute: (goal: any) => void
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const progress = (goal.current_amount / goal.target_amount) * 100
  const formattedProgress = Math.min(Math.round(progress), 100)
  const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className={goal.is_completed ? "border-green-500" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{goal.name}</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}>
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
            </span>
          </div>
          <Progress value={formattedProgress} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Target Date</p>
              <p className="font-medium">{formatDate(goal.target_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">
                {goal.is_completed ? (
                  <span className="text-green-600">Completed</span>
                ) : daysLeft > 0 ? (
                  <span>{daysLeft} days left</span>
                ) : (
                  <span className="text-red-600">Overdue</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Account</p>
              <p className="font-medium">{goal.account?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Progress</p>
              <p className="font-medium">{formattedProgress}%</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onContribute(goal)}
          className="w-full"
          variant={goal.is_completed ? "outline" : "default"}
          disabled={goal.is_completed}
        >
          {goal.is_completed ? "Completed" : "Add Contribution"}
        </Button>
      </CardFooter>
    </Card>
  )
}
