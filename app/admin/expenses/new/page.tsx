"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExpenseForm } from "@/components/expense-form"
import { type NewExpense } from "@/lib/schema"

export default function NewExpensePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

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

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/expenses')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create expense')
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/expenses')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <ExpenseForm
        projects={projects}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  )
} 