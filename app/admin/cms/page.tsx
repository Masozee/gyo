"use client";

import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  FileText, 
  Image, 
  Settings, 
  Eye,
  Edit,
  Plus,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function CMSPage() {
  const { user, loading: authLoading, requireAuth } = useAuth();
  const [stats, setStats] = useState({
    pages: 0,
    blogPosts: 0,
    portfolioItems: 0,
    mediaFiles: 0,
    contactSubmissions: 0,
  });

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    // Load CMS stats
    const loadStats = async () => {
      try {
        // This would be replaced with actual API calls
        setStats({
          pages: 3,
          blogPosts: 5,
          portfolioItems: 8,
          mediaFiles: 24,
          contactSubmissions: 12,
        });
      } catch (error) {
        console.error('Failed to load CMS stats:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const quickActions = [
    {
      title: 'New Page',
      description: 'Create a new static page',
      icon: FileText,
      href: '/cms/pages/new',
      color: 'bg-blue-500',
    },
    {
      title: 'New Blog Post',
      description: 'Write a new blog post',
      icon: Edit,
      href: '/admin/cms/blog/new',
      color: 'bg-green-500',
    },
    {
      title: 'Add Portfolio Item',
      description: 'Showcase a new project',
      icon: Image,
      href: '/admin/cms/portfolio/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Upload Media',
      description: 'Add images and files',
      icon: Image,
      href: '/admin/cms/media',
      color: 'bg-orange-500',
    },
  ];

  const managementCards = [
    {
      title: 'Pages',
      count: stats.pages,
      description: 'Static pages like About, Contact',
      icon: FileText,
      href: '/admin/cms/pages',
      color: 'text-blue-600',
    },
    {
      title: 'Blog Posts',
      count: stats.blogPosts,
      description: 'Published and draft articles',
      icon: Edit,
      href: '/admin/cms/blog',
      color: 'text-green-600',
    },
    {
      title: 'Portfolio',
      count: stats.portfolioItems,
      description: 'Showcase projects',
      icon: Image,
      href: '/admin/cms/portfolio',
      color: 'text-purple-600',
    },
    {
      title: 'Media Library',
      count: stats.mediaFiles,
      description: 'Images, documents, files',
      icon: Image,
      href: '/admin/cms/media',
      color: 'text-orange-600',
    },
    {
      title: 'Contact Messages',
      count: stats.contactSubmissions,
      description: 'Form submissions',
      icon: MessageSquare,
      href: '/admin/cms/contact',
      color: 'text-red-600',
    },
    {
      title: 'Site Settings',
      count: '—',
      description: 'Configure your website',
      icon: Settings,
      href: '/admin/cms/settings',
      color: 'text-gray-600',
    },
  ];

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
                  <BreadcrumbLink href="/admin/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>CMS</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-1">Manage your website content and settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/site">
                  <Eye className="h-4 w-4 mr-2" />
                  View Site
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link href={action.href}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Management Overview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Content Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managementCards.map((card) => (
                <Card key={card.title} className="hover:shadow-md transition-shadow">
                  <Link href={card.href}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {card.title}
                      </CardTitle>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.count}</div>
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500 py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Activity tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 