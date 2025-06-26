"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, ArrowLeft, ExternalLink } from "lucide-react"
import { type Expense } from "@/lib/schema"
import { useToast } from "@/hooks/use-toast"

interface ExpenseDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const [expense, setExpense] = useState<(Expense & { project?: any, user?: any }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExpense()
  }, [resolvedParams.id])

  const loadExpense = async () => {
    if (!resolvedParams.id) {
      router.push('/admin/expenses')
      return
    }

    try {
      setLoading(true)
             const response = await fetch(`/api/expenses/${resolvedParams.id}`)
       if (!response.ok) {
         throw new Error('Failed to fetch expense')
       }
       const data = await response.json()
      setExpense(data)
    } catch (err) {
      console.error('Failed to load expense:', err)
      setError('Failed to load expense')
      toast({
        title: "Error",
        description: "Failed to load expense details",
        variant: "destructive",
      })
      router.push('/admin/expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/expenses')
      } else {
        alert('Failed to delete expense')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Failed to delete expense')
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCategoryBadgeColor = (category: string | null) => {
    if (!category) return "secondary"
    
    const colors: { [key: string]: string } = {
      'TRAVEL': 'bg-blue-500',
      'MATERIALS': 'bg-green-500',
      'SOFTWARE': 'bg-purple-500',
      'EQUIPMENT': 'bg-orange-500',
      'OTHER': 'bg-gray-500',
    }
    
    return colors[category] || "secondary"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">Loading expense...</div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">Expense not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/expenses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Expenses
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{expense.title}</h1>
            <p className="text-muted-foreground">
              Expense #{expense.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/expenses/${expense.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Details */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold">
                {formatCurrency(expense.amount, expense.currency || 'USD')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <p className="text-lg">{formatDate(expense.date)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <div className="mt-1">
                {expense.category ? (
                  <Badge className={getCategoryBadgeColor(expense.category)}>
                    {expense.category}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">No category</span>
                )}
              </div>
            </div>

            {expense.taxAmount && expense.taxAmount > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax Amount</label>
                <p className="text-lg">
                  {formatCurrency(expense.taxAmount, expense.currency || 'USD')}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex gap-2 mt-1">
                {expense.billable && (
                  <Badge variant="outline">Billable</Badge>
                )}
                {expense.reimbursed && (
                  <Badge variant="secondary">Reimbursed</Badge>
                )}
                {!expense.billable && !expense.reimbursed && (
                  <span className="text-muted-foreground">No status</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Project & Additional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <p className="text-lg">
                {expense.project?.title || 'No project assigned'}
              </p>
            </div>

            {expense.receiptUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Receipt</label>
                <div className="mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(expense.receiptUrl!, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Receipt
                  </Button>
                </div>
              </div>
            )}

            {expense.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm bg-muted p-3 rounded-md mt-1">
                  {expense.description}
                </p>
              </div>
            )}

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">
                {expense.createdAt ? formatDate(expense.createdAt) : 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 