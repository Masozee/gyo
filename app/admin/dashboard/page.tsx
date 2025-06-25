"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { CommandPalette } from "@/components/command-palette"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartBarInteractive } from "@/components/chart-bar-interactive"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Folder, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Receipt, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  DollarSign,
  Eye,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Activity,
  FileText,
  Globe,
  Zap
} from "lucide-react"
import Link from "next/link"

// Function to fetch real website traffic data
const fetchWebsiteTraffic = async () => {
  try {
    // This would typically fetch from your analytics API (Google Analytics, etc.)
    const response = await fetch('/api/analytics/website-traffic', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch website traffic: ${response.status}`)
    }
    const result = await response.json()
    if (result.success && Array.isArray(result.data)) {
      return result.data
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.warn('Website traffic fetch error, using fallback data:', error)
    // Fallback to realistic sample data
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      visitors: Math.floor(Math.random() * 500) + 800,
      pageViews: Math.floor(Math.random() * 1200) + 2000
    }))
  }
}

// Function to fetch real API traffic data
const fetchApiTraffic = async () => {
  try {
    // This would typically fetch from your server logs or monitoring service
    const response = await fetch('/api/analytics/api-traffic', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch API traffic: ${response.status}`)
    }
    const result = await response.json()
    if (result.success && Array.isArray(result.data)) {
      return result.data
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.warn('API traffic fetch error, using fallback data:', error)
    // Fallback to realistic sample data
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 800) + 1200,
      responses: Math.floor(Math.random() * 750) + 1150,
      errors: Math.floor(Math.random() * 50) + 10,
      avgResponseTime: Math.floor(Math.random() * 100) + 150
    }))
  }
}

// Enhanced sample data with more realistic values
const generateRealtimeData = async () => {
  // Fetch real traffic data with error handling
  let websiteTraffic = []
  let apiTraffic = []
  
  try {
    const results = await Promise.allSettled([
      fetchWebsiteTraffic(),
      fetchApiTraffic()
    ])
    
    websiteTraffic = results[0].status === 'fulfilled' ? results[0].value : []
    apiTraffic = results[1].status === 'fulfilled' ? results[1].value : []
  } catch (error) {
    console.warn('Error fetching traffic data:', error)
    // All functions have their own fallbacks, so this shouldn't happen
  }

  const projects = [
    {
      id: 1,
      title: "E-commerce Platform Redesign",
      client: "Tech Solutions Inc",
      progress: Math.floor(Math.random() * 20) + 70,
      status: "IN_PROGRESS",
      deadline: "2024-12-30",
      isUrgent: false,
      team: 4
    },
    {
      id: 2,
      title: "Mobile App Development",
      client: "StartupCo",
      progress: Math.floor(Math.random() * 30) + 40,
      status: "IN_PROGRESS",
      deadline: "2024-12-15",
      isUrgent: true,
      team: 3
    },
    {
      id: 3,
      title: "Brand Identity Package",
      client: "Creative Agency",
      progress: Math.floor(Math.random() * 10) + 85,
      status: "IN_PROGRESS",
      deadline: "2024-12-10",
      isUrgent: false,
      team: 2
    }
  ]

  return {
    projects,
    tasks: [
      {
        id: 1,
        title: "Design homepage mockups",
        project: "E-commerce Platform",
        priority: "HIGH",
        dueDate: "2024-12-08",
        status: "IN_PROGRESS",
        timeLeft: "2 days",
        assignee: "John Doe"
      },
      {
        id: 2,
        title: "Implement user authentication",
        project: "Mobile App Development",
        priority: "URGENT",
        dueDate: "2024-12-06",
        status: "TODO",
        timeLeft: "Overdue",
        assignee: "Jane Smith"
      },
      {
        id: 3,
        title: "Create logo variations",
        project: "Brand Identity Package",
        priority: "MEDIUM",
        dueDate: "2024-12-09",
        status: "IN_REVIEW",
        timeLeft: "3 days",
        assignee: "Mike Johnson"
      },
      {
        id: 4,
        title: "Setup payment gateway",
        project: "E-commerce Platform",
        priority: "HIGH",
        dueDate: "2024-12-12",
        status: "TODO",
        timeLeft: "6 days",
        assignee: "Sarah Wilson"
      }
    ],
    schedule: [
      {
        id: 1,
        title: "Client meeting - Project Review",
        client: "Tech Solutions Inc",
        date: "2024-12-06",
        time: "10:00 AM",
        type: "meeting",
        duration: "1h",
        isToday: true
      },
      {
        id: 2,
        title: "Project Deadline",
        project: "Brand Identity Package",
        date: "2024-12-10",
        time: "End of day",
        type: "deadline",
        duration: null,
        isToday: false
      },
      {
        id: 3,
        title: "Design presentation",
        client: "StartupCo",
        date: "2024-12-12",
        time: "2:00 PM",
        type: "presentation",
        duration: "2h",
        isToday: false
      }
    ],
    invoices: [
      {
        id: 1,
        invoiceNumber: "INV001-0001-12-2024",
        client: "Tech Solutions Inc",
        amount: 5420,
        status: "SENT",
        dueDate: "2024-12-15",
        daysOverdue: 0,
        isOverdue: false
      },
      {
        id: 2,
        invoiceNumber: "INV002-0002-12-2024",
        client: "StartupCo",
        amount: 3200,
        status: "PAID",
        dueDate: "2024-12-10",
        daysOverdue: 0,
        isOverdue: false
      },
      {
        id: 3,
        invoiceNumber: "INV003-0003-11-2024",
        client: "Creative Agency",
        amount: 2800,
        status: "OVERDUE",
        dueDate: "2024-11-30",
        daysOverdue: 6,
        isOverdue: true
      }
    ],
    analytics: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      desktop: Math.floor(Math.random() * 200) + 300,
      mobile: Math.floor(Math.random() * 150) + 250
    })),
    websiteTraffic,
    apiTraffic,
    metrics: {
      totalVisitors: Math.floor(Math.random() * 1000) + 5000,
      pageViews: Math.floor(Math.random() * 2000) + 12000,
      conversionRate: (Math.random() * 2 + 2).toFixed(1),
      revenue: Math.floor(Math.random() * 5000) + 15000
    }
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'URGENT': return 'bg-red-500'
    case 'HIGH': return 'bg-amber-500'
    case 'MEDIUM': return 'bg-blue-500'
    case 'LOW': return 'bg-gray-400'
    default: return 'bg-gray-400'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PAID': return 'text-green-700 bg-green-50 border-green-200'
    case 'SENT': return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'OVERDUE': return 'text-red-700 bg-red-50 border-red-200'
    case 'DRAFT': return 'text-gray-700 bg-gray-50 border-gray-200'
    default: return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

