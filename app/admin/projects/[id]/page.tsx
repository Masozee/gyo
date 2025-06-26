"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskList } from '@/components/task-list';
import { 
  getProject, 
  updateProject, 
  deleteProject,
  updateProjectProgress,
  ProjectWithRelations,
  ProjectFormData 
} from '@/lib/api/projects';
import { getTasks, TaskWithRelations, TaskFormData, updateTask, deleteTask } from '@/lib/api/tasks';
import { getExpensesByProject } from '@/lib/api/expenses';
import { getInvoicesByProject, type InvoiceWithRelations } from '@/lib/api/invoices';
import { getDocumentsByProject } from '@/lib/api/documents';
import { ProjectForm } from '@/components/project-form';
import { TaskForm } from '@/components/task-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Mail,
  Phone,
  Globe,
  Receipt,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  MoreHorizontal,
  Briefcase,
  CalendarDays,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusColors = {
  PLANNING: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-transparent border-2 border-[var(--neon-primary)] text-[var(--neon-primary)] hover:bg-[var(--neon-primary)] hover:text-black',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-transparent border-2 border-[var(--neon-primary)] text-[var(--neon-primary)] hover:bg-[var(--neon-primary)] hover:text-black',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
} as const;

const statusLabels = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

const invoiceStatusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;

