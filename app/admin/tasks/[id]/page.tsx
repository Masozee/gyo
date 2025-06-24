"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TaskForm } from '@/components/task-form';
import { getTask, updateTask, TaskWithRelations, TaskFormData } from '@/lib/api/tasks';
import { getProjects } from '@/lib/api/projects';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  User,
  Building2,
  Tag,
  MessageSquare,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
  PlayCircle,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  Users,
  CalendarDays,
  Timer,
  Hash,
  Zap,
  GitBranch,
  Eye,
  MessageCircle,
  Paperclip,
} from 'lucide-react';

const statusConfig = {
  TODO: { 
    label: 'To Do', 
    color: 'bg-slate-100 text-slate-800 border-slate-200', 
    icon: Circle,
    bg: 'bg-slate-50'
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: PlayCircle,
    bg: 'bg-blue-50'
  },
  IN_REVIEW: { 
    label: 'In Review', 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: AlertCircle,
    bg: 'bg-amber-50'
  },
  DONE: { 
    label: 'Done', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: CheckCircle,
    bg: 'bg-emerald-50'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle,
    bg: 'bg-red-50'
  },
} as const;

const priorityConfig = {
  LOW: { 
    label: 'Low', 
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '🟢'
  },
  MEDIUM: { 
    label: 'Medium', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '🟡'
  },
  HIGH: { 
    label: 'High', 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: '🟠'
  },
  URGENT: { 
    label: 'Urgent', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '🔴'
  },
} as const;

