"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Archive,
  Star,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { REFRESH_INTERVALS } from "@/lib/config"

interface EmailCounts {
  inbox: number
  starred: number
  sent: number
  drafts: number
  archive: number
  spam: number
  trash: number
}

const baseFolders = [
  {
    title: "Inbox",
    icon: Inbox,
    href: "/admin/mail/inbox",
    folder: "inbox" as keyof EmailCounts,
  },
  {
    title: "Starred",
    icon: Star,
    href: "/admin/mail/starred",
    folder: "starred" as keyof EmailCounts,
  },
  {
    title: "Sent",
    icon: Send,
    href: "/admin/mail/sent",
    folder: "sent" as keyof EmailCounts,
  },
  {
    title: "Drafts",
    icon: FileText,
    href: "/admin/mail/drafts",
    folder: "drafts" as keyof EmailCounts,
  },
  {
    title: "Archive",
    icon: Archive,
    href: "/admin/mail/archive",
    folder: "archive" as keyof EmailCounts,
  },
  {
    title: "Spam",
    icon: AlertTriangle,
    href: "/admin/mail/spam",
    folder: "spam" as keyof EmailCounts,
  },
  {
    title: "Trash",
    icon: Trash2,
    href: "/admin/mail/trash",
    folder: "trash" as keyof EmailCounts,
  },
]

const emailLabels = [
  {
    title: "Important",
    color: "bg-red-500",
    href: "/admin/mail/label/important",
  },
  {
    title: "Work",
    color: "bg-blue-500",
    href: "/admin/mail/label/work",
  },
  {
    title: "Personal",
    color: "bg-green-500",
    href: "/admin/mail/label/personal",
  },
  {
    title: "Projects",
    color: "bg-purple-500",
    href: "/admin/mail/label/projects",
  },
]

export function EmailSidebar() {
  const pathname = usePathname()
  const [emailCounts, setEmailCounts] = React.useState<EmailCounts>({
    inbox: 0,
    starred: 0,
    sent: 0,
    drafts: 0,
    archive: 0,
    spam: 0,
    trash: 0,
  })

  // Fetch email counts for each folder
  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const folders = ['inbox', 'starred', 'sent', 'drafts', 'archive', 'spam', 'trash']
        const countPromises = folders.map(async (folder) => {
          const starred = folder === 'starred' ? '&starred=true' : ''
          const folderParam = folder === 'starred' ? 'inbox' : folder
          const response = await fetch(`/api/mail/emails?folder=${folderParam}${starred}`)
          if (response.ok) {
            const data = await response.json()
            return { folder, count: data.total || 0 }
          }
          return { folder, count: 0 }
        })
        
        const results = await Promise.all(countPromises)
        const newCounts = {} as EmailCounts
        results.forEach(({ folder, count }) => {
          newCounts[folder as keyof EmailCounts] = count
        })
        setEmailCounts(newCounts)
      } catch (error) {
        console.error('Failed to fetch email counts:', error)
      }
    }

    fetchCounts()
    // Refresh counts at configurable intervals to reduce API load
    const interval = setInterval(fetchCounts, REFRESH_INTERVALS.EMAIL_COUNTS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col w-64 bg-background border-r">
      {/* Compose Button */}
      <div className="p-4">
        <Link href="/admin/mail/compose">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search mail..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Email Folders */}
        <div className="px-4 pb-4">
          <div className="space-y-1">
            {baseFolders.map((folder) => {
              const Icon = folder.icon
              const isActive = pathname === folder.href
              const count = emailCounts[folder.folder]
              
              return (
                <Link
                  key={folder.href}
                  href={folder.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-primary hover:text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    <span>{folder.title}</span>
                  </div>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {count}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Labels */}
        <div className="px-4 py-4">
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Labels
          </h3>
          <div className="space-y-1">
            {emailLabels.map((label) => {
              const isActive = pathname === label.href
              
              return (
                <Link
                  key={label.href}
                  href={label.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-primary hover:text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mr-3", label.color)} />
                  <span>{label.title}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Quick Actions */}
        <div className="px-4 py-4">
          <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <Link
              href="/admin/mail/scheduled"
              className="flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Clock className="w-4 h-4 mr-3" />
              <span>Scheduled</span>
            </Link>
            <Link
              href="/admin/mail/filters"
              className="flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Filter className="w-4 h-4 mr-3" />
              <span>Filters</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Storage</span>
            <span>2.1 GB of 15 GB</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{width: "14%"}}></div>
          </div>
        </div>
      </div>
    </div>
  )
}