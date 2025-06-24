"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Mail, Phone, MapPin, Building, ArrowUpDown, ChevronDown, Download, Users, UserCheck, UserX, Calendar, FileText, Briefcase, ExternalLink, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Client {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  website?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Project {
  id: number
  title: string
  description?: string
  status: string
  priority?: string
  startDate?: string
  deadline?: string
  progressPercentage?: number
  projectValue?: number
  createdAt: string
}



type SortField = 'name' | 'email' | 'company' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function ClientsPage() {
  const { user, loading: authLoading, requireAuth } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientProjects, setClientProjects] = useState<Project[]>([])
  const [selectedClients, setSelectedClients] = useState<number[]>([])
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<number | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    requireAuth()
  }, [requireAuth])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/clients')
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      
      const data: Client[] = await response.json()
      setClients(data)
      setFilteredClients(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load clients'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadClientProjects = async (clientId: number) => {
    try {
      const response = await fetch(`/api/projects?clientId=${clientId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch client projects')
      }
      const data = await response.json()
      setClientProjects(data.projects || [])
    } catch (err) {
      console.error('Failed to load client projects:', err)
      setClientProjects([])
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    let filtered = clients

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.company && client.company.toLowerCase().includes(query)) ||
        (client.phone && client.phone.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => 
        statusFilter === 'active' ? client.isActive : !client.isActive
      )
    }

    filtered.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'company':
          aValue = (a.company || '').toLowerCase()
          bValue = (b.company || '').toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredClients(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [clients, searchQuery, statusFilter, sortField, sortDirection])

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
      const currentPageClients = getCurrentPageClients()
      setSelectedClients([...new Set([...selectedClients, ...currentPageClients.map(client => client.id)])])
    } else {
      const currentPageClientIds = getCurrentPageClients().map(client => client.id)
      setSelectedClients(selectedClients.filter(id => !currentPageClientIds.includes(id)))
    }
  }

  const handleSelectClient = (clientId: number, checked: boolean | string) => {
    if (checked === true) {
      setSelectedClients([...selectedClients, clientId])
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId))
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete client')
      }
      
      const updatedClients = clients.filter(client => client.id !== clientId)
      setClients(updatedClients)
      setSelectedClients(selectedClients.filter(id => id !== clientId))
      setClientToDelete(null)
      setShowDeleteDialog(false)
      toast({
        title: "Success",
        description: "Client deleted successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      const promises = selectedClients.map(id => 
        fetch(`/api/clients/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      
      const updatedClients = clients.filter(client => !selectedClients.includes(client.id))
      setClients(updatedClients)
      setSelectedClients([])
      setShowBulkDeleteDialog(false)
      toast({
        title: "Success",
        description: `${selectedClients.length} clients deleted successfully`
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete selected clients",
        variant: "destructive"
      })
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Address', 'City', 'State', 'Status', 'Created']
    const csvData = filteredClients.map(client => [
      client.name,
      client.email,
      client.phone || '',
      client.company || '',
      client.address || '',
      client.city || '',
      client.state || '',
      client.isActive ? 'Active' : 'Inactive',
      formatDate(client.createdAt)
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const getCurrentPageClients = () => {
    return filteredClients.slice(startIndex, endIndex)
  }

  const currentPageClients = getCurrentPageClients()

  // Check if all current page clients are selected
  const isAllCurrentPageSelected = currentPageClients.length > 0 && currentPageClients.every(client => selectedClients.includes(client.id))
  const isSomeCurrentPageSelected = currentPageClients.some(client => selectedClients.includes(client.id))

  if (authLoading || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter(c => c.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter(c => !c.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => {
                const clientDate = new Date(c.createdAt)
                const now = new Date()
                return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
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
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {selectedClients.length > 0 && (
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedClients.length} clients selected
            </span>
            <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

            {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead className="min-w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-medium"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('email')}
                  className="h-auto p-0 font-medium"
                >
                  Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-32 hidden md:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('company')}
                  className="h-auto p-0 font-medium"
                >
                  Company
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-32 hidden lg:table-cell">Contact</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24 hidden xl:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('createdAt')}
                  className="h-auto p-0 font-medium"
                >
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' 
                        ? "No clients found matching your criteria" 
                        : "No clients yet. Add your first client to get started."
                      }
                    </div>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPageClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => handleSelectClient(client.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{client.name}</div>
                      {/* Show company on mobile */}
                      <div className="md:hidden text-sm text-muted-foreground truncate">
                        {client.company && `🏢 ${client.company}`}
                      </div>
                      {/* Show contact info on smaller screens */}
                      <div className="lg:hidden mt-1 space-y-1">
                        {client.phone && (
                          <a href={`tel:${client.phone}`} className="text-primary hover:underline flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </a>
                        )}
                        {(client.city || client.state) && (
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            {[client.city, client.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      {/* Show created date on smaller screens */}
                      <div className="xl:hidden mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(client.createdAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={`mailto:${client.email}`}
                      className="text-primary hover:underline block truncate"
                    >
                      {client.email}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="truncate">{client.company || '-'}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-col gap-1 text-sm min-w-0">
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="text-primary hover:underline flex items-center gap-1 truncate">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </a>
                      )}
                      {(client.city || client.state) && (
                        <span className="text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" />
                          {[client.city, client.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden xl:table-cell">
                    {formatDate(client.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedClient(client)
                          loadClientProjects(client.id)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setClientToDelete(client.id)
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredClients.length)} of {filteredClients.length} clients
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
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
              This action cannot be undone. This will permanently delete the client
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
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
            <AlertDialogTitle>Delete {selectedClients.length} clients?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected clients
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedClients.length} clients
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              {selectedClient && (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(selectedClient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={selectedClient.isActive ? "default" : "secondary"}>
                        {selectedClient.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {selectedClient.company && (
                        <span className="text-muted-foreground">{selectedClient.company}</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="grid gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a 
                          href={`mailto:${selectedClient.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {selectedClient.email}
                        </a>
                      </div>
                    </div>

                    {selectedClient.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <a 
                            href={`tel:${selectedClient.phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {selectedClient.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedClient.company && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Company</p>
                          <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                        </div>
                      </div>
                    )}

                    {selectedClient.website && (
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a 
                            href={selectedClient.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {selectedClient.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(selectedClient.address || selectedClient.city || selectedClient.state) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Address Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedClient.address && (
                        <p className="text-sm">{selectedClient.address}</p>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {selectedClient.city && <span>{selectedClient.city}</span>}
                        {selectedClient.city && selectedClient.state && <span>,</span>}
                        {selectedClient.state && <span>{selectedClient.state}</span>}
                        {selectedClient.zipCode && <span>{selectedClient.zipCode}</span>}
                        {selectedClient.country && <span>{selectedClient.country}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedClient.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedClient.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {clientProjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Projects ({clientProjects.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{project.title}</h4>
                              {project.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={
                              project.status === 'completed' ? 'default' :
                              project.status === 'in-progress' ? 'secondary' :
                              project.status === 'on-hold' ? 'destructive' : 'outline'
                            }>
                              {project.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            {project.startDate && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Start Date</p>
                                  <p>{formatDate(project.startDate)}</p>
                                </div>
                              </div>
                            )}
                            
                            {project.deadline && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Deadline</p>
                                  <p>{formatDate(project.deadline)}</p>
                                </div>
                              </div>
                            )}
                            
                            {project.progressPercentage !== undefined && (
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Progress</p>
                                  <p>{project.progressPercentage}%</p>
                                </div>
                              </div>
                            )}
                            
                            {project.projectValue && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Value</p>
                                  <p>${project.projectValue.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {project.priority && (
                            <div className="mt-3">
                              <Badge variant="outline" className="text-xs">
                                {project.priority} Priority
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Client History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(selectedClient.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{formatDate(selectedClient.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
