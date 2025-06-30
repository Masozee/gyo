"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CVBuilderForm } from '@/components/cv-builder-form';
import { CVPreview } from '@/components/cv-preview';
import { DEFAULT_CV_DATA, type CVData } from '@/lib/cv-types';
import { ArrowLeft, Save, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { CV } from '@/lib/schema';

function EditCVContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [cv, setCv] = useState<CV | null>(null);
  const [cvData, setCvData] = useState<CVData>(DEFAULT_CV_DATA);
  const [selectedTemplate, setSelectedTemplate] = useState('ats-simple');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCV();
    }
  }, [id]);

  const fetchCV = async () => {
    try {
      const response = await fetch(`/api/cv-builder/${id}`);
      if (response.ok) {
        const cvData = await response.json();
        setCv(cvData);
        setSelectedTemplate(cvData.template);
        setCvData(JSON.parse(cvData.data));
      } else {
        toast.error('CV not found');
        router.push('/admin/tools/cv-builder/my-cvs');
      }
    } catch (error) {
      console.error('Failed to fetch CV:', error);
      toast.error('Failed to load CV');
      router.push('/admin/tools/cv-builder/my-cvs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cv-builder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id),
          title: cvData.personalInfo.fullName || cv?.title || 'Untitled CV',
          template: selectedTemplate,
          data: JSON.stringify(cvData),
        }),
      });

      if (!response.ok) throw new Error('Failed to update CV');

      toast.success('CV updated successfully!');
    } catch (error) {
      console.error('Failed to update CV:', error);
      toast.error('Failed to update CV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cv-builder/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          data: cvData,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.personalInfo.fullName || cv?.title || 'CV'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CV downloaded successfully!');
    } catch (error) {
      console.error('Failed to download CV:', error);
      toast.error('Failed to download CV');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">CV Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The CV you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <a href="/admin/tools/cv-builder/my-cvs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My CVs
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit CV</h1>
            <p className="text-muted-foreground">
              {cv.title} - {selectedTemplate}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={handleDownload} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Form */}
        <div className="space-y-6">
          <CVBuilderForm
            data={cvData}
            onChange={setCvData}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="xl:sticky xl:top-6">
            <CVPreview
              data={cvData}
              template={selectedTemplate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditCVPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditCVContent />
    </Suspense>
  );
}