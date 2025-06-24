"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Expense, type NewExpense } from "@/lib/schema"

interface ExpenseFormProps {
  expense?: Expense & { project?: any, user?: any }
  projects: Array<{ id: number; title: string }>
  onSubmit: (data: NewExpense | Partial<NewExpense>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const expenseCategories = [
  { value: "TRAVEL", label: "Travel" },
  { value: "MATERIALS", label: "Materials" },
  { value: "SOFTWARE", label: "Software" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "OTHER", label: "Other" },
]

const currencies = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
]

export function ExpenseForm({
  expense,
  projects,
  onSubmit,
  onCancel,
  isLoading = false,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    projectId: expense?.projectId?.toString() || "",
    userId: expense?.userId || 1, // TODO: Get from auth context
    date: expense?.date || new Date().toISOString().split('T')[0],
    title: expense?.title || "",
    category: expense?.category || "",
    amount: expense?.amount?.toString() || "",
    currency: expense?.currency || "USD",
    taxAmount: expense?.taxAmount?.toString() || "0",
    receiptUrl: expense?.receiptUrl || "",
    description: expense?.description || "",
    billable: expense?.billable ?? true,
    reimbursed: expense?.reimbursed ?? false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectId) {
      newErrors.projectId = "Project is required"
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData = {
      projectId: parseInt(formData.projectId),
      userId: formData.userId,
      date: formData.date,
      title: formData.title.trim(),
      category: formData.category || null,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      taxAmount: parseFloat(formData.taxAmount) || 0,
      receiptUrl: formData.receiptUrl.trim() || null,
      description: formData.description.trim() || null,
      billable: formData.billable,
      reimbursed: formData.reimbursed,
    }

    await onSubmit(submitData)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {expense ? "Edit Expense" : "Create New Expense"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) =>
                setFormData({ ...formData, projectId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(projects) && projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-red-500">{errors.projectId}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Expense title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tax Amount */}
          <div className="space-y-2">
            <Label htmlFor="taxAmount">Tax Amount</Label>
            <Input
              id="taxAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxAmount}
              onChange={(e) =>
                setFormData({ ...formData, taxAmount: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          {/* Receipt URL */}
          <div className="space-y-2">
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <Input
              id="receiptUrl"
              type="url"
              value={formData.receiptUrl}
              onChange={(e) =>
                setFormData({ ...formData, receiptUrl: e.target.value })
              }
              placeholder="https://example.com/receipt.pdf"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Additional details about the expense"
              rows={3}
            />
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="billable" className="text-sm font-medium">
                Billable to client
              </Label>
              <Switch
                id="billable"
                checked={formData.billable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, billable: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reimbursed" className="text-sm font-medium">
                Reimbursed
              </Label>
              <Switch
                id="reimbursed"
                checked={formData.reimbursed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, reimbursed: checked })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 