"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DocumentForm } from "@/components/document-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function NewDocumentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const document = await response.json()
        router.push(`/docs/${document.id}`)
      } else {
        console.error('Failed to create document')
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Error creating document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/docs')
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-none">
      <div className="flex flex-col gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Create New Document
          </h1>
          <p className="text-muted-foreground">
            Create a new document or contract for your project
          </p>
        </div>
      </div>
      
      <div className="w-full">
        <DocumentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 