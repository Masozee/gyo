"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CVBuilderForm } from '@/components/cv-builder-form';
import { CVPreview } from '@/components/cv-preview';
import { CV_TEMPLATE, DEFAULT_CV_DATA, type CVData } from '@/lib/cv-types';
import { ArrowLeft, Save, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

function CreateCVContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cvData, setCvData] = useState<CVData>(DEFAULT_CV_DATA);
  const selectedTemplate = CV_TEMPLATE.slug;
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cv-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cvData.personalInfo.fullName || 'Untitled CV',
          template: selectedTemplate,
          data: JSON.stringify(cvData),
        }),
      });

      if (!response.ok) throw new Error('Failed to save CV');

      const result = await response.json();
      toast.success('CV saved successfully!');
      router.push(`/admin/tools/cv-builder/edit/${result.id}`);
    } catch (error) {
      console.error('Failed to save CV:', error);
      toast.error('Failed to save CV');
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
      a.download = `${cvData.personalInfo.fullName || 'CV'}.pdf`;
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

  const currentTemplate = CV_TEMPLATE;

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
            <h1 className="text-3xl font-bold tracking-tight">Create CV</h1>
            <p className="text-muted-foreground">
              Using: {currentTemplate.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save CV
          </Button>
          <Button onClick={handleDownload} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <CVBuilderForm
            data={cvData}
            onChange={setCvData}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6">
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

export default function CreateCVPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCVContent />
    </Suspense>
  );
}