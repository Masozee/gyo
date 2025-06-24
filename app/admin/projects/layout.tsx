"use client";

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ProjectsLayoutClient } from '@/components/projects-layout-client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { ModeToggle } from '@/components/mode-toggle';
// import { CommandPalette } from '@/components/command-palette';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // For now, assume authenticated for build purposes
    // In a real app, you'd check auth status here
    setIsAuthenticated(true);
  }, []);

  // Show loading during auth check
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <ProjectsLayoutClient>
        {children}
      </ProjectsLayoutClient>
    </SidebarProvider>
  );
} 