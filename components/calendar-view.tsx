"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  Phone,
  Video,
  FileText,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"

interface Event {
  id: number
  title: string
  description?: string
  date: string
  time: string
  duration?: string
  type: string
  location?: string
  attendees: string[]
  status: string
  color: string
}

interface CalendarViewProps {
  events: Event[]
  currentDate: Date
  onEventClick?: (event: Event) => void
}

function getEventIcon(type: string) {
  switch (type) {
    case 'meeting': return Users
    case 'call': return Phone
    case 'video': return Video
    case 'presentation': return FileText
    case 'deadline': return AlertCircle
    default: return Calendar
  }
}

function getEventColor(color: string) {
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
    case 'green': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
    case 'red': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
    case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
    case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
    case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200'
    case 'pink': return 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200'
    case 'cyan': return 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
  }
}

function EventDialog({ event, open, onOpenChange }: { 
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  if (!event) return null

  const Icon = getEventIcon(event.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex-shrink-0 p-2 rounded-lg",
              getEventColor(event.color)
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>{event.title}</DialogTitle>
              <DialogDescription>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {event.description && (
            <p className="text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
          
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.time}
                {event.duration && ` (${event.duration})`}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.attendees.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.attendees.join(', ')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button size="sm" className="flex-1">
              Edit Event
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CalendarView({ events, currentDate, onEventClick }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    days.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => event.date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getDate() === day
    )
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setDialogOpen(true)
    onEventClick?.(event)
  }

  return (
    <>
      <div className="bg-card rounded-lg border overflow-hidden">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Day headers */}
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="bg-muted/50 p-4 text-center text-sm font-medium border-r border-b last:border-r-0">
              <div className="hidden sm:block">{day}</div>
              <div className="sm:hidden">{day.slice(0, 3)}</div>
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "min-h-[140px] p-3 border-r border-b last:border-r-0 transition-colors",
                day ? "hover:bg-muted/30 bg-background" : "bg-muted/10",
                day && isToday(day) ? "bg-blue-50 border-blue-200" : ""
              )}
            >
              {day && (
                <>
                  <div className={cn(
                    "text-sm font-medium mb-2 flex items-center justify-between",
                    isToday(day) ? "text-blue-600" : "text-foreground"
                  )}>
                    <span>{day}</span>
                    {isToday(day) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDay(day).slice(0, 3).map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={cn(
                          "w-full text-left text-xs p-1.5 rounded border transition-colors cursor-pointer",
                          getEventColor(event.color)
                        )}
                        title={`${event.title} - ${event.time}`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        <div className="text-xs opacity-75 mt-0.5">
                          {event.time}
                        </div>
                      </button>
                    ))}
                    {getEventsForDay(day).length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{getEventsForDay(day).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <EventDialog 
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
} 