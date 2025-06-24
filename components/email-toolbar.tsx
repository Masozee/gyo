"use client"

import * as React from "react"
import {
  Archive,
  Trash2,
  MailCheck,
  MailX,
  RefreshCw,
  MoreHorizontal,
  Tag,
  Forward,
  Reply,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface EmailToolbarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDelete: () => void
  onArchive: () => void
  onMarkAsRead: () => void
  onMarkAsUnread: () => void
}

export function EmailToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDelete,
  onArchive,
  onMarkAsRead,
  onMarkAsUnread,
}: EmailToolbarProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
      {/* Select All Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          ref={(ref) => {
            if (ref) {
              const input = ref.querySelector('input')
              if (input) {
                input.indeterminate = isIndeterminate
              }
            }
          }}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} emails`}
        </span>
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onArchive}
          disabled={selectedCount === 0}
          className="h-8"
        >
          <Archive className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="h-8"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-4" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAsRead}
          disabled={selectedCount === 0}
          className="h-8"
        >
          <MailCheck className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAsUnread}
          disabled={selectedCount === 0}
          className="h-8"
        >
          <MailX className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-4" />

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={selectedCount === 0}
              className="h-8"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <Tag className="w-4 h-4 mr-2" />
              Add label
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mark as spam</DropdownMenuItem>
            <DropdownMenuItem>Block sender</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Refresh Button */}
      <Button variant="ghost" size="sm" className="h-8">
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  )
}