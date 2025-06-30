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
    photoUrl?: string;
  };
  styling: {
    fontFamily: string;
    fontSize: number;
    primaryColor: string;
    textColor: string;
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

// Google Fonts options
export const GOOGLE_FONTS = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Nunito', value: 'Nunito' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Merriweather', value: 'Merriweather' },
];

// Single customizable template
export const CV_TEMPLATE = {
  id: 'professional',
  name: 'Professional CV',
  slug: 'professional',
  description: 'Customizable professional template with photo support and Google Fonts.',
  features: ['Photo Support', 'Google Fonts', 'Customizable Colors', 'ATS Friendly'],
};

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
    photoUrl: '',
  },
  styling: {
    fontFamily: 'Inter',
    fontSize: 14,
    primaryColor: '#2563eb',
    textColor: '#1f2937',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};