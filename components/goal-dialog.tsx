"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createGoal, updateGoal } from "@/app/actions/goals";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: any;
  onSuccess?: () => void;
}

export function GoalDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: GoalDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    start_date: new Date().toISOString().split("T")[0],
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    category_id: "",
    account_id: "",
  });

  useEffect(() => {
    if (open) {
      fetchData();

      if (goal) {
        // Format dates for input
        const startDate = new Date(goal.start_date).toISOString().split("T")[0];
        const targetDate = new Date(goal.target_date)
          .toISOString()
          .split("T")[0];

        setFormData({
          name: goal.name,
          target_amount: goal.target_amount.toString(),
          current_amount: goal.current_amount.toString(),
          start_date: startDate,
          target_date: targetDate,
          category_id: goal.category_id || "",
          account_id: goal.account_id,
        });
      } else {
        // Reset form for new goal
        setFormData({
          name: "",
          target_amount: "",
          current_amount: "0",
          start_date: new Date().toISOString().split("T")[0],
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          category_id: "",
          account_id: "",
        });
      }
    }
  }, [open, goal]);

  async function fetchData() {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData.filter((c) => c.type === "EXPENSE"));

      // Set default account if available
      if (accountsData.length > 0 && !formData.account_id) {
        setFormData((prev) => ({ ...prev, account_id: accountsData[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load accounts and categories",
        variant: "destructive",
      });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format the data
      const goalData = {
        ...formData,
        target_amount: Number.parseFloat(formData.target_amount),
        current_amount: Number.parseFloat(formData.current_amount),
        start_date: new Date(formData.start_date).toISOString(),
        target_date: new Date(formData.target_date).toISOString(),
      };

      let result;

      if (goal) {
        // Update existing goal
        result = await updateGoal(goal.id, goalData);
      } else {
        // Create new goal
        result = await createGoal(goalData);
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Meta criada com sucesso",
          variant: "success",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Falha ao criar meta");
      }
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Falha ao criar meta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{goal ? "Edit" : "Create"} Financial Goal</DialogTitle>
            <DialogDescription>
              {goal
                ? "Update your financial goal details."
                : "Set a new financial goal to track your savings progress."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount</Label>
                <Input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_amount">Current Amount</Label>
                <Input
                  id="current_amount"
                  name="current_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  handleSelectChange("account_id", value)
                }
                required
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleSelectChange("category_id", value)
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? goal
                  ? "Updating..."
                  : "Creating..."
                : goal
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
