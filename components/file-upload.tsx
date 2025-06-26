"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, File, Image, FileText, Video } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded: (file: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    description?: string;
  }) => void;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({ 
  onFileUploaded, 
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className = '' 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (file.size > maxFileSize) {
      toast.error(`File size must be less than ${formatFileSize(maxFileSize)}`);
      return false;
    }

    // Simple type validation - can be enhanced
    const validTypes = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!validTypes) {
      toast.error('Invalid file type. Please upload a supported file.');
      return false;
    }

    return true;
  };

  const handleFileSelection = (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const simulateUpload = async (file: File): Promise<string> => {
    // Simulate file upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Return a mock URL - in real implementation, this would be from your upload service
          resolve(`/uploads/${Date.now()}_${file.name}`);
        }
        setUploadProgress(Math.min(progress, 100));
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload - replace with actual upload logic
      const fileUrl = await simulateUpload(selectedFile);
      
      // Call the callback with file information
      onFileUploaded({
        fileName: selectedFile.name,
        fileUrl,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        description: description.trim() || undefined,
      });

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDescription('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!selectedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Upload a file</p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Maximum file size: {formatFileSize(maxFileSize)}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={acceptedTypes.join(',')}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {getFileIcon(selectedFile.type)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-description">Description (optional)</Label>
            <Input
              id="file-description"
              placeholder="Add a description for this file..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 