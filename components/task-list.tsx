"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TaskWithRelations } from '@/lib/api/tasks';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Building2,
  ArrowUpDown,
  ChevronDown,
  Eye,
  ExternalLink,
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
  PlayCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskListProps {
  tasks: TaskWithRelations[];
  onEditTask: (task: TaskWithRelations) => void;
  onDeleteTask: (task: TaskWithRelations) => void;
}

const statusConfig = {
  TODO: { 
    label: 'To Do', 
    color: 'bg-slate-100 text-slate-800 border-slate-200', 
    icon: Circle
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: PlayCircle
  },
  IN_REVIEW: { 
    label: 'In Review', 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: AlertCircle
  },
  DONE: { 
    label: 'Done', 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: CheckCircle
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircle
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

export function TaskList({ tasks, onEditTask, onDeleteTask }: TaskListProps) {
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedTasks, setSortedTasks] = useState<TaskWithRelations[]>(tasks);

  // Sort tasks when sort field or direction changes
  React.useEffect(() => {
    const sorted = [...tasks].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'project':
          aValue = (a.project?.title || '').toLowerCase();
          bValue = (b.project?.title || '').toLowerCase();
          break;
        case 'assignee':
          aValue = a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}`.toLowerCase() : '';
          bValue = b.assignedTo ? `${b.assignedTo.firstName} ${b.assignedTo.lastName}`.toLowerCase() : '';
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate || '').getTime();
          bValue = new Date(b.dueDate || '').getTime();
          break;
        case 'estimatedHours':
          aValue = a.estimatedHours || 0;
          bValue = b.estimatedHours || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedTasks(sorted);
  }, [tasks, sortField, sortDirection]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const handleRowClick = (e: React.MouseEvent, taskId: number) => {
    // Don't navigate if clicking on checkbox, dropdown, or buttons
    if ((e.target as HTMLElement).closest('input[type="checkbox"], button, [data-dropdown-trigger]')) {
      return;
    }
    router.push(`/tasks/${taskId}`);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 border rounded-none bg-background">
        <div className="text-muted-foreground text-lg">No tasks found</div>
        <p className="text-muted-foreground/70 mt-2">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="border rounded-none bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTasks.length === tasks.length && tasks.length > 0}
                onCheckedChange={handleSelectAll}
                className="rounded-none"
              />
            </TableHead>
            <TableHead className="w-12">
              <Hash className="h-4 w-4 text-muted-foreground" />
            </TableHead>
            <TableHead className="min-w-[200px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('title')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Task
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[120px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell min-w-[100px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('priority')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Priority
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[150px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('project')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Project
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[150px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('assignee')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Assignee
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[120px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('dueDate')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Due Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell min-w-[100px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('estimatedHours')}
                className="h-auto p-0 font-semibold text-foreground hover:text-foreground/80 rounded-none"
              >
                Hours
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const currentStatus = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.TODO;
            const currentPriority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
            const StatusIcon = currentStatus?.icon || Circle;
            
            return (
              <TableRow 
                key={task.id} 
                className="hover:bg-muted/30 group cursor-pointer border-b" 
                onClick={(e) => handleRowClick(e, task.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                    className="rounded-none"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-none border text-xs font-medium text-muted-foreground">
                    {task.id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground truncate max-w-[180px] flex items-center gap-2">
                      <StatusIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {task.description}
                      </div>
                    )}
                    {/* Show priority on mobile */}
                    <div className="md:hidden">
                      <Badge variant="outline" className={`${currentPriority.color} text-xs rounded-none`}>
                        <span className="mr-1">{currentPriority.icon}</span>
                        {currentPriority.label}
                      </Badge>
                    </div>
                    {/* Tags on mobile */}
                    {task.tags && (
                      <div className="flex flex-wrap gap-1 mt-1 lg:hidden">
                        {task.tags.split(',').slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs rounded-none">
                            {tag.trim()}
                          </Badge>
                        ))}
                        {task.tags.split(',').length > 2 && (
                          <Badge variant="outline" className="text-xs rounded-none">
                            +{task.tags.split(',').length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${currentStatus.color} rounded-none border`}>
                    {currentStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className={`${currentPriority.color} rounded-none`}>
                    <span className="mr-1">{currentPriority.icon}</span>
                    {currentPriority.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {task.project ? (
                    <div className="space-y-1">
                      <div className="font-medium text-foreground truncate max-w-[120px]">
                        {task.project.title}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No project</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {task.assignedTo ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 bg-muted rounded-none border flex items-center justify-center text-xs font-medium">
                        {getInitials(task.assignedTo.firstName, task.assignedTo.lastName)}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground truncate max-w-[100px]">
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm text-foreground">
                      {formatDate(task.dueDate)}
                    </div>
                    {task.dueDate && new Date(task.dueDate) < new Date() && (
                      <Badge variant="destructive" className="text-xs rounded-none">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-sm text-foreground">
                    {task.estimatedHours ? `${task.estimatedHours}h` : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                        data-dropdown-trigger
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none">
                      <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteTask(task)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Tags section for larger screens */}
      {sortedTasks.some(task => task.tags) && (
        <div className="p-4 border-t bg-muted/30 hidden lg:block">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Tags</h4>
            {sortedTasks.filter(task => task.tags).slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground min-w-[100px] truncate">
                  {task.title}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {task.tags!.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs rounded-none">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 