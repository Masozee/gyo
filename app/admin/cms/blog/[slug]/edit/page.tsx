"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Upload,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { WysiwygEditor } from '@/components/wysiwyg-editor';
import { ImageUpload } from '@/components/image-upload';
import { getBlogPost, updateBlogPost, getBlogCategories } from '@/lib/api/cms';
import type { BlogCategory, BlogPostWithRelations, NewBlogPost } from '@/lib/schema';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [post, setPost] = useState<BlogPostWithRelations | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    imageCredit: '',
    categoryId: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isPublished: false,
    publishedAt: '',
  });

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postData, categoriesData] = await Promise.all([
        getBlogPost(slug),
        getBlogCategories()
      ]);
      
      setPost(postData);
      setCategories(categoriesData);
      
      // Populate form with existing data
      setFormData({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt || '',
        content: postData.content,
        featuredImage: postData.featuredImage || '',
        imageCredit: (postData as any).imageCredit || '',
        categoryId: postData.categoryId?.toString() || '',
        tags: postData.tags ? JSON.parse(postData.tags) : [],
        metaTitle: postData.metaTitle || '',
        metaDescription: postData.metaDescription || '',
        metaKeywords: postData.metaKeywords || '',
        isPublished: postData.isPublished || false,
        publishedAt: postData.publishedAt || '',
      });
    } catch (error) {
      console.error('Failed to load blog post:', error);
      toast.error('Failed to load blog post');
      router.push('/cms/blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      metaTitle: prev.metaTitle || title,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
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

      const updateData: Partial<NewBlogPost> = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || null,
        content: formData.content,
        featuredImage: formData.featuredImage || null,
        imageCredit: formData.imageCredit || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        tags: formData.tags.length > 0 ? JSON.stringify(formData.tags) : null,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        metaKeywords: formData.metaKeywords || null,
        isPublished: publish || formData.isPublished,
        publishedAt: (publish || formData.isPublished) && !post?.publishedAt 
          ? new Date().toISOString() 
          : formData.publishedAt || null,
        readingTime: calculateReadingTime(formData.content),
        updatedAt: new Date().toISOString(),
      };

      await updateBlogPost(post!.id, updateData);
      
      toast.success('Blog post updated successfully!');
      router.push('/cms/blog');
    } catch (error) {
      console.error('Failed to update blog post:', error);
      toast.error('Failed to update blog post');
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
            <p className="text-muted-foreground">Update your blog post</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
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
            {post.isPublished ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                onCreditChange={(credit: string) => setFormData(prev => ({ ...prev, imageCredit: credit }))}
                credit={formData.imageCredit}
              />
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Enter post excerpt"
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <WysiwygEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Enter meta title"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Enter meta description"
                  />
                </div>

                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    placeholder="Enter meta keywords"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Enter URL slug"
                  />
                </div>
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPublished: checked }))
                  }
                />
                <Label htmlFor="isPublished">
                  {formData.isPublished ? 'Published' : 'Draft'}
                </Label>
              </div>
              
              {formData.isPublished && (
                <div className="mt-4">
                  <Label htmlFor="publishedAt">Publish Date</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Author & Category */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tags (comma separated)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/cms/blog/${formData.slug}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Post
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/cms/blog')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 