const invoiceStatusIcons = {
  DRAFT: Clock,
  SENT: Send,
  PAID: CheckCircle,
  OVERDUE: AlertCircle,
  CANCELLED: XCircle,
} as const;

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load project details and related data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        
        // Load project details
        const projectData = await getProject(projectId);
        setProject(projectData);

        // Load related data in parallel
        const [tasksData, expensesData, invoicesData, documentsData] = await Promise.all([
          getTasks(projectId),
          getExpensesByProject(projectId),
          getInvoicesByProject(projectId),
          getDocumentsByProject(projectId)
        ]);

        setTasks(tasksData);
        setExpenses(expensesData);
        setInvoices(invoicesData);
        setDocuments(documentsData);

      } catch (error) {
        console.error('Failed to load project data:', error);
        toast.error('Failed to load project details');
        router.push('/admin/projects');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId, router]);

  const handleEditProject = async (projectData: ProjectFormData) => {
    if (!project) return;

    try {
      setIsSubmitting(true);
      await updateProject(project.id, projectData);
      toast.success('Project updated successfully');
      setShowEditDialog(false);
      
      // Reload project data
      const updatedProject = await getProject(projectId);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      router.push('/admin/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleUpdateProgress = async (progress: number) => {
    if (!project) return;

    try {
      await updateProjectProgress(project.id, progress);
      toast.success('Progress updated successfully');
      
      // Update local state
      setProject({ ...project, progressPercentage: progress });
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleEditTask = async (taskData: TaskFormData) => {
    if (!selectedTask) return;

    try {
      setIsSubmitting(true);
      await updateTask(selectedTask.id, taskData);
      toast.success('Task updated successfully');
      setShowTaskDialog(false);
      setSelectedTask(null);
      
      // Reload tasks
      const updatedTasks = await getTasks(projectId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (task: TaskWithRelations) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
      
      // Reload tasks
      const updatedTasks = await getTasks(projectId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const openEditTaskDialog = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInvoiceStatusIcon = (status: string) => {
    const Icon = invoiceStatusIcons[status as keyof typeof invoiceStatusIcons] || Clock;
    return Icon;
  };

  // Calculate progress based on completed tasks automatically
  const calculateProjectStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    return {
      totalTasks,
      completedTasks,
      taskProgress, // This now automatically reflects completed tasks
      totalExpenses,
      totalInvoiced,
      paidAmount,
      pendingAmount: totalInvoiced - paidAmount
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/admin/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const stats = calculateProjectStats();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border rounded-none p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        {/* Project Title and Meta */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
            
            <div className="flex items-center flex-wrap gap-4 mb-4">
              <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                {statusLabels[project.status as keyof typeof statusLabels]}
              </Badge>
              <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors]}>
                {priorityLabels[project.priority as keyof typeof priorityLabels]}
              </Badge>
              
              {project.client && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-1" />
                  {project.client.name}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDays className="h-4 w-4 mr-1" />
                {formatDate(project.startDate)} - {formatDate(project.deadline)}
              </div>
              
              {project.projectValue && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(project.projectValue)}
                </div>
              )}
            </div>

            {project.description && (
              <p className="text-gray-700 text-sm max-w-3xl">{project.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-6">
            {project.client && (
              <Button 
                variant="outline"
                onClick={() => router.push(`/admin/invoices/new?projectId=${project.id}&clientId=${project.clientId}`)}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Invoice
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Progress Section - Auto-calculated based on completed tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Project Progress (Based on Completed Tasks)</span>
            <span className="text-lg font-bold text-gray-900">{stats.taskProgress}%</span>
          </div>
          <Progress value={stats.taskProgress} className="h-3" />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{stats.completedTasks} of {stats.totalTasks} tasks completed</span>
            <span>{stats.totalTasks - stats.completedTasks} remaining</span>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalExpenses)}</div>
            <div className="text-sm text-gray-500">Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalInvoiced)}</div>
            <div className="text-sm text-gray-500">Invoiced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.paidAmount)}</div>
            <div className="text-sm text-gray-500">Paid</div>
          </div>
        </div>
      </div>

      {/* Simplified Tabs - Only 3 tabs instead of 6 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-none bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="overview" className="rounded-none">
            <Briefcase className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-none">
            <Target className="h-4 w-4 mr-2" />
            Tasks & Activities
          </TabsTrigger>
          <TabsTrigger value="financials" className="rounded-none">
            <DollarSign className="h-4 w-4 mr-2" />
            Financials & Documents
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Consolidated project information */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client & Team Information */}
            <div className="space-y-6">
                             {project.client && (
                 <div className="bg-white border rounded-none p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Client Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.client.name}</h4>
                      {project.client.company && (
                        <p className="text-sm text-gray-600">{project.client.company}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {project.client.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${project.client.email}`} className="text-blue-600 hover:underline">
                            {project.client.email}
                          </a>
                        </div>
                      )}
                      
                      {project.client.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${project.client.phone}`} className="text-blue-600 hover:underline">
                            {project.client.phone}
                          </a>
                        </div>
                      )}
                      
                      {project.client.website && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a href={project.client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

                             {project.user && (
                 <div className="bg-white border rounded-none p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Project Manager
                  </h3>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {project.user.firstName || ''} {project.user.lastName || ''}
                    </h4>
                    <p className="text-sm text-gray-600">{project.user.email}</p>
                  </div>
                </div>
              )}
            </div>

                         {/* Timeline & Status */}
             <div className="bg-white border rounded-none p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Project Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Start Date</span>
                  <span className="text-sm text-gray-900">{formatDate(project.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Deadline</span>
                  <span className="text-sm text-gray-900">{formatDate(project.deadline)}</span>
                </div>
                {project.completedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                    <span className="text-sm text-gray-900">{formatDate(project.completedAt)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Status</span>
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Priority</span>
                    <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors]}>
                      {priorityLabels[project.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Project Tasks</h3>
            <Button onClick={() => router.push(`/admin/tasks/new?projectId=${projectId}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          {tasks.length > 0 ? (
            <TaskList
              tasks={tasks}
              onEditTask={openEditTaskDialog}
              onDeleteTask={handleDeleteTask}
            />
                     ) : (
             <div className="text-center py-12 bg-white border rounded-none">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first task for this project.</p>
              <Button onClick={() => router.push(`/admin/tasks/new?projectId=${projectId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Financials & Documents Tab - Consolidated */}
        <TabsContent value="financials" className="mt-6 space-y-6">
                     {/* Expenses Section */}
           <div className="bg-white border rounded-none p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Project Expenses ({expenses.length})
              </h3>
              <Button onClick={() => router.push(`/admin/expenses/new?projectId=${projectId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
            {expenses.length > 0 ? (
              <div className="border rounded-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium">{expense.title}</TableCell>
                        <TableCell>
                          {expense.category && (
                            <Badge variant="outline">{expense.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {expense.billable && (
                              <Badge variant="outline" className="text-xs">Billable</Badge>
                            )}
                            {expense.reimbursed && (
                              <Badge variant="secondary" className="text-xs">Reimbursed</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/expenses/${expense.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/expenses/${expense.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No expenses recorded for this project.</p>
              </div>
            )}
          </div>

          {/* Invoices Section */}
          <div className="bg-white border rounded-none p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Project Invoices ({invoices.length})
              </h3>
              {project.client && (
                <Button onClick={() => router.push(`/admin/invoices/new?projectId=${projectId}&clientId=${project.clientId}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
            {invoices.length > 0 ? (
              <div className="border rounded-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date Issued</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const StatusIcon = getInvoiceStatusIcon(invoice.status || 'DRAFT');
                      const statusColor = invoiceStatusColors[invoice.status as keyof typeof invoiceStatusColors];
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{formatDate(invoice.dateIssued)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColor}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${invoice.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${invoice.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No invoices created for this project.</p>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white border rounded-none p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents & Contracts ({documents.length})
              </h3>
              <Button onClick={() => router.push(`/admin/docs/new?projectId=${projectId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
            {documents.length > 0 ? (
              <div className="border rounded-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/docs/${doc.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/docs/${doc.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No documents uploaded for this project.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ProjectForm
              initialData={{
                title: project.title,
                description: project.description || '',
                clientId: project.clientId || 0,
                userId: project.userId,
                status: project.status as any,
                priority: project.priority as any,
                startDate: project.startDate || '',
                deadline: project.deadline || '',
                projectValue: project.projectValue || undefined,
                progressPercentage: stats.taskProgress, // Use auto-calculated progress
              }}
              onSubmit={handleEditProject}
              onCancel={() => setShowEditDialog(false)}
              isLoading={isSubmitting}
              submitLabel="Update Project"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedTask && (
              <TaskForm
                initialData={{
                  title: selectedTask.title,
                  description: selectedTask.description || '',
                  projectId: selectedTask.projectId,
                  assignedToId: selectedTask.assignedToId || undefined,
                  priority: selectedTask.priority as any,
                  status: selectedTask.status as any,
                  dueDate: selectedTask.dueDate || '',
                  estimatedHours: selectedTask.estimatedHours || undefined,
                  tags: selectedTask.tags || '',
                  parentTaskId: selectedTask.parentTaskId || undefined,
                }}
                projects={[project]}
                onSubmit={handleEditTask}
                onCancel={() => {
                  setShowTaskDialog(false);
                  setSelectedTask(null);
                }}
                isLoading={isSubmitting}
                submitLabel="Update Task"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 