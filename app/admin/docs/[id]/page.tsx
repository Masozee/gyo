"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Edit, 
  Download, 
  Calendar, 
  User, 
  Building, 
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Eye,
  History
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import { type DocumentWithRelations } from "@/lib/schema"

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [document, setDocument] = useState<DocumentWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      }
    } catch (error) {
      console.error('Error fetching document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary'
      case 'UNDER_REVIEW':
        return 'outline'
      case 'APPROVED':
        return 'default'
      case 'SIGNED':
        return 'default'
      case 'ACTIVE':
        return 'default'
      case 'EXPIRED':
        return 'destructive'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Edit className="h-4 w-4" />
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />
      case 'APPROVED':
      case 'SIGNED':
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4" />
      case 'EXPIRED':
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'LOW':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Document not found</h2>
          <p className="text-muted-foreground mb-4">The document you're looking for doesn't exist or has been removed.</p>
          <Link href="/docs">
            <Button>Back to Documents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              #{document.internalNumber.toString().padStart(4, '0')}
            </Badge>
            {document.documentNumber && (
              <Badge variant="outline" className="text-xs">
                {document.documentNumber}
              </Badge>
            )}
            <Badge className={getPriorityColor(document.priority || 'MEDIUM')} variant="outline">
              {document.priority} Priority
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
          {document.description && (
            <p className="text-muted-foreground text-lg">{document.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Link href={`/docs/${document.id}/edit`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(document.status || 'DRAFT')}
                Document Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusBadgeVariant(document.status || 'DRAFT')} className="text-sm">
                  {document.status?.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {document.type}
                </Badge>
                {document.category && (
                  <Badge variant="outline" className="text-sm">
                    {document.category}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Version {document.version}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {document.content && (
            <Card>
              <CardHeader>
                <CardTitle>Document Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {document.tags && JSON.parse(document.tags).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(document.tags).map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Associations */}
          <Card>
            <CardHeader>
              <CardTitle>Associations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.project && (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{document.project.title}</div>
                    <div className="text-sm text-muted-foreground">Project</div>
                  </div>
                </div>
              )}
              {document.client && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{document.client.name}</div>
                    <div className="text-sm text-muted-foreground">Client</div>
                  </div>
                </div>
              )}
              {document.user && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {document.user.firstName} {document.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">Document Owner</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.createdAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
                </div>
              )}
              {document.startDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm">{format(new Date(document.startDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {document.endDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <span className="text-sm">{format(new Date(document.endDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {document.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expires</span>
                  <span className="text-sm font-medium text-orange-600">
                    {format(new Date(document.expiryDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {document.signedDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Signed</span>
                  <span className="text-sm">{format(new Date(document.signedDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {document.reminderDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reminder</span>
                  <span className="text-sm">{format(new Date(document.reminderDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          {document.contractValue && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contract Value</span>
                    <span className="text-lg font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: document.currency || 'USD'
                      }).format(document.contractValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidential</span>
                <Badge variant={document.isConfidential ? "destructive" : "secondary"}>
                  {document.isConfidential ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Template</span>
                <Badge variant={document.isTemplate ? "default" : "secondary"}>
                  {document.isTemplate ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Approval Required</span>
                <Badge variant={document.approvalRequired ? "outline" : "secondary"}>
                  {document.approvalRequired ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Access Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Access Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="text-sm">{document.accessCount || 0}</span>
              </div>
              {document.lastAccessedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Viewed</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(document.lastAccessedAt), { addSuffix: true })}
                  </span>
                </div>
              )}
              {document.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 