"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { CommandPalette } from "@/components/command-palette"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  FileText,
  AlertCircle,
  Filter
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CalendarView } from "@/components/calendar-view"
import { EventForm } from "@/components/event-form"
import { getEvents, createEvent, updateEvent, deleteEvent, EventWithRelations, EventFormData } from "@/lib/api/events"
import { toast } from "sonner"

// Helper function to convert event format for display
const convertEventForDisplay = (event: EventWithRelations) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  date: event.startDate,
  time: event.startTime ? formatTime(event.startTime) : event.allDay ? 'All day' : 'No time set',
  duration: event.endTime && event.startTime ? calculateDuration(event.startTime, event.endTime) : undefined,
  type: event.type,
  location: event.isVirtual ? event.meetingUrl : event.location,
  attendees: event.attendees ? (typeof event.attendees === 'string' ? JSON.parse(event.attendees) : event.attendees) : [],
  status: event.status,
  color: event.color || 'blue',
  project: event.project,
  client: event.client,
  allDay: event.allDay,
  isVirtual: event.isVirtual,
  priority: event.priority,
})

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0 && diffMinutes > 0) {
    return `${diffHours}h ${diffMinutes}m`
  } else if (diffHours > 0) {
    return `${diffHours}h`
  } else {
    return `${diffMinutes}m`
  }
}

type ViewMode = 'calendar' | 'list'
type TimeView = 'daily' | 'monthly' | 'yearly'

function getEventIcon(type: string) {
  switch (type) {
    case 'meeting': return Users
    case 'call': return Phone
    case 'presentation': return FileText
    case 'deadline': return AlertCircle
    default: return Calendar
  }
}

function getEventColor(color: string) {
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'green': return 'bg-green-100 text-green-800 border-green-200'
    case 'red': return 'bg-red-100 text-red-800 border-red-200'
    case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}



function ListView({ events, timeView, currentDate }: { events: any[], timeView: TimeView, currentDate: Date }) {
  const getFilteredEvents = () => {
    const now = new Date()
    
    switch (timeView) {
      case 'daily':
        const today = new Date(currentDate)
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        return events.filter(event => event.date === todayStr)
        
      case 'monthly':
        return events.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate.getFullYear() === currentDate.getFullYear() && 
                 eventDate.getMonth() === currentDate.getMonth()
        })
        
      case 'yearly':
        return events.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate.getFullYear() === currentDate.getFullYear()
        })
        
      default:
        return events
    }
  }

  const filteredEvents = getFilteredEvents().sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  const groupEventsByDate = () => {
    const grouped: { [key: string]: any[] } = {}
    filteredEvents.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = []
      }
      grouped[event.date].push(event)
    })
    return grouped
  }

  const groupedEvents = groupEventsByDate()

  return (
    <div className="space-y-6">
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
          <p className="text-muted-foreground">
            No events found for the selected time period.
          </p>
        </div>
      ) : (
        Object.keys(groupedEvents).map(date => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background py-2">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <div className="space-y-3">
              {groupedEvents[date].map(event => {
                const Icon = getEventIcon(event.type)
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex-shrink-0 p-2 rounded-lg",
                          getEventColor(event.color)
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold truncate">{event.title}</h4>
                            <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                              {event.status}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                              {event.duration && ` (${event.duration})`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                            {event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function SchedulePage() {
  const { user, loading, requireAuth } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [timeView, setTimeView] = useState<TimeView>('monthly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventWithRelations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    requireAuth()
  }, [requireAuth])

  // Load events
  const loadEvents = useCallback(async () => {
    if (!user) return
    
    try {
      setEventsLoading(true)
      const eventsData = await getEvents(user.id)
      const displayEvents = eventsData.map(convertEventForDisplay)
      setEvents(displayEvents)
    } catch (error) {
      console.error('Failed to load events:', error)
      toast.error('Failed to load events')
    } finally {
      setEventsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user, loadEvents])

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex min-h-svh items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!user) {
    return null
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (timeView) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  const formatDateHeader = () => {
    switch (timeView) {
      case 'daily':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'monthly':
        return currentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
      case 'yearly':
        return currentDate.getFullYear().toString()
      default:
        return ''
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleCreateEvent = async (eventData: EventFormData) => {
    if (!user) return
    
    try {
      setIsSubmitting(true)
      await createEvent({ ...eventData, userId: user.id })
      toast.success('Event created successfully')
      loadEvents()
    } catch (error) {
      console.error('Failed to create event:', error)
      toast.error('Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateEvent = async (eventData: EventFormData) => {
    if (!selectedEvent) return
    
    try {
      setIsSubmitting(true)
      await updateEvent(selectedEvent.id, eventData)
      toast.success('Event updated successfully')
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      console.error('Failed to update event:', error)
      toast.error('Failed to update event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      await deleteEvent(eventId)
      toast.success('Event deleted successfully')
      loadEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Schedule</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Schedule</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={timeView} onValueChange={(value: TimeView) => setTimeView(value)}>
                <SelectTrigger className="w-24 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="min-w-[180px] sm:min-w-[200px] text-center font-medium px-2">
                  {formatDateHeader()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button className="gap-2" onClick={() => setShowEventForm(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Event</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'calendar' ? (
              <CalendarView events={events} currentDate={currentDate} />
            ) : (
              <ListView events={events} timeView={timeView} currentDate={currentDate} />
            )}
          </div>

          {/* Event Form Dialog */}
          <EventForm
            open={showEventForm}
            onOpenChange={(open) => {
              setShowEventForm(open)
              if (!open) setSelectedEvent(null)
            }}
            onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
            initialData={selectedEvent || undefined}
            isLoading={isSubmitting}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 