export default function DashboardPage() {
  const { user, loading, requireAuth } = useAuth()
  const [data, setData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    requireAuth()
  }, [requireAuth])

  // Simulate real-time data fetching
  useEffect(() => {
    const fetchData = async () => {
      const newData = await generateRealtimeData()
      setData(newData)
      setLastUpdated(new Date())
    }

    fetchData()
    
    // Update data every 30 seconds to simulate real-time updates
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const newData = await generateRealtimeData()
    setData(newData)
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  if (loading || !data) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <CommandPalette />
              <ThemeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <LoadingSkeleton />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const { projects, tasks, schedule, invoices, analytics, metrics, websiteTraffic, apiTraffic } = data
  const totalActiveProjects = projects?.length || 0
  const totalUnfinishedTasks = tasks?.length || 0
  const totalUpcomingEvents = schedule?.length || 0
  const totalUnpaidInvoices = invoices?.filter((inv: any) => inv.status !== 'PAID').length || 0
  
  // Ensure arrays exist for traffic data
  const safeWebsiteTraffic = Array.isArray(websiteTraffic) ? websiteTraffic : []
  const safeApiTraffic = Array.isArray(apiTraffic) ? apiTraffic : []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Welcome Section - Clean & Minimal */}
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.firstName || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your projects and tasks for today.
              </p>
            </div>
          </div>

          {/* Key Metrics - Clean Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActiveProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Currently in progress
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUnfinishedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting completion
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUpcomingEvents}</div>
                <p className="text-xs text-muted-foreground">
                  In the next 7 days
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Organized Grid */}
          <div className="space-y-6">
            
            {/* Row 1: Daily Traffic + Analytics Overview */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Daily Traffic - Left 2 Columns */}
              <div className="lg:col-span-2 space-y-6">
              {/* Website Traffic */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <CardTitle>Daily Website Traffic</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/analytics">
                        View Details <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Website visitors and page views for the past 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                        <div className="text-xl font-bold text-blue-700">
                          {safeWebsiteTraffic.reduce((acc: number, curr: any) => acc + curr.visitors, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Total Visitors</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50/50 border border-green-100">
                        <div className="text-xl font-bold text-green-700">
                          {safeWebsiteTraffic.reduce((acc: number, curr: any) => acc + curr.pageViews, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-green-600 font-medium">Page Views</p>
                      </div>
                    </div>
                    
                    {/* Vertical Bar Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={safeWebsiteTraffic.map(day => ({
                          ...day,
                          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="date" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                            formatter={(value: any, name: string) => [
                              value.toLocaleString(),
                              name === 'visitors' ? 'Visitors' : 'Page Views'
                            ]}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value) => value === 'visitors' ? 'Visitors' : 'Page Views'}
                          />
                          <Bar 
                            dataKey="visitors" 
                            fill="hsl(217, 91%, 60%)"
                            radius={[2, 2, 0, 0]}
                            name="visitors"
                          />
                          <Bar 
                            dataKey="pageViews" 
                            fill="hsl(142, 76%, 36%)"
                            radius={[2, 2, 0, 0]}
                            name="pageViews"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Traffic */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <CardTitle>Daily API Traffic</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/analytics">
                        View Details <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>API requests and responses for the past 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                        <div className="text-lg font-bold text-purple-700">
                          {safeApiTraffic.reduce((acc: number, curr: any) => acc + curr.requests, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-purple-600 font-medium">Requests</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                        <div className="text-lg font-bold text-orange-700">
                          {safeApiTraffic.reduce((acc: number, curr: any) => acc + curr.responses, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-orange-600 font-medium">Responses</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-50/50 border border-red-100">
                        <div className="text-lg font-bold text-red-700">
                          {safeApiTraffic.reduce((acc: number, curr: any) => acc + curr.errors, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-red-600 font-medium">Errors</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                        <div className="text-lg font-bold text-blue-700">
                          {Math.round(safeApiTraffic.reduce((acc: number, curr: any) => acc + curr.avgResponseTime, 0) / safeApiTraffic.length || 0)}ms
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Avg Response</p>
                      </div>
                    </div>
                    
                    {/* Vertical Bar Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={safeApiTraffic.map(day => ({
                          ...day,
                          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="date" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString()}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                            formatter={(value: any, name: string) => {
                              const formatters = {
                                'requests': 'API Requests',
                                'responses': 'API Responses', 
                                'errors': 'Errors',
                                'avgResponseTime': 'Avg Response Time (ms)'
                              }
                              return [
                                name === 'avgResponseTime' ? `${value}ms` : value.toLocaleString(),
                                formatters[name as keyof typeof formatters] || name
                              ]
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value) => {
                              const formatters = {
                                'requests': 'Requests',
                                'responses': 'Responses',
                                'errors': 'Errors',
                                'avgResponseTime': 'Avg Response (ms)'
                              }
                              return formatters[value as keyof typeof formatters] || value
                            }}
                          />
                          <Bar 
                            dataKey="requests" 
                            fill="hsl(271, 81%, 56%)"
                            radius={[2, 2, 0, 0]}
                            name="requests"
                          />
                          <Bar 
                            dataKey="responses" 
                            fill="hsl(25, 95%, 53%)"
                            radius={[2, 2, 0, 0]}
                            name="responses"
                          />
                          <Bar 
                            dataKey="errors" 
                            fill="hsl(0, 84%, 60%)"
                            radius={[2, 2, 0, 0]}
                            name="errors"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>

              {/* Analytics Overview - Right Column */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <CardTitle>Analytics Overview</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/analytics">
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Website performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid gap-3">
                      <div className="text-center p-3 rounded-lg border bg-card">
                        <div className="text-lg font-bold">{metrics.totalVisitors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <Eye className="h-3 w-3" />
                          Total Visitors
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg border bg-card">
                        <div className="text-lg font-bold">{metrics.pageViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <Activity className="h-3 w-3" />
                          Page Views
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg border bg-card">
                        <div className="text-lg font-bold">{metrics.conversionRate}%</div>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3" />
                          Conversion Rate
                        </p>
                      </div>
                    </div>
                    
                    {/* Mini Chart */}
                    <div className="h-32">
                      <ChartBarInteractive
                        title=""
                        description=""
                        data={analytics.slice(-4)} // Show last 4 days for compact view
                        config={{
                          desktop: {
                            label: "Desktop",
                            color: "hsl(var(--chart-1))",
                          },
                          mobile: {
                            label: "Mobile", 
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2: Schedule + Tasks */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Schedule - Left 2 Columns */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <CardTitle>Upcoming Schedule</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Event
                    </Button>
                  </div>
                  <CardDescription>Your schedule for the next few days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.map((event: any) => (
                      <div key={event.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        event.isToday ? 'bg-blue-50 border-blue-200' : 'bg-card hover:bg-muted/50'
                      }`}>
                        <div className="flex-shrink-0">
                          {event.type === 'meeting' && <Users className="h-4 w-4" />}
                          {event.type === 'deadline' && <AlertCircle className="h-4 w-4" />}
                          {event.type === 'presentation' && <FileText className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {event.title}
                            </h4>
                            {event.isToday && (
                              <Badge variant="secondary" className="text-xs">
                                TODAY
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.client || event.project}
                            {event.duration && ` • ${event.duration}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tasks - Right Column */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      <CardTitle>Tasks</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/tasks">
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Pending items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {task.project}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <span className={`text-xs ${
                                task.timeLeft === 'Overdue' ? 'text-red-500' : 'text-muted-foreground'
                              }`}>
                                {task.timeLeft}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Invoices - Full Width */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    <CardTitle>Recent Invoices</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/invoices">
                      View All <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
                <CardDescription>Track your invoice payments and outstanding amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {invoices.map((invoice: any) => (
                    <div key={invoice.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">
                            {invoice.invoiceNumber}
                          </h4>
                          <Badge className={`text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{invoice.client}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">
                            ${invoice.amount.toLocaleString()}
                          </span>
                          {invoice.isOverdue && (
                            <span className="text-xs text-red-500 font-medium">
                              {invoice.daysOverdue}d overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
