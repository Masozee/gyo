"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, Palette } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { EventFormData, EventWithRelations } from "@/lib/api/events"
import { fetchClients } from "@/lib/api/clients"
import { getProjects } from "@/lib/api/projects"

interface EventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: EventFormData) => Promise<void>
  initialData?: EventWithRelations
  isLoading?: boolean
}

const eventTypes = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Phone Call' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'task', label: 'Task' },
  { value: 'appointment', label: 'Appointment' },
]

const eventColors = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function EventForm({ open, onOpenChange, onSubmit, initialData, isLoading = false }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || '',
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '',
    allDay: initialData?.allDay || false,
    type: initialData?.type || 'meeting',
    status: initialData?.status || 'confirmed',
    priority: initialData?.priority || 'medium',
    color: initialData?.color || 'blue',
    location: initialData?.location || '',
    isVirtual: initialData?.isVirtual || false,
    meetingUrl: initialData?.meetingUrl || '',
    attendees: initialData?.attendees || '',
    projectId: initialData?.projectId || undefined,
    clientId: initialData?.clientId || undefined,
    userId: initialData?.userId || 1, // Default user ID
    reminderMinutes: initialData?.reminderMinutes || 15,
    notes: initialData?.notes || '',
  })

  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Load clients and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, projectsData] = await Promise.all([
          fetchClients(),
          getProjects()
        ])
        setClients(clientsData)
        setProjects(projectsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await onSubmit(formData)
      onOpenChange(false)
      
      // Reset form if it's a new event
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          startTime: '09:00',
          endTime: '',
          allDay: false,
          type: 'meeting',
          status: 'confirmed',
          priority: 'medium',
          color: 'blue',
          location: '',
          isVirtual: false,
          meetingUrl: '',
          attendees: '',
          projectId: undefined,
          clientId: undefined,
          userId: 1,
          reminderMinutes: 15,
          notes: '',
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Update the event details below.' 
              : 'Fill in the details to create a new event.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Add event description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => updateFormData('allDay', checked)}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => updateFormData('startTime', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => updateFormData('endTime', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={formData.projectId?.toString() || ''} onValueChange={(value) => updateFormData('projectId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client (Optional)</Label>
              <Select value={formData.clientId?.toString() || ''} onValueChange={(value) => updateFormData('clientId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVirtual"
                checked={formData.isVirtual}
                onCheckedChange={(checked) => updateFormData('isVirtual', checked)}
              />
              <Label htmlFor="isVirtual">Virtual meeting</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{formData.isVirtual ? 'Meeting URL' : 'Location'}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={formData.isVirtual ? (formData.meetingUrl || '') : (formData.location || '')}
                onChange={(e) => updateFormData(formData.isVirtual ? 'meetingUrl' : 'location', e.target.value)}
                placeholder={formData.isVirtual ? "https://zoom.us/j/..." : "Meeting room, address"}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees (JSON format)</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="attendees"
                value={formData.attendees || ''}
                onChange={(e) => updateFormData('attendees', e.target.value)}
                placeholder='["John Doe", "jane@example.com"] or comma separated names'
                className="pl-10"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Event Color</Label>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                {eventColors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateFormData('color', color.value)}
                    className={`w-6 h-6 rounded-full ${color.class} ${
                      formData.color === color.value 
                        ? 'ring-2 ring-foreground ring-offset-2' 
                        : 'hover:ring-2 hover:ring-muted-foreground hover:ring-offset-1'
                    } transition-all`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData ? 'Update Event' : 'Create Event')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 