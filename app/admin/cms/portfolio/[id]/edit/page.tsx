"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  X,
  Plus,
  Link,
  Github,
  Image,
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
};

export default function EditPortfolioItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTechnology, setNewTechnology] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    content: '',
    featuredImage: '',
    gallery: [] as string[],
    technologies: [] as string[],
    projectUrl: '',
    githubUrl: '',
    category: '',
    isPublished: false,
    publishedAt: '',
    order: 0,
  });

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
      const item: PortfolioItem = data.item;
      
      setFormData({
        projectId: item.projectId?.toString() || '',
        title: item.title,
        description: item.description || '',
        content: item.content,
        featuredImage: item.featuredImage || '',
        gallery: item.gallery || [],
        technologies: item.technologies || [],
        projectUrl: item.projectUrl || '',
        githubUrl: item.githubUrl || '',
        category: item.category || '',
        isPublished: item.isPublished,
        publishedAt: item.publishedAt || '',
        order: item.order || 0,
      });
    } catch (error) {
      console.error('Failed to load portfolio item:', error);
      toast.error('Failed to load portfolio item');
      router.push('/cms/portfolio');
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const addGalleryImage = () => {
    if (newGalleryUrl.trim() && !formData.gallery.includes(newGalleryUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, newGalleryUrl.trim()]
      }));
      setNewGalleryUrl('');
    }
  };

  const removeGalleryImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter(url => url !== urlToRemove)
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        projectId: formData.projectId ? parseInt(formData.projectId) : undefined,
        title: formData.title,
        description: formData.description || undefined,
        content: formData.content,
        featuredImage: formData.featuredImage || undefined,
        gallery: formData.gallery.length > 0 ? formData.gallery : undefined,
        technologies: formData.technologies.length > 0 ? formData.technologies : undefined,
        projectUrl: formData.projectUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        category: formData.category || undefined,
        isPublished: publish !== undefined ? publish : formData.isPublished,
        publishedAt: publish || formData.isPublished ? new Date().toISOString() : undefined,
        order: formData.order || 0,
      };

      const response = await fetch(`/api/cms/portfolio/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio item');
      }
      
      toast.success('Portfolio item updated successfully!');
      router.push(`/cms/portfolio/${id}`);
    } catch (error) {
      console.error('Failed to save portfolio item:', error);
      toast.error('Failed to save portfolio item');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/cms/portfolio/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Item
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio Item</h1>
            <p className="text-muted-foreground">Update portfolio item details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Eye className="h-4 w-4 mr-2" />
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Item Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter portfolio item title..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the project..."
                  rows={3}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed content about the project, what you built, challenges faced, etc..."
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Links */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectUrl">Live Project URL</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="projectUrl"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/username/repository"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Featured Image */}
              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Gallery */}
              <div className="space-y-4">
                <Label>Gallery Images</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Add gallery image URL..."
                    onKeyPress={(e) => e.key === 'Enter' && addGalleryImage()}
                  />
                  <Button 
                    type="button" 
                    onClick={addGalleryImage}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.gallery.length > 0 && (
                  <div className="space-y-2">
                    {formData.gallery.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm truncate flex-1">{url}</span>
                        <Button
                          type="button"
                          onClick={() => removeGalleryImage(url)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPublished: checked }))
                  }
                />
              </div>
              
              {formData.isPublished && (
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Publish Date</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category & Order */}
          <Card>
            <CardHeader>
              <CardTitle>Category & Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Web Development, Mobile App, Design"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Higher numbers appear first
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add technology..."
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                />
                <Button 
                  type="button" 
                  onClick={addTechnology}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Association */}
          <Card>
            <CardHeader>
              <CardTitle>Project Association</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="projectId">Link to Project (Optional)</Label>
                <Input
                  id="projectId"
                  type="number"
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="Project ID"
                />
                <p className="text-xs text-muted-foreground">
                  Associate this portfolio item with an existing project
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}