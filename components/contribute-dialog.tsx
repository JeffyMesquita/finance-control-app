"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updateGoalProgress } from "@/app/actions/goals"
import { createTransaction } from "@/app/actions/transactions"
import { formatCurrency } from "@/lib/utils"

interface ContributeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: any
  onSuccess?: () => void
}

export function ContributeDialog({ open, onOpenChange, goal, onSuccess }: ContributeDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState("")

  const remainingAmount = goal ? goal.target_amount - goal.current_amount : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const contributionAmount = Number.parseFloat(amount)

      if (isNaN(contributionAmount) || contributionAmount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // Update goal progress
      const result = await updateGoalProgress(goal.id, contributionAmount)

      if (!result.success) {
        throw new Error(result.error || "Failed to update goal progress")
      }

      // Create a transaction record for this contribution
      await createTransaction({
        amount: contributionAmount,
        description: `Contribution to ${goal.name}`,
        date: new Date().toISOString(),
        type: "EXPENSE",
        account_id: goal.account_id,
        notes: `Goal contribution: ${goal.name}`,
      })

      toast({
        title: "Success",
        description: `Added ${formatCurrency(contributionAmount)} to your goal`,
      })
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error contributing to goal:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to contribute to goal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!goal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Contribute to Goal</DialogTitle>
            <DialogDescription>Add funds to your "{goal.name}" goal.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="amount">Contribution Amount</Label>
                <span className="text-sm text-muted-foreground">Remaining: {formatCurrency(remainingAmount)}</span>
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Goal Progress</Label>
              <div className="text-sm">
                <p>
                  Current: {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                </p>
                {amount && !isNaN(Number(amount)) && (
                  <p className="text-green-600 mt-1">
                    After contribution: {formatCurrency(goal.current_amount + Number(amount))} /{" "}
                    {formatCurrency(goal.target_amount)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Contributing..." : "Contribute"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
