"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Settings, User, Home, FileText, Calendar, LogOut, Mail, Send, Archive, Trash2, Star } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  
  const isMailSection = pathname.startsWith('/admin/mail')
  const isSettingsSection = pathname.startsWith('/admin/settings')

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Command palette shortcut
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      
      // Mail-specific shortcuts (only when not in an input field)
      if (isMailSection && !open && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        if (e.key === "c" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          router.push('/admin/mail/compose')
        }
        if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          router.push('/admin/mail/inbox')
        }
        if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          router.push('/admin/mail/starred')
        }
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isMailSection, open, router])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/dashboard'))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/profile'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/mail'))}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Mail</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          {isMailSection && (
            <>
              <CommandGroup heading="Mail Actions">
                <CommandItem onSelect={() => runCommand(() => router.push('/admin/mail/compose'))}>
                  <Send className="mr-2 h-4 w-4" />
                  <span>Compose Email</span>
                  <CommandShortcut>⌘C</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/admin/mail/inbox'))}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Go to Inbox</span>
                  <CommandShortcut>⌘I</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/admin/mail/starred'))}>
                  <Star className="mr-2 h-4 w-4" />
                  <span>Starred Messages</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push('/admin/mail/sent'))}>
                  <Send className="mr-2 h-4 w-4" />
                  <span>Sent Messages</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create New Document</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Schedule Meeting</span>
              <CommandShortcut>⌘M</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => runCommand(() => logout())}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
} 