"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProjectWithRelations } from '@/lib/api/projects';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  Building2, 
  Mail,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

interface ProjectDetailsDialogProps {
  project: ProjectWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (project: ProjectWithRelations) => void;
  onDelete?: (project: ProjectWithRelations) => void;
  onUpdateProgress?: (project: ProjectWithRelations, progress: number) => void;
}

const statusColors = {
  PLANNING: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
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

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onUpdateProgress,
}: ProjectDetailsDialogProps) {
  if (!project) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateEstimatedRevenue = () => {
    // Note: hourlyRate and estimatedHours are not in the project schema
    // They would be calculated from tasks or time logs
    return null;
  };

  const estimatedRevenue = calculateEstimatedRevenue();
  const progressPercentage = project.progressPercentage || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">
                {project.title}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
                <Badge className={priorityColors[project.priority as keyof typeof priorityColors]}>
                  {priorityLabels[project.priority as keyof typeof priorityLabels]}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(project)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(project)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {project.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Progress</h3>
              <span className="text-sm font-medium">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {onUpdateProgress && project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && (
              <div className="flex space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateProgress(project, Math.min(100, progressPercentage + 10))}
                >
                  +10%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateProgress(project, Math.min(100, progressPercentage + 25))}
                >
                  +25%
                </Button>
                {progressPercentage < 100 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateProgress(project, 100)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              {project.client ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{project.client.name}</span>
                  </div>
                  {project.client.company && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{project.client.company}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{project.client.email}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No client assigned</p>
              )}
            </div>

            {/* Project Manager */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Manager</h3>
              {project.user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{project.user.firstName} {project.user.lastName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{project.user.email}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No project manager assigned</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(project.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(project.deadline)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(project.completedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Project Value</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(project.projectValue)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Tax Rate</p>
                  <p className="text-sm text-gray-600">
                    {project.taxRate ? `${project.taxRate}%` : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Tax Amount</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(project.taxAmount)}
                  </p>
                </div>
              </div>
              {estimatedRevenue && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Est. Revenue</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(estimatedRevenue)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {formatDate(project.createdAt)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {formatDate(project.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 