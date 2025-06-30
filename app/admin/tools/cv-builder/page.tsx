"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Sparkles, Palette, Type, Upload } from 'lucide-react';
import { CV_TEMPLATE } from '@/lib/cv-types';
import Link from 'next/link';

export default function CVBuilderPage() {

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CV Builder</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create professional CVs with customizable fonts and styling
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/admin/tools/cv-builder/my-cvs">
            My CVs
          </Link>
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Photo Upload</p>
              <p className="text-xs text-muted-foreground">Add your professional photo</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Type className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-medium">Google Fonts</p>
              <p className="text-xs text-muted-foreground">10+ font options</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Custom Colors</p>
              <p className="text-xs text-muted-foreground">Personalize your style</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-xs text-muted-foreground">Gemini-powered summaries</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Template Preview */}
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-600 font-medium">Professional CV Template</p>
                <p className="text-blue-500 text-sm">Customizable & ATS-Friendly</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{CV_TEMPLATE.name}</h3>
            <p className="text-muted-foreground">{CV_TEMPLATE.description}</p>
          </div>
        </CardHeader>
        <CardContent>
          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CV_TEMPLATE.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-sm">
                {feature}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/admin/tools/cv-builder/create">
                <FileText className="h-4 w-4 mr-2" />
                Create New CV
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/tools/cv-builder/my-cvs">
                <Eye className="h-4 w-4 mr-2" />
                View My CVs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Fill Your Information</h4>
              <p className="text-sm text-muted-foreground">Add your personal details, work experience, and skills</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Customize Style</h4>
              <p className="text-sm text-muted-foreground">Choose fonts, colors, and add your professional photo</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Download PDF</h4>
              <p className="text-sm text-muted-foreground">Export your professional CV as a high-quality PDF</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}