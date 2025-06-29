"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ToolsSidebar } from "@/components/tools-sidebar"
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

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Get the current tools section for breadcrumbs
  const getToolsSection = () => {
    if (pathname.includes('/cv-builder')) return 'CV Builder'
    if (pathname.includes('/url-shortener')) return 'URL Shortener'
    if (pathname.includes('/qr-codes')) return 'QR Code Generator'
    if (pathname.includes('/document-signing')) return 'Document Signing'
    if (pathname.includes('/youtube-downloader')) return 'YouTube Downloader'
    if (pathname.includes('/gemini-chat')) return 'Chat with Gemini AI'
    if (pathname.includes('/calculator')) return 'Calculator'
    if (pathname.includes('/hash-generator')) return 'Hash Generator'
    if (pathname.includes('/color-palette')) return 'Color Palette'
    if (pathname.includes('/password-generator')) return 'Password Generator'
    if (pathname.includes('/domain-checker')) return 'Domain Checker'
    return 'Tools'
  }
  
  const toolsSection = getToolsSection()
  const isSubPage = pathname !== '/admin/tools' && toolsSection !== 'Tools'

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
                    <BreadcrumbLink href="/admin/tools">Tools</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>Tools</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isSubPage && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{toolsSection}</BreadcrumbPage>
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
          <ToolsSidebar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}