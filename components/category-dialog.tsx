"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createCategory, updateCategory } from "@/app/actions/categories"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: any
  onSuccess?: () => void
}

export function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE",
    color: "#64748b",
    icon: "",
  })

  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          name: category.name,
          type: category.type,
          color: category.color || "#64748b",
          icon: category.icon || "",
        })
      } else {
        // Reset form for new category
        setFormData({
          name: "",
          type: "EXPENSE",
          color: "#64748b",
          icon: "",
        })
      }
    }
  }, [open, category])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let result

      if (category) {
        // Update existing category
        result = await updateCategory(category.id, formData)
      } else {
        // Create new category
        result = await createCategory(formData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Category ${category ? "updated" : "created"} successfully`,
        })
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        throw new Error(result.error || `Failed to ${category ? "update" : "create"} category`)
      }
    } catch (error) {
      console.error(`Error ${category ? "updating" : "creating"} category:`, error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${category ? "update" : "create"} category`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{category ? "Edit" : "Add"} Category</DialogTitle>
            <DialogDescription>
              {category ? "Update category details." : "Create a new category for your transactions."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-10 p-1"
                />
                <Input value={formData.color} onChange={handleChange} name="color" className="flex-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (category ? "Updating..." : "Creating...") : category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
