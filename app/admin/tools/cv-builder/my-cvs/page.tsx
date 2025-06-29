"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Calendar,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { type CV } from '@/lib/schema';

export default function MyCVsPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const response = await fetch('/api/cv-builder');
      if (response.ok) {
        const data = await response.json();
        setCvs(data.cvs || []);
      }
    } catch (error) {
      console.error('Failed to fetch CVs:', error);
      toast.error('Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cv: CV) => {
    try {
      const cvData = JSON.parse(cv.data);
      const response = await fetch('/api/cv-builder/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: cv.template,
          data: cvData,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.fileName || cv.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CV downloaded successfully!');
    } catch (error) {
      console.error('Failed to download CV:', error);
      toast.error('Failed to download CV');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this CV?')) return;

    try {
      const response = await fetch(`/api/cv-builder?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete CV');

      setCvs(cvs.filter(cv => cv.id !== id));
      toast.success('CV deleted successfully!');
    } catch (error) {
      console.error('Failed to delete CV:', error);
      toast.error('Failed to delete CV');
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  const getTemplateDisplayName = (template: string) => {
    const templateMap: Record<string, string> = {
      'ats-simple': 'ATS Simple',
      'ats-professional': 'ATS Professional',
      'creative-modern': 'Creative Modern',
      'creative-artistic': 'Creative Artistic',
      'professional-executive': 'Professional Executive',
      'professional-corporate': 'Professional Corporate',
      'minimal-clean': 'Minimal Clean',
      'modern-tech': 'Modern Tech',
    };
    return templateMap[template] || template;
  };

  const getCategoryColor = (template: string) => {
    if (template.includes('ats')) return 'bg-green-100 text-green-800';
    if (template.includes('creative')) return 'bg-purple-100 text-purple-800';
    if (template.includes('professional')) return 'bg-blue-100 text-blue-800';
    if (template.includes('minimal')) return 'bg-gray-100 text-gray-800';
    if (template.includes('modern')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My CVs</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My CVs</h1>
          <p className="text-muted-foreground">
            Manage your created CVs and download them anytime
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tools/cv-builder">
            <Plus className="h-4 w-4 mr-2" />
            Create New CV
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total CVs</p>
                <p className="text-2xl font-bold">{cvs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Public CVs</p>
                <p className="text-2xl font-bold">
                  {cvs.filter(cv => cv.isPublic).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ATS Templates</p>
                <p className="text-2xl font-bold">
                  {cvs.filter(cv => cv.template.includes('ats')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {cvs.filter(cv => {
                    const created = new Date(cv.createdAt || '');
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CVs Grid */}
      {cvs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <Card key={cv.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{cv.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(cv.template)}>
                        {getTemplateDisplayName(cv.template)}
                      </Badge>
                      {cv.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      Created: {formatDate(cv.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated: {formatDate(cv.updatedAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/admin/tools/cv-builder/edit/${cv.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(cv)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(cv.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No CVs yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first CV using our professional templates
          </p>
          <Button asChild>
            <Link href="/admin/tools/cv-builder">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First CV
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}