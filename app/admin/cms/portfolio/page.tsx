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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Briefcase,
  BarChart3,
  Globe,
  Grid3X3,
  List,
  ArrowUpDown,
  ExternalLink,
  Github,
  Layers,
  FolderOpen
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

type ViewMode = 'cards' | 'table';
type SortField = 'title' | 'publishedAt' | 'createdAt' | 'order' | 'category';
type SortOrder = 'asc' | 'desc';

export default function CMSPortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cms/portfolio');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/api/cms/portfolio/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Portfolio item deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete portfolio item');
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

  const categories = Array.from(new Set(items.map(item => item.category).filter((cat): cat is string => Boolean(cat))));

  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'published' && item.isPublished) ||
                           (statusFilter === 'draft' && !item.isPublished);
      
      const matchesCategory = categoryFilter === 'all' || 
                             item.category === categoryFilter;
      
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
        case 'order':
          aValue = a.order || 0;
          bValue = b.order || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
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
    total: items.length,
    published: items.filter(item => item.isPublished).length,
    drafts: items.filter(item => !item.isPublished).length,
    categories: categories.length,
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('category')}
            >
              Category {renderSortIcon('category')}
            </button>
          </TableHead>
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('publishedAt')}
            >
              Status {renderSortIcon('publishedAt')}
            </button>
          </TableHead>
          <TableHead>Technologies</TableHead>
          <TableHead>
            <button 
              className="flex items-center space-x-2"
              onClick={() => handleSort('order')}
            >
              Order {renderSortIcon('order')}
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
        {filteredAndSortedItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                {item.featuredImage && (
                  <div className="relative w-12 h-8 rounded overflow-hidden">
                    <img 
                      src={item.featuredImage} 
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <div>{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {item.category && (
                <Badge variant="outline">
                  {item.category}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={item.isPublished ? "default" : "secondary"}>
                {item.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {item.technologies?.slice(0, 3).map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {item.technologies && item.technologies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.technologies.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{item.order || 0}</TableCell>
            <TableCell>{formatDate(item.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/cms/portfolio/${item.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/cms/portfolio/${item.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {item.projectUrl && (
                    <DropdownMenuItem onClick={() => window.open(item.projectUrl, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live
                    </DropdownMenuItem>
                  )}
                  {item.githubUrl && (
                    <DropdownMenuItem onClick={() => window.open(item.githubUrl, '_blank')}>
                      <Github className="h-4 w-4 mr-2" />
                      View Code
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      setItemToDelete(item);
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
      {filteredAndSortedItems.map((item) => (
        <Card key={item.id} className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm overflow-hidden rounded-none border-0 border-r border-b border-border">
          {item.featuredImage && (
            <div className="relative aspect-video">
              <img 
                src={item.featuredImage} 
                alt={item.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <Badge variant={item.isPublished ? "default" : "secondary"} className="rounded-none">
                {item.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/cms/portfolio/${item.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/cms/portfolio/${item.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {item.projectUrl && (
                    <DropdownMenuItem onClick={() => window.open(item.projectUrl, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live
                    </DropdownMenuItem>
                  )}
                  {item.githubUrl && (
                    <DropdownMenuItem onClick={() => window.open(item.githubUrl, '_blank')}>
                      <Github className="h-4 w-4 mr-2" />
                      View Code
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="mt-4 line-clamp-2">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex-1">
            {item.description && (
              <p className="text-muted-foreground line-clamp-2 mb-4">
                {item.description}
              </p>
            )}
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {item.category && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  <Badge variant="outline" className="rounded-none">
                    {item.category}
                  </Badge>
                </div>
              )}
              
              {item.project?.client && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {item.project.client.name}
                  {item.project.client.company && ` (${item.project.client.company})`}
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(item.publishedAt || item.createdAt)}
              </div>
              
              {item.technologies && item.technologies.length > 0 && (
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.slice(0, 3).map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs rounded-none">
                        {tech}
                      </Badge>
                    ))}
                    {item.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs rounded-none">
                        +{item.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                {item.projectUrl && (
                  <button 
                    onClick={() => window.open(item.projectUrl, '_blank')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Live
                  </button>
                )}
                {item.githubUrl && (
                  <button 
                    onClick={() => window.open(item.githubUrl, '_blank')}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <Github className="h-4 w-4 mr-1" />
                    Code
                  </button>
                )}
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
          <p className="mt-2 text-muted-foreground">Loading portfolio items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects and showcase items
          </p>
        </div>
        <Button onClick={() => router.push('/cms/portfolio/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
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
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
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
              placeholder="Search portfolio..."
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
                <SelectItem key={category} value={category}>
                  {category}
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
      {filteredAndSortedItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No portfolio items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first portfolio item'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => router.push('/cms/portfolio/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Item
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
            <AlertDialogTitle>Delete Portfolio Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}