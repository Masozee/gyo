"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit,
  Calendar,
  User,
  Eye,
  ExternalLink,
  Github,
  Layers,
  FolderOpen,
  Image as ImageIcon,
  Link,
} from 'lucide-react';
import { toast } from 'sonner';

type PortfolioItem = {
  id: number;
  projectId?: number;
  title: string;
  description?: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
  category?: string;
  isPublished: boolean;
  publishedAt?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    deadline?: string;
    projectValue?: number;
    progressPercentage?: number;
    client?: {
      id: number;
      name: string;
      company?: string;
      email: string;
    };
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

export default function PortfolioItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cms/portfolio/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio item');
      }
      const data = await response.json();
      setItem(data.item);
    } catch (error) {
      console.error('Failed to load portfolio item:', error);
      toast.error('Failed to load portfolio item');
      router.push('/cms/portfolio');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading portfolio item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Portfolio item not found</h3>
        <p className="text-muted-foreground mb-4">The portfolio item you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/cms/portfolio')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/cms/portfolio')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
            <p className="text-muted-foreground">View portfolio item details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {item.projectUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(item.projectUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live
            </Button>
          )}
          {item.githubUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(item.githubUrl, '_blank')}
            >
              <Github className="h-4 w-4 mr-2" />
              View Code
            </Button>
          )}
          <Button
            onClick={() => router.push(`/cms/portfolio/${item.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {item.featuredImage && (
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                <img 
                  src={item.featuredImage} 
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </Card>
          )}

          {/* Gallery */}
          {item.gallery && item.gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.gallery.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`${item.title} - Image ${index + 1}`}
                        className="object-cover w-full h-full hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description & Content */}
          <Card>
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              {item.description && (
                <div className="text-lg text-muted-foreground italic border-l-4 pl-4 py-2 mb-4">
                  {item.description}
                </div>
              )}
              
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {item.content}
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          {item.project && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Project Title</h4>
                  <p className="text-muted-foreground">{item.project.title}</p>
                </div>
                
                {item.project.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Project Description</h4>
                    <p className="text-muted-foreground">{item.project.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {item.project.status && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Status</h4>
                      <Badge variant="outline">{item.project.status}</Badge>
                    </div>
                  )}
                  
                  {item.project.priority && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Priority</h4>
                      <Badge variant="outline">{item.project.priority}</Badge>
                    </div>
                  )}
                </div>

                {item.project.client && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Client</h4>
                    <p className="text-muted-foreground">
                      {item.project.client.name}
                      {item.project.client.company && ` (${item.project.client.company})`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={item.isPublished ? "default" : "secondary"}>
                {item.isPublished ? 'Published' : 'Draft'}
              </Badge>
              
              {item.isPublished && item.publishedAt && (
                <div className="mt-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Published on {formatDate(item.publishedAt)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category & Order */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.category && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Category</h4>
                  <Badge variant="outline">
                    {item.category}
                  </Badge>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Display Order</h4>
                <p className="text-muted-foreground">{item.order || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          {item.technologies && item.technologies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.projectUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Live Project</h4>
                  <a 
                    href={item.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Site
                  </a>
                </div>
              )}

              {item.githubUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Source Code</h4>
                  <a 
                    href={item.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View on GitHub
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </div>
                <span className="text-sm">{formatDate(item.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </div>
                <span className="text-sm">{formatDate(item.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}