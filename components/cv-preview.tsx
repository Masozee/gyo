"use client";

import { type CVData } from '@/lib/cv-types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
  template: string;
}

export function CVPreview({ data, template }: CVPreviewProps) {
  const renderATSTemplate = () => (
    <div className="bg-white text-black p-8 font-serif max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {data.personalInfo.email}
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {data.personalInfo.phone}
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {data.personalInfo.location}
            </div>
          )}
          {data.personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {data.personalInfo.website}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-1">WORK EXPERIENCE</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                    <p className="font-semibold">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    <p>{exp.location}</p>
                  </div>
                </div>
                <p className="text-sm mt-2 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-1">EDUCATION</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{edu.degree}</h3>
                    <p className="font-semibold">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{edu.startDate} - {edu.endDate}</p>
                    <p>{edu.location}</p>
                  </div>
                </div>
                {edu.description && (
                  <p className="text-sm mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-1">SKILLS</h2>
          <div className="space-y-2">
            {data.skills.map((skillGroup) => (
              <div key={skillGroup.id}>
                <span className="font-semibold">{skillGroup.category}: </span>
                <span className="text-sm">{skillGroup.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {(data.projects || []).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-1">PROJECTS</h2>
          <div className="space-y-3">
            {(data.projects || []).map((project) => (
              <div key={project.id}>
                <h3 className="font-bold">{project.name}</h3>
                <p className="text-sm mt-1">{project.description}</p>
                {project.technologies.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Technologies: </span>
                    {project.technologies.join(', ')}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-blue-600 mt-1">
                  {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer">Live Demo</a>}
                  {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
        <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {data.personalInfo.email}
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {data.personalInfo.phone}
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {data.personalInfo.location}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.personalInfo.summary && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-3 text-blue-600">About Me</h2>
          <p className="leading-relaxed">{data.personalInfo.summary}</p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Experience */}
          {data.experience.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Experience</h2>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                    <p className="font-semibold text-purple-600">{exp.company}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate} | {exp.location}
                    </p>
                    <p className="whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {(data.projects || []).length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Projects</h2>
              <div className="space-y-4">
                {(data.projects || []).map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <p className="mt-2">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Skills</h2>
              <div className="space-y-4">
                {data.skills.map((skillGroup) => (
                  <div key={skillGroup.id}>
                    <h3 className="font-semibold text-purple-600 mb-2">{skillGroup.category}</h3>
                    <div className="flex flex-wrap gap-1">
                      {skillGroup.items.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Education</h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold">{edu.degree}</h3>
                    <p className="font-semibold text-purple-600">{edu.institution}</p>
                    <p className="text-sm text-gray-600">
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfessionalTemplate = () => (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            {data.personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {data.personalInfo.email}
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {data.personalInfo.phone}
              </div>
            )}
          </div>
          <div className="space-y-1">
            {data.personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.personalInfo.location}
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                {data.personalInfo.linkedin}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-gray-800 uppercase tracking-wide">Executive Summary</h2>
          <p className="leading-relaxed text-gray-700">{data.personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase tracking-wide">Professional Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-gray-300 pl-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
                    <p className="font-semibold text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p className="font-semibold">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    <p>{exp.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Education Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase tracking-wide">Core Competencies</h2>
            <div className="space-y-3">
              {data.skills.map((skillGroup) => (
                <div key={skillGroup.id}>
                  <h3 className="font-semibold text-gray-700 mb-1">{skillGroup.category}</h3>
                  <p className="text-sm text-gray-600">{skillGroup.items.join(' • ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase tracking-wide">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className="font-semibold text-gray-700">{edu.institution}</p>
                  <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const getTemplateRenderer = () => {
    switch (template) {
      case 'creative-modern':
      case 'creative-artistic':
        return renderCreativeTemplate;
      case 'professional-executive':
      case 'professional-corporate':
        return renderProfessionalTemplate;
      case 'ats-simple':
      case 'ats-professional':
      default:
        return renderATSTemplate;
    }
  };

  return (
    <Card className="h-fit">
      <CardContent className="p-0">
        <div className="bg-gray-100 p-4 border-b">
          <h3 className="font-semibold">CV Preview</h3>
          <p className="text-sm text-muted-foreground">This is how your CV will look</p>
        </div>
        <div className="overflow-hidden">
          <div className="transform scale-75 origin-top">
            {getTemplateRenderer()()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}