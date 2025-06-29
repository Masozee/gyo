"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Sparkles, Briefcase, Palette } from 'lucide-react';
import { CV_TEMPLATES, type CVTemplate } from '@/lib/cv-types';
import Link from 'next/link';

export default function CVBuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'ats', name: 'ATS Friendly', icon: FileText },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'creative', name: 'Creative', icon: Palette },
    { id: 'minimal', name: 'Minimal', icon: FileText },
    { id: 'modern', name: 'Modern', icon: Sparkles },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? CV_TEMPLATES 
    : CV_TEMPLATES.filter(template => template.category === selectedCategory);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CV Builder</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create professional CVs with ATS-friendly templates
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/admin/tools/cv-builder/my-cvs">
            My CVs
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Templates</p>
              <p className="text-lg font-bold">{CV_TEMPLATES.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">ATS Ready</p>
              <p className="text-lg font-bold">
                {CV_TEMPLATES.filter(t => t.category === 'ats').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Creative</p>
              <p className="text-lg font-bold">
                {CV_TEMPLATES.filter(t => t.category === 'creative').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-xs text-muted-foreground">Popular</p>
              <p className="text-lg font-bold">
                {CV_TEMPLATES.filter(t => t.isPopular).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <IconComponent className="h-3 w-3" />
              <span className="text-xs">{category.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 rounded-md mb-3 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-slate-300" />
                </div>
                {template.isPopular && (
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm leading-tight">{template.name}</h3>
                  <Badge variant="outline" className="text-xs capitalize ml-2 flex-shrink-0">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {template.description}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.features.slice(0, 2).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {template.features.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.features.length - 2}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/admin/tools/cv-builder/create?template=${template.slug}`}>
                    <FileText className="h-3 w-3 mr-1" />
                    <span className="text-xs">Use</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/tools/cv-builder/preview?template=${template.slug}`}>
                    <Eye className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category or check back later for new templates.
          </p>
        </div>
      )}
    </div>
  );
}