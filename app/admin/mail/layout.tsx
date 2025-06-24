"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { EmailSidebar } from "@/components/email-sidebar"
import { CommandPalette } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export default function MailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Get the current mail section for breadcrumbs
  const getMailSection = () => {
    if (pathname.includes('/compose')) return 'Compose'
    if (pathname.includes('/inbox')) return 'Inbox'
    if (pathname.includes('/sent')) return 'Sent'
    if (pathname.includes('/drafts')) return 'Drafts'
    if (pathname.includes('/starred')) return 'Starred'
    if (pathname.includes('/archive')) return 'Archive'
    if (pathname.includes('/spam')) return 'Spam'
    if (pathname.includes('/trash')) return 'Trash'
    if (pathname.includes('/email/')) return 'Email'
    return 'Mail'
  }
  
  const mailSection = getMailSection()
  const isSubPage = pathname !== '/admin/mail' && mailSection !== 'Mail'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {isSubPage ? (
                    <BreadcrumbLink href="/admin/mail">Mail</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>Mail</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isSubPage && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{mailSection}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <CommandPalette />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <EmailSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}