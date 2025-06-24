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
  Clock,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { getBlogPost } from '@/lib/api/cms';
import type { BlogPostWithRelations } from '@/lib/schema';

export default function BlogPostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPostWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getBlogPost(slug);
      setPost(data);
    } catch (error) {
      console.error('Failed to load blog post:', error);
      toast.error('Failed to load blog post');
      router.push('/cms/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
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
          <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Blog post not found</h3>
        <p className="text-muted-foreground mb-4">The blog post you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/cms/blog')} className="rounded-none">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
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
            onClick={() => router.push('/cms/blog')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
            <p className="text-muted-foreground">View blog post details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/blog/${post.slug}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Live
          </Button>
          <Button
            onClick={() => router.push(`/cms/blog/${post.slug}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {post.featuredImage && (
            <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
              <div className="relative aspect-video">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
                {post.imageCredit && (
                  <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-2">
                    <Camera className="h-3 w-3 inline mr-1" />
                    {post.imageCredit}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Content */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {post.excerpt && (
                <div className="text-lg text-muted-foreground italic border-l-4 pl-4 py-2 mb-4">
                  {post.excerpt}
                </div>
              )}
              
              <div className="prose prose-sm max-w-none dark:prose-invert" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </CardContent>
          </Card>

          {/* SEO Information */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Meta Title</h4>
                <p className="text-muted-foreground">{post.metaTitle || post.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Meta Description</h4>
                <p className="text-muted-foreground">{post.metaDescription || 'Not set'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Meta Keywords</h4>
                <p className="text-muted-foreground">{post.metaKeywords || 'Not set'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">URL Slug</h4>
                <p className="text-muted-foreground">/blog/{post.slug}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Badge variant={post.isPublished ? "default" : "secondary"} className="rounded-none">
                {post.isPublished ? 'Published' : 'Draft'}
              </Badge>
              
              {post.isPublished && post.publishedAt && (
                <div className="mt-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Published on {formatDate(post.publishedAt)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Author & Category */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Author</h4>
                <div className="flex items-center text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  {post.author 
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : 'Unknown'
                  }
                </div>
              </div>

              {post.category && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Category</h4>
                  <Badge 
                    variant="outline"
                    className="rounded-none"
                    style={{ 
                      borderColor: post.category.color || undefined,
                      color: post.category.color || undefined 
                    }}
                  >
                    {post.category.name}
                  </Badge>
                </div>
              )}

              {post.tags && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(post.tags).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="rounded-none">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Eye className="h-4 w-4 mr-2" />
                  Views
                </div>
                <span>{post.viewCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Reading Time
                </div>
                <span>{post.readingTime} min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </div>
                <span>{formatDate(post.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </div>
                <span>{formatDate(post.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 