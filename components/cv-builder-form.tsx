"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Award, Globe, Upload, Sparkles, Palette, Type } from 'lucide-react';
import { type CVData, GOOGLE_FONTS } from '@/lib/cv-types';
import { toast } from 'sonner';

interface CVBuilderFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

export function CVBuilderForm({ data, onChange }: CVBuilderFormProps) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const updateData = (section: keyof CVData, value: any) => {
    onChange({ ...data, [section]: value });
  };

  const updatePersonalInfo = (field: string, value: string) => {
    updateData('personalInfo', { ...data.personalInfo, [field]: value });
  };

  const updateStyling = (field: string, value: any) => {
    updateData('styling', { ...data.styling, [field]: value });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        updatePersonalInfo('photoUrl', result.photoUrl);
        toast.success('Photo uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: data.experience[0]?.jobTitle || '',
          experience: data.experience.length,
          skills: data.skills.map(s => s.items.join(', ')).join(', '),
          industry: data.experience[0]?.company || '',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        updatePersonalInfo('summary', result.summary);
        toast.success('Summary generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Summary generation error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    updateData('experience', [...data.experience, newExperience]);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const updated = data.experience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateData('experience', updated);
  };

  const removeExperience = (id: string) => {
    updateData('experience', data.experience.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    };
    updateData('education', [...data.education, newEducation]);
  };

  const updateEducation = (id: string, field: string, value: any) => {
    const updated = data.education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateData('education', updated);
  };

  const removeEducation = (id: string) => {
    updateData('education', data.education.filter(edu => edu.id !== id));
  };

  const addSkillCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      category: '',
      items: [],
    };
    updateData('skills', [...data.skills, newCategory]);
  };

  const updateSkillCategory = (id: string, field: string, value: any) => {
    const updated = data.skills.map(skill =>
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    updateData('skills', updated);
  };

  const removeSkillCategory = (id: string) => {
    updateData('skills', data.skills.filter(skill => skill.id !== id));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
    };
    updateData('projects', [...(data.projects || []), newProject]);
  };

  const updateProject = (id: string, field: string, value: any) => {
    const updated = (data.projects || []).map(project =>
      project.id === id ? { ...project, [field]: value } : project
    );
    updateData('projects', updated);
  };

  const removeProject = (id: string) => {
    updateData('projects', (data.projects || []).filter(project => project.id !== id));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="personal" className="flex flex-col items-center gap-1 text-xs h-auto py-2 px-1">
            <User className="h-4 w-4" />
            <span className="text-xs">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="styling" className="flex flex-col items-center gap-1 text-xs h-auto py-2 px-1">
            <Palette className="h-4 w-4" />
            <span className="text-xs">Styling</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex flex-col items-center gap-1 text-xs h-auto py-2 px-1">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Work</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex flex-col items-center gap-1 text-xs h-auto py-2 px-1">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex flex-col items-center gap-1 text-xs h-auto py-2 px-1">
            <Code className="h-4 w-4" />
            <span className="text-xs">Skills</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Photo Upload */}
              <div className="flex flex-col items-center space-y-4">
                {data.personalInfo.photoUrl && (
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                    <img 
                      src={data.personalInfo.photoUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="photo-upload">Profile Photo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={isUploadingPhoto}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={data.personalInfo.website}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    placeholder="https://johndoe.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={data.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="summary">Professional Summary *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGeneratingSummary ? 'Generating...' : 'AI Assist'}
                  </Button>
                </div>
                <Textarea
                  id="summary"
                  value={data.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  placeholder="Brief professional summary highlighting your key achievements and goals"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Styling Options */}
        <TabsContent value="styling">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                CV Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Font Family</Label>
                <Select value={data.styling.fontFamily} onValueChange={(value) => updateStyling('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Size: {data.styling.fontSize}px</Label>
                <Slider
                  value={[data.styling.fontSize]}
                  onValueChange={(value) => updateStyling('fontSize', value[0])}
                  min={12}
                  max={18}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={data.styling.primaryColor}
                    onChange={(e) => updateStyling('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={data.styling.primaryColor}
                    onChange={(e) => updateStyling('primaryColor', e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="textColor"
                    type="color"
                    value={data.styling.textColor}
                    onChange={(e) => updateStyling('textColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={data.styling.textColor}
                    onChange={(e) => updateStyling('textColor', e.target.value)}
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience (simplified for brevity - similar pattern to original) */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Work Experience
                <Button onClick={addExperience} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Experience #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label>Job Title *</Label>
                      <Input
                        value={exp.jobTitle}
                        onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <Label>Company *</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      />
                      <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                    </div>
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="Describe your role, responsibilities, and achievements"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              {data.experience.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No work experience added yet. Click "Add Experience" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education - Similar structure as experience */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Education
                <Button onClick={addEducation} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4">
              {data.education.map((edu, index) => (
                <div key={edu.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Education #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label>Degree *</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div>
                      <Label>Institution *</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="University of Technology"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        placeholder="Boston, MA"
                      />
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      placeholder="Relevant coursework, achievements, activities"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {data.education.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No education added yet. Click "Add Education" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Skills
                <Button onClick={addSkillCategory} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill Category
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4">
              {data.skills.map((skillGroup, index) => (
                <div key={skillGroup.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Skill Category #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkillCategory(skillGroup.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Category Name *</Label>
                    <Input
                      value={skillGroup.category}
                      onChange={(e) => updateSkillCategory(skillGroup.id, 'category', e.target.value)}
                      placeholder="Programming Languages"
                    />
                  </div>
                  <div>
                    <Label>Skills (comma-separated) *</Label>
                    <Textarea
                      value={skillGroup.items.join(', ')}
                      onChange={(e) => updateSkillCategory(skillGroup.id, 'items', 
                        e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      )}
                      placeholder="JavaScript, Python, React, Node.js"
                      rows={2}
                    />
                    {skillGroup.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {skillGroup.items.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {data.skills.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No skills added yet. Click "Add Skill Category" to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}