interface Note {
  id: number;
  content: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

interface Activity {
  id: number;
  type: 'status_change' | 'priority_change' | 'assignment' | 'comment' | 'created' | 'updated';
  description: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
  metadata?: {
    oldValue?: string;
    newValue?: string;
  };
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, requireAuth } = useAuth();
  const [task, setTask] = useState<TaskWithRelations | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const taskId = parseInt(params.id as string);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load task data
  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, projectsData] = await Promise.all([
        getTask(taskId),
        getProjects()
      ]);
      setTask(taskData);
      setProjects(projectsData);
      setEditedTitle(taskData.title);
      
      // Mock notes and activities for demonstration
      setNotes([
        {
          id: 1,
          content: "Started working on this task. The initial analysis shows we need to implement the advanced table features with sorting and filtering capabilities.",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: { firstName: "John", lastName: "Doe" }
        },
        {
          id: 2,
          content: "Added sorting functionality and responsive design. The table now adapts to different screen sizes. Next step is to implement the filtering system and bulk actions.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: { firstName: "Jane", lastName: "Smith" }
        }
      ]);

      setActivities([
        {
          id: 1,
          type: 'created',
          description: 'Task was created',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          author: { firstName: "John", lastName: "Doe" }
        },
        {
          id: 2,
          type: 'status_change',
          description: 'Status changed from To Do to In Progress',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: { firstName: "John", lastName: "Doe" },
          metadata: { oldValue: 'TODO', newValue: 'IN_PROGRESS' }
        },
        {
          id: 3,
          type: 'assignment',
          description: 'Task assigned to Jane Smith',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          author: { firstName: "John", lastName: "Doe" }
        },
        {
          id: 4,
          type: 'comment',
          description: 'Added a comment',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          author: { firstName: "Jane", lastName: "Smith" }
        }
      ]);
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  // Handle edit task
  const handleEditTask = async (taskData: TaskFormData) => {
    if (!task) return;

    try {
      setIsSubmitting(true);
      const updatedTask = await updateTask(task.id, taskData);
      setTask({ ...task, ...updatedTask });
      toast.success('Task updated successfully');
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add note
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now(),
      content: newNote,
      createdAt: new Date().toISOString(),
      author: { firstName: user?.firstName ?? 'You', lastName: user?.lastName ?? '' }
    };

    setNotes([note, ...notes]);
    setNewNote('');
    toast.success('Note added');
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    try {
      await updateTask(task.id, { status: newStatus as any });
      setTask({ ...task, status: newStatus as any });
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle title edit
  const handleTitleSave = async () => {
    if (!task || editedTitle.trim() === task.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateTask(task.id, { title: editedTitle.trim() });
      setTask({ ...task, title: editedTitle.trim() });
      setIsEditingTitle(false);
      toast.success('Title updated');
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title');
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created': return <Plus className="h-3 w-3" />;
      case 'status_change': return <GitBranch className="h-3 w-3" />;
      case 'assignment': return <User className="h-3 w-3" />;
      case 'comment': return <MessageCircle className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !task) {
    return null;
  }

  const currentStatus = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.TODO;
  const currentPriority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
  const StatusIcon = currentStatus?.icon || Circle;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>#{task.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Task Header */}
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-none border ${currentStatus.bg} ${currentStatus.color}`}>
                  <StatusIcon className="h-4 w-4" />
                </div>
                <Select value={task.status || 'TODO'} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto focus:ring-0 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className={`rounded-none ${currentPriority.color}`}>
                  <span className="mr-1">{currentPriority.icon}</span>
                  {currentPriority.label}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  {task.id}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-3xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave();
                        if (e.key === 'Escape') {
                          setEditedTitle(task.title);
                          setIsEditingTitle(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1 
                    className="text-3xl font-bold cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded-none transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {task.title}
                  </h1>
                )}
                
                {task.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 text-sm">
                {task.project && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{task.project.title}</span>
                  </div>
                )}
                
                {task.assignedTo && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Assigned to {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className={new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                      Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
                
                {task.estimatedHours && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>{task.estimatedHours}h estimated</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && (
                <div className="flex flex-wrap gap-2">
                  {task.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="secondary" className="rounded-none text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Comments Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Comments</h2>
                    <Badge variant="secondary" className="rounded-none text-xs">
                      {notes.length}
                    </Badge>
                  </div>

                  {/* Add Comment */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-none border">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 rounded-none">
                        <AvatarFallback className="rounded-none text-xs">
                          {getInitials(user?.firstName || 'Y', user?.lastName || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="min-h-[80px] rounded-none border-0 bg-background"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            <span>Attach files</span>
                          </div>
                          <Button 
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            size="sm"
                            className="rounded-none"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="flex gap-3 p-4 hover:bg-muted/20 rounded-none transition-colors">
                        <Avatar className="h-8 w-8 rounded-none">
                          <AvatarFallback className="rounded-none text-xs">
                            {getInitials(note.author.firstName, note.author.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {note.author.firstName} {note.author.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeDate(note.createdAt)}
                            </span>
                          </div>
                          <div className="text-sm leading-relaxed">
                            {note.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Activity Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Activity</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-none bg-muted border flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          {index < activities.length - 1 && (
                            <div className="w-px h-6 bg-border mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">
                              {activity.author.firstName} {activity.author.lastName}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              {activity.description}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeDate(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Details</h2>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">{formatDate(task.createdAt || new Date().toISOString())}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Updated</span>
                      <span className="font-medium">{formatDate(task.updatedAt || new Date().toISOString())}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Due Date</span>
                        <span className={`font-medium ${
                          new Date(task.dueDate) < new Date() ? 'text-red-600' : ''
                        }`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    )}
                    {task.estimatedHours && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Estimated</span>
                        <span className="font-medium">{task.estimatedHours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-none">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <TaskForm
                initialData={{
                  title: task.title,
                  description: task.description || '',
                  projectId: task.projectId,
                  assignedToId: task.assignedToId || undefined,
                  priority: task.priority as any,
                  status: task.status as any,
                  dueDate: task.dueDate || '',
                  estimatedHours: task.estimatedHours || undefined,
                  tags: task.tags || '',
                  parentTaskId: task.parentTaskId || undefined,
                }}
                projects={projects}
                onSubmit={handleEditTask}
                onCancel={() => setShowEditDialog(false)}
                isLoading={isSubmitting}
                submitLabel="Update Task"
              />
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
