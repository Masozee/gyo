"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DocumentForm } from "@/components/document-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { type Document } from "@/lib/schema"

export default function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDocument, setIsLoadingDocument] = useState(true)

  useEffect(() => {
    fetchDocument()
  }, [resolvedParams.id])

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/docs/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data)
      } else {
        console.error('Failed to fetch document')
        router.push('/docs')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      router.push('/docs')
    } finally {
      setIsLoadingDocument(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/docs/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/docs/${resolvedParams.id}`)
      } else {
        console.error('Failed to update document')
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Error updating document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/docs/${resolvedParams.id}`)
  }

  if (isLoadingDocument) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-none">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-none">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Document not found</h2>
          <p className="text-muted-foreground">The document you're trying to edit doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-none">
      <div className="flex flex-col gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Edit Document
          </h1>
          <p className="text-muted-foreground">
            Update the document details and content
          </p>
        </div>
      </div>
      
      <div className="w-full">
        <DocumentForm
          document={document}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 