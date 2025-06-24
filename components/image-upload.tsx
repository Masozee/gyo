"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  ExternalLink,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onCreditChange?: (credit: string) => void;
  credit?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  value = '',
  onChange,
  onCreditChange,
  credit = '',
  label = 'Featured Image',
  placeholder = 'https://example.com/image.jpg',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      onChange(result.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onChange('');
    if (onCreditChange) onCreditChange('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
          Image URL
        </Label>
        <div className="flex space-x-2">
          <Input
            id="imageUrl"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(value, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Or upload a new image
        </Label>
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="p-2 bg-muted rounded-full mb-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP or GIF (max 5MB)
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Preview */}
      {value && (
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">Preview</Label>
          <div className="relative">
            <div className="border rounded-md p-2 bg-muted/25">
              <img
                src={value}
                alt="Featured image preview"
                className="w-full h-40 object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Image Credit */}
      {onCreditChange && (
        <div className="space-y-2">
          <Label htmlFor="imageCredit" className="text-sm text-muted-foreground flex items-center">
            <Camera className="h-3 w-3 mr-1" />
            Image Credit (Optional)
          </Label>
          <Textarea
            id="imageCredit"
            value={credit}
            onChange={(e) => onCreditChange(e.target.value)}
            placeholder="Photo by John Doe on Unsplash, or source attribution..."
            rows={2}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Add attribution for the image source, photographer, or license information.
          </p>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">Image Guidelines:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Recommended size: 1200x630px (16:9 aspect ratio)</li>
          <li>Maximum file size: 5MB</li>
          <li>Supported formats: PNG, JPG, WebP, GIF</li>
          <li>Images are automatically optimized for web</li>
        </ul>
      </div>
    </div>
  );
} 