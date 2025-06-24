"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  Calendar,
  Archive,
  Shield,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { type DocumentWithRelations, type Project, type Client } from "@/lib/schema"
import { useToast } from "@/hooks/use-toast"

type SortField = 'title' | 'type' | 'status' | 'createdAt' | 'priority'
type SortDirection = 'asc' | 'desc'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithRelations[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
    fetchProjects()
    fetchClients()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [documents, searchTerm, typeFilter, statusFilter, projectFilter, categoryFilter, sortField, sortDirection])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/docs')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(Array.isArray(data) ? data : data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(Array.isArray(data) ? data : data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = documents

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.documentNumber?.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        doc.project?.title.toLowerCase().includes(query) ||
        doc.client?.name.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter)
    }

    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(doc => doc.projectId?.toString() === projectFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'type':
          aValue = a.type.toLowerCase()
          bValue = b.type.toLowerCase()
          break
        case 'status':
          aValue = (a.status || 'DRAFT').toLowerCase()
          bValue = (b.status || 'DRAFT').toLowerCase()
          break
        case 'priority':
          const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime()
          bValue = new Date(b.createdAt || 0).getTime()
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredDocuments(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean | string) => {
    if (checked === true) {
      const currentPageDocs = getCurrentPageDocuments()
      setSelectedDocuments([...new Set([...selectedDocuments, ...currentPageDocs.map(doc => doc.id)])])
    } else {
      const currentPageDocIds = getCurrentPageDocuments().map(doc => doc.id)
      setSelectedDocuments(selectedDocuments.filter(id => !currentPageDocIds.includes(id)))
    }
  }

  const handleSelectDocument = (docId: number, checked: boolean | string) => {
    if (checked === true) {
      setSelectedDocuments([...selectedDocuments, docId])
    } else {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId))
    }
  }

  const handleDeleteDocument = async (docId: number) => {
    try {
      const response = await fetch(`/api/docs/${docId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete document')
      }
      
      const updatedDocuments = documents.filter(doc => doc.id !== docId)
      setDocuments(updatedDocuments)
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId))
      setDocumentToDelete(null)
      setShowDeleteDialog(false)
      toast({
        title: "Success",
        description: "Document deleted successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete document",
        variant: "destructive"
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      const promises = selectedDocuments.map(id => 
        fetch(`/api/docs/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      
      const updatedDocuments = documents.filter(doc => !selectedDocuments.includes(doc.id))
      setDocuments(updatedDocuments)
      setSelectedDocuments([])
      setShowBulkDeleteDialog(false)
      toast({
        title: "Success",
        description: `${selectedDocuments.length} documents deleted successfully`
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete selected documents",
        variant: "destructive"
      })
    }
  }

  const exportToCSV = () => {
    const headers = ['Internal #', 'Title', 'Type', 'Status', 'Priority', 'Project', 'Client', 'Created', 'Expiry Date']
    const csvData = filteredDocuments.map(doc => [
      doc.internalNumber?.toString() || '',
      doc.title,
      doc.type,
      doc.status || 'DRAFT',
      doc.priority || 'MEDIUM',
      doc.project?.title || '',
      doc.client?.name || '',
      doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '',
      doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : ''
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documents-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'CONTRACT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'AGREEMENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'SOW':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'PROPOSAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'INVOICE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'NDA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 dark:text-red-400'
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400'
      case 'MEDIUM':
        return 'text-blue-600 dark:text-blue-400'
      case 'LOW':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const getCurrentPageDocuments = () => {
    return filteredDocuments.slice(startIndex, endIndex)
  }

  const currentPageDocuments = getCurrentPageDocuments()

  // Check if all current page documents are selected
  const isAllCurrentPageSelected = currentPageDocuments.length > 0 && currentPageDocuments.every(doc => selectedDocuments.includes(doc.id))
  const isSomeCurrentPageSelected = currentPageDocuments.some(doc => selectedDocuments.includes(doc.id))

  const documentTypes = [
    { value: "CONTRACT", label: "Contract" },
    { value: "AGREEMENT", label: "Agreement" },
    { value: "SOW", label: "Statement of Work" },
    { value: "PROPOSAL", label: "Proposal" },
    { value: "INVOICE", label: "Invoice" },
    { value: "NDA", label: "Non-Disclosure Agreement" },
    { value: "MSA", label: "Master Service Agreement" },
    { value: "OTHER", label: "Other" },
  ]

  const documentStatuses = [
    { value: "DRAFT", label: "Draft" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "SIGNED", label: "Signed" },
    { value: "ACTIVE", label: "Active" },
    { value: "EXPIRED", label: "Expired" },
    { value: "CANCELLED", label: "Cancelled" },
  ]

  const categories = [
    { value: "LEGAL", label: "Legal" },
    { value: "TECHNICAL", label: "Technical" },
    { value: "FINANCIAL", label: "Financial" },
    { value: "OPERATIONAL", label: "Operational" },
    { value: "COMPLIANCE", label: "Compliance" },
  ]

  // Stats calculations
  const activeDocuments = documents.filter(d => d.status === 'ACTIVE' || d.status === 'SIGNED').length
  const pendingReview = documents.filter(d => d.status === 'UNDER_REVIEW' || d.status === 'DRAFT').length
  const thisMonthDocuments = documents.filter(d => {
    if (!d.createdAt) return false
    const docDate = new Date(d.createdAt)
    const now = new Date()
    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
  }).length
  const expiringSoon = documents.filter(d => {
    if (!d.expiryDate) return false
    const expiryDate = new Date(d.expiryDate)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date()
  }).length

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-none">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Documents & Contracts</h1>
          <p className="text-muted-foreground">
            Manage your project documents, contracts, and agreements
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" onClick={exportToCSV} size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToCSV} size="sm" className="sm:hidden">
            <Download className="h-4 w-4" />
          </Button>
          <Link href="/docs/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Document</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthDocuments} created this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Currently in effect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[110px] sm:w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] sm:w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {documentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-[70px] sm:w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedDocuments.length > 0 && (
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedDocuments.length} documents selected
            </span>
            <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="w-full overflow-hidden">
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 flex-shrink-0">
                  <Checkbox
                    checked={isAllCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20 flex-shrink-0">Internal #</TableHead>
                <TableHead className="min-w-[200px] flex-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('title')}
                    className="h-auto p-0 font-medium"
                  >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-24 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="h-auto p-0 font-medium"
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-24 flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-medium"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-32 hidden md:table-cell flex-shrink-0">Project/Client</TableHead>
                <TableHead className="w-20 hidden lg:table-cell flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('priority')}
                    className="h-auto p-0 font-medium"
                  >
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-24 hidden xl:table-cell flex-shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                    className="h-auto p-0 font-medium"
                  >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-12 flex-shrink-0"></TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {currentPageDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div className="text-muted-foreground">
                      {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                        ? "No documents found matching your criteria" 
                        : "No documents yet. Create your first document to get started."
                      }
                    </div>
                    {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                      <Link href="/docs/new">
                        <Button className="mt-2">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Document
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPageDocuments.map((document) => (
                <TableRow key={document.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={(checked) => handleSelectDocument(document.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="w-full max-w-[80px] truncate">
                      #{document.internalNumber?.toString().padStart(4, '0')}
                      {document.documentNumber && (
                        <div className="text-xs text-muted-foreground truncate">
                          {document.documentNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0 max-w-[300px]">
                      <Link href={`/docs/${document.id}`} className="font-medium hover:underline block truncate">
                        {document.title}
                      </Link>
                      {document.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {document.description}
                        </div>
                      )}
                      {/* Show project/client on mobile */}
                      <div className="md:hidden mt-1 space-y-1">
                        {document.project && (
                          <div className="text-xs text-muted-foreground truncate">📁 {document.project.title}</div>
                        )}
                        {document.client && (
                          <div className="text-xs text-muted-foreground truncate">👤 {document.client.name}</div>
                        )}
                      </div>
                      {/* Show priority on smaller screens */}
                      <div className="lg:hidden mt-1">
                        <span className={`text-xs font-medium ${getPriorityColor(document.priority || 'MEDIUM')}`}>
                          {document.priority}
                        </span>
                      </div>
                      {/* Show created date on smaller screens */}
                      <div className="xl:hidden mt-1">
                        <span className="text-xs text-muted-foreground">
                          {document.createdAt && formatDate(document.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[100px]">
                      <Badge className={`${getTypeBadgeColor(document.type)} text-xs truncate`} variant="secondary">
                        {document.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[100px]">
                      <Badge variant={getStatusBadgeVariant(document.status || 'DRAFT')} className="text-xs truncate">
                        {document.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1 min-w-0 max-w-[150px]">
                      {document.project && (
                        <div className="text-sm font-medium truncate">{document.project.title}</div>
                      )}
                      {document.client && (
                        <div className="text-xs text-muted-foreground truncate">{document.client.name}</div>
                      )}
                      {!document.project && !document.client && (
                        <span className="text-xs text-muted-foreground">No association</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className={`text-sm font-medium ${getPriorityColor(document.priority || 'MEDIUM')}`}>
                      {document.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden xl:table-cell">
                    {document.createdAt && formatDate(document.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/docs/${document.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/docs/${document.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Document
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setDocumentToDelete(document.id)
                            setShowDeleteDialog(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredDocuments.length)} of {filteredDocuments.length} documents
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => documentToDelete && handleDeleteDocument(documentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDocuments.length} documents?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected documents
              and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedDocuments.length} documents
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 