"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign, 
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Grid3X3,
  List,
  Building2,
  Calendar,
  Clock
} from "lucide-react"
import { type Expense } from "@/lib/schema"
import { toast } from "sonner"
import { ClientSafe } from "@/components/client-safe"

export default function ExpensesPage() {
  const router = useRouter()
  const { user, loading: authLoading, requireAuth } = useAuth()
  const [expenses, setExpenses] = useState<(Expense & { project?: any, user?: any })[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<(Expense & { project?: any, user?: any })[]>([])
  const [projects, setProjects] = useState<Array<{ id: number; title: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([])
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const expenseCategories = [
    { value: "all", label: "All Categories" },
    { value: "TRAVEL", label: "Travel" },
    { value: "MATERIALS", label: "Materials" },
    { value: "SOFTWARE", label: "Software" },
    { value: "EQUIPMENT", label: "Equipment" },
    { value: "OTHER", label: "Other" },
  ]

  // Filter and sort expenses
  useEffect(() => {
    let filtered = expenses

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.project?.title.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter)
    }

    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(expense => expense.projectId?.toString() === projectFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'category':
          aValue = a.category || ''
          bValue = b.category || ''
          break
        case 'project':
          aValue = (a.project?.title || '').toLowerCase()
          bValue = (b.project?.title || '').toLowerCase()
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredExpenses(filtered)
  }, [expenses, search, categoryFilter, projectFilter, sortField, sortDirection])

  useEffect(() => {
    requireAuth()
  }, [requireAuth])

  useEffect(() => {
    fetchExpenses()
    fetchProjects()
  }, [])

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      } else {
        toast.error('Failed to load expenses')
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Expense deleted successfully')
        fetchExpenses()
      } else {
        toast.error('Failed to delete expense')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(filteredExpenses.map(expense => expense.id))
    } else {
      setSelectedExpenses([])
    }
  }

  const handleSelectExpense = (expenseId: number, checked: boolean) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId])
    } else {
      setSelectedExpenses(selectedExpenses.filter(id => id !== expenseId))
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const billableExpenses = filteredExpenses.filter(e => e.billable).reduce((sum, expense) => sum + expense.amount, 0)
  const reimbursedExpenses = filteredExpenses.filter(e => e.reimbursed).reduce((sum, expense) => sum + expense.amount, 0)

  // Add auth loading check
  if (authLoading || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Expenses</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage project expenses, monitor spending patterns, and analyze cost allocation.</p>
        </div>
        <Button onClick={() => router.push('/admin/expenses/new')} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-gray-600">
              {filteredExpenses.length} expenses shown
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Billable</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(billableExpenses)}</div>
            <p className="text-xs text-gray-600">
              Can be billed to clients
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Reimbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(reimbursedExpenses)}</div>
            <p className="text-xs text-gray-600">
              Already reimbursed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {Array.isArray(projects) && projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {selectedExpenses.length > 0 && viewMode === 'list' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {selectedExpenses.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedExpenses.length} expenses?`)) {
                    // Handle bulk delete
                    console.log('Delete expenses:', selectedExpenses)
                  }
                }}
                className="text-xs"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expenses Display */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <DollarSign className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {expenses.length === 0 ? 'No expenses yet' : 'No expenses found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {expenses.length === 0 
              ? 'Get started by tracking your first expense.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {expenses.length === 0 && (
            <Button onClick={() => router.push('/admin/expenses/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Expense
            </Button>
          )}
        </div>
      ) : (
        <ClientSafe>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
              {filteredExpenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ExpensesTable />
            </div>
          )}
        </ClientSafe>
      )}
    </div>
  )

  // Component definitions
  function ExpenseCard({ expense }: { expense: Expense & { project?: any, user?: any } }) {
    return (
      <Card className="group hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 flex flex-col h-full">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-3 leading-6 break-words hyphens-auto">
                {expense.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 flex-wrap">
                {expense.category && (
                  <Badge className={getCategoryBadgeColor(expense.category)}>
                    {expense.category}
                  </Badge>
                )}
                {expense.billable && (
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    Billable
                  </Badge>
                )}
                {expense.reimbursed && (
                  <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                    Reimbursed
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-100 transition-opacity flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/admin/expenses/${expense.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/expenses/${expense.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4 flex-1 flex flex-col">
          {/* Amount */}
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(expense.amount, expense.currency || 'USD')}
          </div>

          {/* Info Card */}
          <div className="bg-gray-50 p-4 space-y-3 flex-shrink-0">
            {/* Project */}
            {expense.project && (
              <div className="flex items-start gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900 block leading-tight">{expense.project.title}</span>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">{formatDate(expense.date)}</span>
            </div>

            {/* Description */}
            {expense.description && (
              <div className="text-sm text-gray-600 leading-relaxed">
                {expense.description.length > 100 
                  ? `${expense.description.substring(0, 100)}...`
                  : expense.description
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  function ExpensesTable() {
    return (
      <div className="border rounded-lg bg-white min-w-fit">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
                >
                  Expense
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('project')}
                  className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
                >
                  Project
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('category')}
                  className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('amount')}
                  className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <DollarSign className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {expenses.length === 0 ? 'No expenses yet' : 'No expenses found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {expenses.length === 0 
                      ? 'Get started by tracking your first expense.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {expenses.length === 0 && (
                    <Button onClick={() => router.push('/admin/expenses/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Expense
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-gray-50/50 group">
                  <TableCell>
                    <Checkbox
                      checked={selectedExpenses.includes(expense.id)}
                      onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 truncate max-w-[180px]">
                        {expense.title}
                      </div>
                      {expense.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {expense.description}
                        </div>
                      )}
                      {/* Show category on mobile */}
                      <div className="md:hidden">
                        {expense.category && (
                          <Badge className={`${getCategoryBadgeColor(expense.category)} text-xs`}>
                            {expense.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {expense.project ? (
                      <div className="font-medium text-gray-900 truncate max-w-[120px]">
                        {expense.project.title}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No project</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {expense.category && (
                      <Badge className={getCategoryBadgeColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {formatCurrency(expense.amount, expense.currency || 'USD')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {expense.billable && (
                        <Badge variant="outline" className="text-green-700 border-green-200 text-xs">
                          Billable
                        </Badge>
                      )}
                      {expense.reimbursed && (
                        <Badge variant="secondary" className="text-blue-700 bg-blue-50 text-xs">
                          Reimbursed
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/expenses/${expense.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/expenses/${expense.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
    )
  }
} 