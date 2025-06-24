'use client';

import { usePathname } from 'next/navigation';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandPalette } from '@/components/command-palette';

interface ProjectsLayoutClientProps {
  children: React.ReactNode;
}

export function ProjectsLayoutClient({ children }: ProjectsLayoutClientProps) {
  const pathname = usePathname();

  // Determine if we're on a project details page
  const isProjectDetails = pathname?.match(/^\/projects\/\d+$/);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isProjectDetails ? (
                  <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Projects</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {isProjectDetails && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Project Details</BreadcrumbPage>
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </SidebarInset>
  );
} 