import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/auth';
import { ProjectsLayoutClient } from '@/components/projects-layout-client';
// import { ModeToggle } from '@/components/mode-toggle';
// import { CommandPalette } from '@/components/command-palette';

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For now, we'll use a default user ID
  // In a real app, you'd get this from session/auth
  const userId = 1;
  
  try {
    const user = await getUserById(userId);
    if (!user) {
      redirect('/login');
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <ProjectsLayoutClient>
          {children}
        </ProjectsLayoutClient>
      </SidebarProvider>
    );
  } catch (error) {
    console.error('Error loading user:', error);
    redirect('/login');
  }
} 