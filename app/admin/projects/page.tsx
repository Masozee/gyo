"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Progress } from '@/components/ui/progress';
import { ProjectForm } from '@/components/project-form';
import { ClientSafe } from '@/components/client-safe';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  ProjectWithRelations,
  ProjectFormData 
} from '@/lib/api/projects';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading, requireAuth } = useAuth();
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort projects
  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.client?.name.toLowerCase().includes(searchLower) ||
        project.client?.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
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
        case 'client':
          aValue = (a.client?.name || '').toLowerCase();
          bValue = (b.client?.name || '').toLowerCase();
          break;
        case 'progress':
          aValue = a.progressPercentage || 0;
          bValue = b.progressPercentage || 0;
          break;
        case 'value':
          aValue = a.projectValue || 0;
          bValue = b.projectValue || 0;
          break;
        case 'startDate':
          aValue = new Date(a.startDate || '').getTime();
          bValue = new Date(b.startDate || '').getTime();
          break;
        case 'deadline':
          aValue = new Date(a.deadline || '').getTime();
          bValue = new Date(b.deadline || '').getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is handled in the filter effect above
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateProject = async (projectData: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      await createProject(projectData);
      toast.success('Project created successfully');
      setShowCreateDialog(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = async (projectData: ProjectFormData) => {
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      await updateProject(selectedProject.id, projectData);
      toast.success('Project updated successfully');
      setShowEditDialog(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (project: ProjectWithRelations) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Progress is now automatically calculated from completed tasks via Hono API

  const openEditDialog = (project: ProjectWithRelations) => {
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const openDetailsDialog = (project: ProjectWithRelations) => {
    router.push(`/admin/projects/${project.id}`);
  };

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
      setSelectedProjects(filteredProjects.map(project => project.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: number, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const ProjectCard = ({ project }: { project: ProjectWithRelations }) => {
    return (
      <Card className="group hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200 flex flex-col h-full">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-3 leading-6 break-words hyphens-auto">
                {project.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
                <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors]}>
                  {priorityLabels[project.priority as keyof typeof priorityLabels]}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-100 transition-opacity flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openDetailsDialog(project)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditDialog(project)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteProject(project)}
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
          {/* Progress - Auto-calculated from completed tasks */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress (Tasks)</span>
              <span className="text-sm font-semibold text-gray-900">{project.progressPercentage || 0}%</span>
            </div>
            <Progress value={project.progressPercentage || 0} className="h-2" />
          </div>

          {/* Info Card */}
          <div className="bg-gray-50 p-4 space-y-3 flex-shrink-0">
            {/* Client */}
            {project.client && (
              <div className="flex items-start gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-gray-900 block leading-tight">{project.client.name}</span>
                  {project.client.company && (
                    <span className="text-gray-500 block text-xs leading-tight mt-0.5">{project.client.company}</span>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Start: {formatDate(project.startDate)}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Due: {formatDate(project.deadline)}</span>
                </div>
              )}
            </div>

            {/* Project Value */}
            {project.projectValue && (
              <div className="flex items-center gap-2 text-sm pt-1 border-t border-gray-200">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-900">{formatCurrency(project.projectValue)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectsTable = () => (
    <div className="border rounded-lg bg-white min-w-fit">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead className="min-w-[200px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('title')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Project
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[120px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell min-w-[100px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('priority')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Priority
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[150px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('client')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Client
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('progress')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Progress
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[100px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('value')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Value
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell min-w-[120px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('startDate')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Start Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell min-w-[120px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('deadline')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-gray-700"
              >
                Deadline
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Building2 className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {projects.length === 0 ? 'No projects yet' : 'No projects found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {projects.length === 0 
                    ? 'Get started by creating your first project.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {projects.length === 0 && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            filteredProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-gray-50/50 group">
                <TableCell>
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => handleSelectProject(project.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(project.title)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 truncate max-w-[180px]">
                      {project.title}
                    </div>
                    {project.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[180px]">
                        {project.description}
                      </div>
                    )}
                    {/* Show priority on mobile */}
                    <div className="md:hidden">
                      <Badge variant="outline" className={`${priorityColors[project.priority as keyof typeof priorityColors]} text-xs`}>
                        {priorityLabels[project.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                    {statusLabels[project.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors]}>
                    {priorityLabels[project.priority as keyof typeof priorityLabels]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.client ? (
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 truncate max-w-[120px]">
                        {project.client.name}
                      </div>
                      {project.client.company && (
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          {project.client.company}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No client</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{project.progressPercentage || 0}%</span>
                    </div>
                    <Progress value={project.progressPercentage || 0} className="h-2 w-16 sm:w-20" />
                    <div className="text-xs text-gray-500">Auto-calculated</div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(project.projectValue)}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-sm text-gray-600">
                    {formatDate(project.startDate)}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-sm text-gray-600">
                    {formatDate(project.deadline)}
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
                      <DropdownMenuItem onClick={() => openDetailsDialog(project)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProject(project)}
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
  );

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
    <div className="space-y-4 overflow-hidden">
              {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Projects</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive project management dashboard for tracking client engagements, monitoring progress milestones.</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

              {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {selectedProjects.length > 0 && viewMode === 'list' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {selectedProjects.length} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedProjects.length} projects?`)) {
                      // Handle bulk delete
                      console.log('Delete projects:', selectedProjects);
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

              {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building2 className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {projects.length === 0 
                ? 'Get started by creating your first project.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {projects.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
        <ClientSafe>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ProjectsTable />
            </div>
          )}
        </ClientSafe>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={isSubmitting}
              submitLabel="Create Project"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedProject && (
              <ProjectForm
                initialData={{
                  title: selectedProject.title,
                  description: selectedProject.description || '',
                  clientId: selectedProject.clientId || 0,
                  userId: selectedProject.userId,
                  status: selectedProject.status as any,
                  priority: selectedProject.priority as any,
                  startDate: selectedProject.startDate || '',
                  deadline: selectedProject.deadline || '',
                  projectValue: selectedProject.projectValue || undefined,
                  progressPercentage: selectedProject.progressPercentage || 0,
                }}
                onSubmit={handleEditProject}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedProject(null);
                }}
                isLoading={isSubmitting}
                submitLabel="Update Project"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 