export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    description?: string;
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
    link?: string;
  }>;
  languages?: Array<{
    id: string;
    language: string;
    proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
  }>;
}

export interface CVTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'ats' | 'creative' | 'professional' | 'minimal' | 'modern';
  previewImage: string;
  features: string[];
  isPopular?: boolean;
}

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: 'ats-simple',
    name: 'ATS Simple',
    slug: 'ats-simple',
    description: 'Clean, ATS-friendly template that passes through applicant tracking systems easily.',
    category: 'ats',
    previewImage: '/images/cv-templates/ats-simple.jpg',
    features: ['ATS Optimized', 'Clean Layout', 'Professional', 'Easy to Read'],
    isPopular: true,
  },
  {
    id: 'ats-professional',
    name: 'ATS Professional',
    slug: 'ats-professional',
    description: 'Professional ATS-compatible template with subtle styling and clear sections.',
    category: 'ats',
    previewImage: '/images/cv-templates/ats-professional.jpg',
    features: ['ATS Compatible', 'Professional Design', 'Clear Sections', 'Contact Friendly'],
  },
  {
    id: 'creative-modern',
    name: 'Creative Modern',
    slug: 'creative-modern',
    description: 'Eye-catching template perfect for creative professionals and designers.',
    category: 'creative',
    previewImage: '/images/cv-templates/creative-modern.jpg',
    features: ['Creative Design', 'Color Accents', 'Visual Appeal', 'Modern Layout'],
  },
  {
    id: 'creative-artistic',
    name: 'Creative Artistic',
    slug: 'creative-artistic',
    description: 'Bold and artistic template for creatives who want to stand out.',
    category: 'creative',
    previewImage: '/images/cv-templates/creative-artistic.jpg',
    features: ['Artistic Design', 'Bold Typography', 'Creative Layout', 'Unique Style'],
  },
  {
    id: 'professional-executive',
    name: 'Professional Executive',
    slug: 'professional-executive',
    description: 'Sophisticated template ideal for senior executives and management roles.',
    category: 'professional',
    previewImage: '/images/cv-templates/professional-executive.jpg',
    features: ['Executive Style', 'Sophisticated', 'Leadership Focus', 'Premium Look'],
    isPopular: true,
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    slug: 'professional-corporate',
    description: 'Classic corporate template perfect for traditional business environments.',
    category: 'professional',
    previewImage: '/images/cv-templates/professional-corporate.jpg',
    features: ['Corporate Style', 'Traditional Layout', 'Business Focus', 'Conservative Design'],
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    slug: 'minimal-clean',
    description: 'Ultra-clean minimal template that focuses on content over design.',
    category: 'minimal',
    previewImage: '/images/cv-templates/minimal-clean.jpg',
    features: ['Minimal Design', 'Content Focus', 'Clean Typography', 'Distraction Free'],
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    slug: 'modern-tech',
    description: 'Contemporary template perfect for tech professionals and developers.',
    category: 'modern',
    previewImage: '/images/cv-templates/modern-tech.jpg',
    features: ['Tech Focused', 'Modern Design', 'Skills Highlight', 'Developer Friendly'],
    isPopular: true,
  },
];

export const DEFAULT_CV_DATA: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};