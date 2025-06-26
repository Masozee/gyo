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
import { getTask, updateTask, deleteTask, getTaskComments, createTaskComment, getTaskFiles, uploadTaskFile, uploadCommentFile, TaskWithRelations, TaskFormData } from '@/lib/api/tasks';
import { getProjects } from '@/lib/api/projects';
import { FileUpload } from '@/components/file-upload';
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
  Image as ImageIcon,
  FileText as FileTextIcon,
  File as FileIcon,
  X,
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

interface TaskComment {
  id: number;
  content: string;
  isInternal: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  attachments?: {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    description?: string;
    createdAt: string | Date;
  }[];
}

interface TaskFile {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  createdAt: string | Date;
  uploadedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
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
    id?: number;
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
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [commentFileUpload, setCommentFileUpload] = useState<number | null>(null); // Track which comment is being used for file upload

  const taskId = parseInt(params.id as string);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);


  // Load task data
  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, projectsData, commentsData, filesData] = await Promise.all([
        getTask(taskId),
        getProjects(),
        getTaskComments(taskId),
        getTaskFiles(taskId)
      ]);
      setTask(taskData);
      setProjects(projectsData);
      setComments(commentsData);
      setFiles(filesData);
      setEditedTitle(taskData.title);
      
      // Create activity timeline from comments and task updates
      const taskActivities: Activity[] = [
        {
          id: 1,
          type: 'created',
          description: 'Task was created',
          createdAt: typeof taskData.createdAt === 'string' ? taskData.createdAt : taskData.createdAt?.toISOString() || new Date().toISOString(),
          author: { firstName: "System", lastName: "" }
        }
      ];

      // Add comment activities
      commentsData.forEach((comment: TaskComment) => {
        taskActivities.push({
          id: comment.id + 1000,
          type: 'comment',
          description: 'Added a comment',
          createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : comment.createdAt.toISOString(),
          author: { 
            firstName: comment.author.firstName, 
            lastName: comment.author.lastName,
            id: comment.author.id // Add ID for checking
          }
        });
      });

      // Sort activities by date
      taskActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActivities(taskActivities);
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

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !task || !user) return;

    try {
      // Use a default user ID of 1 for Supabase auth users
      const comment = await createTaskComment(task.id, newComment, 1, false);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added');
      
      // Reload data to get updated activities
      loadTask();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Handle file upload
  const handleFileUpload = async (fileData: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    description?: string;
  }) => {
    if (!task || !user) return;

    try {
      const file = await uploadTaskFile(
        task.id,
        task.projectId,
        1, // Use default user ID for Supabase auth users
        fileData.fileName,
        fileData.fileUrl,
        fileData.fileSize,
        fileData.fileType,
        fileData.description
      );
      setFiles([file, ...files]);
      setShowFileUpload(false);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    }
  };

  // Handle comment file upload
  const handleCommentFileUpload = async (fileData: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    description?: string;
  }) => {
    if (!task || !user || !commentFileUpload) return;

    try {
      const file = await uploadCommentFile(
        commentFileUpload,
        task.projectId,
        1, // Use default user ID for Supabase auth users
        fileData.fileName,
        fileData.fileUrl,
        fileData.fileSize,
        fileData.fileType,
        fileData.description
      );
      
      // Update the comment with the new attachment
      setComments(comments.map(comment => 
        comment.id === commentFileUpload 
          ? { ...comment, attachments: [...(comment.attachments || []), file] }
          : comment
      ));
      
      setCommentFileUpload(null);
      toast.success('File attached to comment successfully');
    } catch (error) {
      console.error('Failed to upload comment file:', error);
      toast.error('Failed to upload comment file');
    }
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

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
      router.push('/admin/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
         }
   };

  // Handle copy link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/admin/tasks/${task?.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
                  <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/tasks">Tasks</BreadcrumbLink>
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
        
        <div className="flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="p-6">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-8">
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
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/admin/tasks/${task.id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={handleDeleteTask}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Task Header */}
              <div className="space-y-6 mb-8">
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
            </div>

            {/* Main Content with Sticky Sidebar */}
            <div className="flex gap-8">
              {/* Main Content Area - Scrollable */}
              <div className="flex-1 px-6 pb-6">
                {/* Comments Section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Comments</h2>
                    <Badge variant="secondary" className="rounded-none text-xs">
                      {comments.length}
                    </Badge>
                  </div>

                  {/* Add Comment */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-none border">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 rounded-none">
                        <AvatarFallback className="rounded-none text-xs">
                          {getInitials(user?.email?.charAt(0) || 'U', user?.email?.charAt(1) || 'S')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] rounded-none border-0 bg-background"
                        />
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // For new comments, we'll need to create the comment first
                              // For now, just show the attach files option
                              toast.info('Create the comment first, then attach files to it')
                            }}
                            className="text-xs text-muted-foreground p-0 h-auto"
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            <span>Attach files</span>
                          </Button>
                          <Button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
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
                    {comments.map((comment) => {
                      // If comment author ID is 1 (default), show current Supabase user
                      const isCurrentUser = comment.author.id === 1;
                      const displayName = isCurrentUser 
                        ? (user?.email?.split('@')[0] || 'You')
                        : `${comment.author.firstName} ${comment.author.lastName}`;
                      const initials = isCurrentUser
                        ? getInitials(user?.email?.charAt(0) || 'U', user?.email?.charAt(1) || 'S')
                        : getInitials(comment.author.firstName, comment.author.lastName);

                      return (
                        <div key={comment.id} className="flex gap-3 p-4 hover:bg-muted/20 rounded-none transition-colors">
                          <Avatar className="h-8 w-8 rounded-none">
                            <AvatarFallback className="rounded-none text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {displayName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeDate(comment.createdAt)}
                              </span>
                            </div>
                          <div className="text-sm leading-relaxed">
                            {comment.content}
                          </div>
                          
                          {/* Comment attachments */}
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs text-muted-foreground">
                                {comment.attachments.length} attachment{comment.attachments.length !== 1 ? 's' : ''}
                              </div>
                              <div className="space-y-1">
                                {comment.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
                                    <div className="flex-shrink-0">
                                      {attachment.fileType.startsWith('image/') ? (
                                        <ImageIcon className="h-4 w-4 text-blue-500" />
                                      ) : attachment.fileType.includes('pdf') ? (
                                        <FileTextIcon className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <FileIcon className="h-4 w-4 text-gray-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <a 
                                        href={attachment.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium hover:underline truncate block"
                                      >
                                        {attachment.fileName}
                                      </a>
                                      <div className="text-xs text-muted-foreground">
                                        {(attachment.fileSize / 1024).toFixed(1)} KB
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Attach file to comment */}
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCommentFileUpload(comment.id)}
                              className="text-xs text-muted-foreground p-0 h-auto"
                            >
                              <Paperclip className="h-3 w-3 mr-1" />
                              <span>Attach file</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                  
                  {/* Comment File Upload */}
                  {commentFileUpload && (
                    <div className="mt-4 p-4 border rounded-none bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">
                          Attach file to comment
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCommentFileUpload(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <FileUpload 
                        onFileUploaded={handleCommentFileUpload}
                        maxFileSize={10 * 1024 * 1024} // 10MB
                        acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx']}
                      />
                    </div>
                  )}
                </div>

                {/* Attachments Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Attachments</h2>
                      <Badge variant="secondary" className="rounded-none text-xs">
                        {files.length}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="rounded-none"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add File
                    </Button>
                  </div>

                  {/* File Upload */}
                  {showFileUpload && (
                    <div className="p-4 border rounded-none bg-muted/20">
                      <FileUpload 
                        onFileUploaded={handleFileUpload}
                        maxFileSize={10 * 1024 * 1024} // 10MB
                        acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx']}
                      />
                    </div>
                  )}

                  {/* Files List */}
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded-none hover:bg-muted/20 transition-colors">
                                                 <div className="flex-shrink-0">
                           {file.fileType.startsWith('image/') ? (
                             <ImageIcon className="h-5 w-5 text-blue-500" />
                           ) : file.fileType.includes('pdf') ? (
                             <FileTextIcon className="h-5 w-5 text-red-500" />
                           ) : (
                             <FileIcon className="h-5 w-5 text-gray-500" />
                           )}
                         </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a 
                              href={file.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-sm hover:underline truncate"
                            >
                              {file.fileName}
                            </a>
                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span>Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName}</span>
                            <span>•</span>
                            <span>{formatRelativeDate(file.createdAt)}</span>
                          </div>
                          {file.description && (
                            <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {files.length === 0 && !showFileUpload && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No attachments yet</p>
                        <p className="text-xs">Click "Add File" to upload documents or images</p>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>

              {/* Sticky Sidebar */}
              <div className="w-80 px-6 pb-6">
                <div className="sticky top-6 space-y-6">
                  {/* Activity Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      <h2 className="text-lg font-semibold">Activity</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity, index) => {
                        // If activity author ID is 1 (default), show current Supabase user
                        const isCurrentUser = activity.author.id === 1;
                        const displayName = isCurrentUser 
                          ? (user?.email?.split('@')[0] || 'You')
                          : `${activity.author.firstName} ${activity.author.lastName}`;

                        return (
                          <div key={activity.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-7 w-7 rounded-none bg-muted border flex items-center justify-center">
                                {getActivityIcon(activity.type)}
                              </div>
                              {index < Math.min(activities.length, 5) - 1 && (
                                <div className="w-px h-6 bg-border mt-1"></div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="text-sm">
                                <span className="font-medium">
                                  {displayName}
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
                        );
                      })}
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
