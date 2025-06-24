"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/task-form';
import { KanbanBoard } from '@/components/kanban-board';
import { TaskList } from '@/components/task-list';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  TaskWithRelations,
  TaskFormData 
} from '@/lib/api/tasks';
import { getProjects } from '@/lib/api/projects';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  Calendar,
  User,
  Clock,
} from 'lucide-react';

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
} as const;

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
} as const;

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export default function TasksPage() {
  const { user, loading: authLoading, requireAuth } = useAuth();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithRelations[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load tasks and projects
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        getTasks(),
        getProjects()
      ]);
      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(task => task.projectId.toString() === projectFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, projectFilter, priorityFilter]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle create task
  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      setIsSubmitting(true);
      const newTask = await createTask(taskData);
      toast.success('Task created successfully');
      setShowCreateDialog(false);
      
      // Add the new task to the current list
      setTasks(prevTasks => [...prevTasks, newTask as TaskWithRelations]);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit task with optimistic updates
  const handleEditTask = async (taskData: TaskFormData) => {
    if (!selectedTask) return;

    // Store original task for potential rollback
    const originalTask = selectedTask;
    
    // Optimistically update the task in the UI
    const optimisticTask = { ...selectedTask, ...taskData };
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === selectedTask.id ? optimisticTask : task
    ));
    setSelectedTask(optimisticTask);

    try {
      setIsSubmitting(true);
      const updatedTask = await updateTask(selectedTask.id, taskData);
      toast.success('Task updated successfully');
      setShowEditDialog(false);
      setSelectedTask(null);
      
      // Update with the actual server response
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === selectedTask.id ? { ...task, ...updatedTask } : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
      
      // Revert the optimistic update on error
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === selectedTask.id ? originalTask : task
      ));
      setSelectedTask(originalTask);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete task with optimistic updates
  const handleDeleteTask = async (task: TaskWithRelations) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    // Optimistically remove the task from UI
    const originalTasks = tasks;
    setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));

    try {
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
      
      // Revert the optimistic update on error
      setTasks(originalTasks);
    }
  };

  // Handle drag and drop status change with optimistic updates
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    // Find the task to update
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    // Optimistically update the UI
    const optimisticTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as TaskWithRelations['status'] }
        : task
    );
    setTasks(optimisticTasks);

    try {
      // Make the API call
      await updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
      
      // Revert the optimistic update on error
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: taskToUpdate.status }
          : task
      ));
    }
  };

  // Open edit dialog
  const openEditDialog = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-3 p-3 pt-0 overflow-hidden">
          <div className="w-full">
            <div className="space-y-4 overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Tasks</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your tasks and track progress</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 min-w-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 min-w-0">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Projects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="justify-start sm:justify-center"
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="justify-start sm:justify-center"
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>

                            {/* Task View */}
              <div className="w-full overflow-hidden">
                {viewMode === 'kanban' ? (
                  <div className="overflow-x-auto">
                    <KanbanBoard
                      tasks={filteredTasks}
                      onStatusChange={handleStatusChange}
                      onEditTask={openEditDialog}
                      onDeleteTask={handleDeleteTask}
                      onAddTask={() => setShowCreateDialog(true)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Task Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-500">Total Tasks</div>
                        <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-500">In Progress</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {filteredTasks.filter(t => t.status === 'IN_PROGRESS').length}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-500">Completed</div>
                        <div className="text-2xl font-bold text-green-600">
                          {filteredTasks.filter(t => t.status === 'DONE').length}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-500">Overdue</div>
                        <div className="text-2xl font-bold text-red-600">
                          {filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <TaskList
                        tasks={filteredTasks}
                        onEditTask={openEditDialog}
                        onDeleteTask={handleDeleteTask}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <TaskForm
              projects={projects}
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={isSubmitting}
              submitLabel="Create Task"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
                projects={projects}
                onSubmit={handleEditTask}
                onCancel={() => {
                  setShowEditDialog(false);
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
          </div>
        </div>
        </SidebarInset>
      </SidebarProvider>
    );
} 