"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectFormData } from '@/lib/api/projects';
import { fetchClients } from '@/lib/api/clients';

interface Client {
  id: number;
  name: string;
  company?: string | null;
  email: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Project',
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    clientId: initialData?.clientId || 0,
    userId: initialData?.userId || 1, // Default to first user for now
    status: initialData?.status || 'PLANNING',
    priority: initialData?.priority || 'MEDIUM',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    deadline: initialData?.deadline || '',
    projectValue: initialData?.projectValue || undefined,
    progressPercentage: initialData?.progressPercentage || 0,
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await fetchClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to load clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.clientId || formData.clientId === 0) {
      newErrors.clientId = 'Please select a client';
    }

    if (!formData.startDate || !formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.startDate && formData.deadline) {
      const startDate = new Date(formData.startDate);
      const deadline = new Date(formData.deadline);
      if (deadline < startDate) {
        newErrors.deadline = 'Deadline must be after start date';
      }
    }

    if (formData.projectValue && formData.projectValue < 0) {
      newErrors.projectValue = 'Project value must be a positive number';
    }

    if ((formData.progressPercentage || 0) < 0 || (formData.progressPercentage || 0) > 100) {
      newErrors.progressPercentage = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter project title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select
              value={formData.clientId.toString()}
              onValueChange={(value) => handleInputChange('clientId', parseInt(value))}
            >
              <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client"} />
              </SelectTrigger>
              <SelectContent>
                {loadingClients ? (
                  <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-sm text-red-500">{errors.clientId}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter project description"
            rows={3}
          />
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className={errors.deadline ? 'border-red-500' : ''}
            />
            {errors.deadline && (
              <p className="text-sm text-red-500">{errors.deadline}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Financial Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="projectValue">Project Value ($)</Label>
          <Input
            id="projectValue"
            type="number"
            min="0"
            step="0.01"
            value={formData.projectValue || ''}
            onChange={(e) => handleInputChange('projectValue', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
            className={errors.projectValue ? 'border-red-500' : ''}
          />
          {errors.projectValue && (
            <p className="text-sm text-red-500">{errors.projectValue}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Progress</h3>
        
        <div className="space-y-2">
          <Label htmlFor="progress">Progress Percentage</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progressPercentage}
              onChange={(e) => handleInputChange('progressPercentage', parseInt(e.target.value) || 0)}
              className={`w-20 ${errors.progressPercentage ? 'border-red-500' : ''}`}
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          {errors.progressPercentage && (
            <p className="text-sm text-red-500">{errors.progressPercentage}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-white">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
} 