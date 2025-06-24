"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TaskWithRelations } from '@/lib/api/tasks';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: TaskWithRelations;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (task: TaskWithRelations) => void;
  isDragging?: boolean;
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-red-100 text-red-800',
} as const;

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export function TaskCard({ task, onEdit, onDelete, isDragging = false }: TaskCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown or buttons
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger], button')) {
      return;
    }
    router.push(`/tasks/${task.id}`);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Task ID */}
          <div className="flex justify-end">
            <span className="text-xs text-gray-400">#{task.id}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
                {task.title}
              </h4>
              <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  data-dropdown-trigger
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Priority, Separator, and Tags Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            >
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </Badge>
            
            {task.tags && (
              <>
                <span className="text-gray-400 text-sm">|</span>
                <div className="flex flex-wrap gap-1">
                  {task.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <Separator />

          {/* Footer Info - Date and Assigned To */}
          <div className="flex items-center justify-between">
            {/* Due Date */}
            <div className="flex items-center">
              {task.dueDate && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Assigned To - Avatar */}
            {task.assignedTo && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                  {task.assignedTo.firstName?.charAt(0)}{task.assignedTo.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 