"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';

// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface WysiwygEditorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  height?: number;
  preview?: 'edit' | 'live' | 'preview';
}

export function WysiwygEditor({
  value = '',
  onChange,
  label,
  placeholder = 'Start writing...',
  height = 400,
  preview = 'edit'
}: WysiwygEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div 
          className="border rounded-md p-4 bg-gray-50 animate-pulse"
          style={{ height: `${height}px` }}
        >
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border rounded-md overflow-hidden">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={height}
          preview={preview}
          data-color-mode="light"
          visibleDragbar={false}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              lineHeight: 1.5,
            },
          }}
        />
      </div>
    </div>
  );
}

// Simple text editor for basic content
interface SimpleEditorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function SimpleEditor({
  value = '',
  onChange,
  label,
  placeholder = 'Enter content...',
  rows = 6
}: SimpleEditorProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
      />
    </div>
  );
} 