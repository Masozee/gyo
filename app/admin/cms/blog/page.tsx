"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  FileText,
  BarChart3,
  Globe,
  Clock,
  Grid3X3,
  List,
  ArrowUpDown,
  ExternalLink,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { getBlogPosts, deleteBlogPost, getBlogCategories } from '@/lib/api/cms';
import type { BlogPostWithRelations, BlogCategory } from '@/lib/schema';

type ViewMode = 'cards' | 'table';
type SortField = 'title' | 'publishedAt' | 'createdAt' | 'viewCount' | 'readingTime';
type SortOrder = 'asc' | 'desc';

export default function CMSBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPostWithRelations | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts(),
        getBlogCategories()
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load blog data:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await deleteBlogPost(postToDelete.slug);
      toast.success('Blog post deleted successfully');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'published' && post.isPublished) ||
                           (statusFilter === 'draft' && !post.isPublished);
      
      const matchesCategory = categoryFilter === 'all' || 
                             post.categoryId?.toString() === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'publishedAt':
          aValue = a.publishedAt || a.createdAt;
          bValue = b.publishedAt || b.createdAt;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'viewCount':
          aValue = a.viewCount || 0;
          bValue = b.viewCount || 0;
          break;
        case 'readingTime':
          aValue = a.readingTime || 0;
          bValue = b.readingTime || 0;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.isPublished).length,
    drafts: posts.filter(p => !p.isPublished).length,
    totalViews: posts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'Not set';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return (
      <ArrowUpDown 
        className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''} text-foreground`} 
      />
    );
  };

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('title')}
            >
              Title {renderSortIcon('title')}
            </button>
          </TableHead>
          <TableHead>Category</TableHead>
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('publishedAt')}
            >
              Status {renderSortIcon('publishedAt')}
            </button>
          </TableHead>
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('viewCount')}
            >
              Views {renderSortIcon('viewCount')}
            </button>
          </TableHead>
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('readingTime')}
            >
              Reading Time {renderSortIcon('readingTime')}
            </button>
          </TableHead>
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('createdAt')}
            >
              Created {renderSortIcon('createdAt')}
            </button>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAndSortedPosts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                {post.featuredImage && (
                  <div className="relative w-12 h-8 rounded overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <div>{post.title}</div>
                  {post.excerpt && (
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {post.excerpt}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {post.category && (
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: post.category.color || undefined,
                    color: post.category.color || undefined 
                  }}
                >
                  {post.category.name}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={post.isPublished ? "default" : "secondary"}>
                {post.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </TableCell>
            <TableCell>{post.viewCount || 0}</TableCell>
            <TableCell>{post.readingTime || getReadingTime(post.content)} min</TableCell>
            <TableCell>{formatDate(post.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/cms/blog/${post.slug}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/cms/blog/${post.slug}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/blog/${post.slug}`)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      setPostToDelete(post);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      {filteredAndSortedPosts.map((post) => (
        <Card key={post.id} className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none border-0 border-r border-b border-border">
          {post.featuredImage && (
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
          )}
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <Badge variant={post.isPublished ? "default" : "secondary"} className="rounded-none">
                {post.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/cms/blog/${post.slug}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/cms/blog/${post.slug}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/blog/${post.slug}`)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      setPostToDelete(post);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="mt-4 line-clamp-2">{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex-1">
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2 mb-4">
                {post.excerpt}
              </p>
            )}
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {post.category && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
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
              
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {post.author 
                  ? `${post.author.firstName} ${post.author.lastName}`
                  : 'Unknown'
                }
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(post.publishedAt || post.createdAt)}
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {post.readingTime || getReadingTime(post.content)} min read
              </div>
              
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                {post.viewCount || 0} views
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog content and articles
          </p>
        </div>
        <Button onClick={() => router.push('/cms/blog/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Edit className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{stats.drafts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredAndSortedPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first blog post'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => router.push('/cms/blog/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
              ) : viewMode === 'cards' ? (
          renderCardView()
        ) : (
          renderTableView()
        )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 