"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SettingsSidebar } from "@/components/settings-sidebar"
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

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Get the current settings section for breadcrumbs
  const getSettingsSection = () => {
    if (pathname.includes('/general')) return 'General'
    if (pathname.includes('/branding')) return 'Branding'
    if (pathname.includes('/integrations')) return 'Integrations'
    if (pathname.includes('/security')) return 'Security'
    if (pathname.includes('/database')) return 'Database'
    if (pathname.includes('/email')) return 'Email'
    if (pathname.includes('/notifications')) return 'Notifications'
    if (pathname.includes('/backup')) return 'Backup'
    return 'Settings'
  }
  
  const settingsSection = getSettingsSection()
  const isSubPage = pathname !== '/admin/settings' && settingsSection !== 'Settings'

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
                    <BreadcrumbLink href="/admin/settings">Settings</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>Settings</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isSubPage && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{settingsSection}</BreadcrumbPage>
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
          <SettingsSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}