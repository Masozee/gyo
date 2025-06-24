"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ExpenseForm } from "@/components/expense-form"
import { type Expense, type NewExpense } from "@/lib/schema"

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default function EditExpensePage({ params }: EditExpensePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [expense, setExpense] = useState<(Expense & { project?: any, user?: any }) | null>(null)
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchExpense()
    fetchProjects()
  }, [resolvedParams.id])

  const fetchExpense = async () => {
    try {
      setFetching(true)
      const response = await fetch(`/api/expenses/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setExpense(data)
      } else if (response.status === 404) {
        alert('Expense not found')
        router.push('/expenses')
      }
    } catch (error) {
      console.error('Error fetching expense:', error)
    } finally {
      setFetching(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        // Handle the { projects: [...] } structure from the API
        const projectsList = data.projects || data
        setProjects(Array.isArray(projectsList) ? projectsList : [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    }
  }

  const handleSubmit = async (data: NewExpense | Partial<NewExpense>) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/expenses/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/expenses')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update expense')
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      alert('Failed to update expense')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/expenses')
  }

  if (fetching) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">Loading expense...</div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">Expense not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <ExpenseForm
        expense={expense}
        projects={projects}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  )
} 