"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Star,
  Paperclip,
  Circle,
  CheckCircle2,
} from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Email {
  id: string
  from: string
  fromName: string
  subject: string
  preview: string
  date: Date
  read: boolean
  starred: boolean
  important: boolean
  labels: string[]
  attachments: number
}

interface EmailListProps {
  emails: Email[]
  selectedEmails: string[]
  onSelectEmail: (emailId: string) => void
}

const labelColors: Record<string, string> = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  important: "bg-red-500",
  projects: "bg-purple-500",
}

export function EmailList({ emails, selectedEmails, onSelectEmail }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No emails in inbox</p>
          <p className="text-sm">All caught up!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {emails.map((email) => {
        const isSelected = selectedEmails.includes(email.id)
        
        return (
          <div
            key={email.id}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
              !email.read && "bg-muted/30",
              isSelected && "bg-primary/10"
            )}
          >
            {/* Checkbox */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelectEmail(email.id)}
              className="shrink-0"
            />

            {/* Star */}
            <button
              className={cn(
                "shrink-0 p-1 hover:bg-muted rounded",
                email.starred ? "text-yellow-500" : "text-muted-foreground"
              )}
            >
              <Star className={cn("w-4 h-4", email.starred && "fill-current")} />
            </button>

            {/* Importance indicator */}
            {email.important && (
              <div className="shrink-0 w-2 h-2 bg-red-500 rounded-full" />
            )}

            {/* From */}
            <div className="w-40 shrink-0">
              <p className={cn(
                "text-sm truncate",
                !email.read && "font-semibold"
              )}>
                {email.fromName}
              </p>
            </div>

            {/* Subject and Preview */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/mail/email/${email.id}`}
                className="block hover:underline"
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className={cn(
                    "text-sm truncate",
                    !email.read && "font-semibold"
                  )}>
                    {email.subject}
                  </p>
                  {email.attachments > 0 && (
                    <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {email.preview}
                </p>
              </Link>
            </div>

            {/* Labels */}
            {email.labels.length > 0 && (
              <div className="flex gap-1 shrink-0">
                {email.labels.slice(0, 2).map((label) => (
                  <div
                    key={label}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      labelColors[label] || "bg-gray-500"
                    )}
                  />
                ))}
                {email.labels.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{email.labels.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Date */}
            <div className="w-20 shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(email.date, { addSuffix: false })}
              </p>
            </div>

            {/* Read indicator */}
            <div className="shrink-0">
              {!email.read && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}