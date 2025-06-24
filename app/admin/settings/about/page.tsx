"use client"

import * as React from "react"
import { Save, Plus, Trash2, Upload, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Skill {
  name: string
  category: string
}

interface Experience {
  title: string
  company: string
  period: string
  description: string
  achievements: string[]
}

interface Education {
  degree: string
  school: string
  period: string
  description: string
}

export default function AboutSettingsPage() {
  // Personal Information
  const [fullName, setFullName] = React.useState("Your Name")
  const [title, setTitle] = React.useState("Full-Stack Developer")
  const [bio, setBio] = React.useState("")
  const [yearsExperience, setYearsExperience] = React.useState("5")
  const [location, setLocation] = React.useState("")
  const [profileImage, setProfileImage] = React.useState("")

  // Contact Information
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [linkedinUrl, setLinkedinUrl] = React.useState("")
  const [githubUrl, setGithubUrl] = React.useState("")
  const [portfolioUrl, setPortfolioUrl] = React.useState("")
  const [resumeUrl, setResumeUrl] = React.useState("")

  // Technical Skills
  const [skills, setSkills] = React.useState<Skill[]>([
    { name: "JavaScript", category: "Languages" },
    { name: "TypeScript", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Django", category: "Backend" },
    { name: "PostgreSQL", category: "Databases" },
  ])

  // Experience
  const [experiences, setExperiences] = React.useState<Experience[]>([
    {
      title: "Senior Full-Stack Developer",
      company: "Tech Solutions Inc.",
      period: "2022 - Present",
      description: "Lead development of scalable web applications using Django, Next.js, and TypeScript.",
      achievements: [
        "Reduced application load time by 40% through optimization",
        "Led a team of 5 developers on multiple projects"
      ]
    }
  ])

  // Education
  const [education, setEducation] = React.useState<Education[]>([
    {
      degree: "Bachelor of Computer Science",
      school: "University of Technology",
      period: "2015 - 2019",
      description: "Focused on software engineering, algorithms, and web development."
    }
  ])

  // Certifications
  const [certifications, setCertifications] = React.useState<string[]>([
    "AWS Certified Developer",
    "Google Cloud Professional"
  ])

  // Fun Facts
  const [funFacts, setFunFacts] = React.useState<string[]>([
    "Coffee enthusiast - tried coffee from 20+ countries",
    "Open source contributor to 15+ projects"
  ])

  const handleSave = () => {
    console.log("Saving about page content...")
  }

  const addSkill = () => {
    setSkills([...skills, { name: "", category: "Languages" }])
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...skills]
    updatedSkills[index][field] = value
    setSkills(updatedSkills)
  }

  const addExperience = () => {
    setExperiences([...experiences, {
      title: "",
      company: "",
      period: "",
      description: "",
      achievements: [""]
    }])
  }

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    const updatedExperiences = [...experiences]
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value }
    setExperiences(updatedExperiences)
  }

  const addAchievement = (expIndex: number) => {
    const updatedExperiences = [...experiences]
    updatedExperiences[expIndex].achievements.push("")
    setExperiences(updatedExperiences)
  }

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const updatedExperiences = [...experiences]
    updatedExperiences[expIndex].achievements = updatedExperiences[expIndex].achievements.filter((_, i) => i !== achIndex)
    setExperiences(updatedExperiences)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">About Page Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal information and about page content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/about" target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic information about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Full-Stack Developer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio/Description</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief description about yourself..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Profile Image */}
              <div className="space-y-4">
                <Label>Profile Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile preview" 
                        className="max-w-full max-h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Square image, 400x400px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How people can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <Input
                    id="resumeUrl"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://yoursite.com/resume.pdf"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Technical Skills</CardTitle>
                  <CardDescription>
                    Your technical expertise and technologies
                  </CardDescription>
                </div>
                <Button size="sm" onClick={addSkill}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(index, "name", e.target.value)}
                    placeholder="Skill name"
                    className="flex-1"
                  />
                  <select
                    value={skill.category}
                    onChange={(e) => updateSkill(index, "category", e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Databases">Databases</option>
                    <option value="Tools & Platforms">Tools & Platforms</option>
                    <option value="Testing & DevOps">Testing & DevOps</option>
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Certifications</CardTitle>
                  <CardDescription>
                    Professional certifications and credentials
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setCertifications([...certifications, ""])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={cert}
                    onChange={(e) => {
                      const updated = [...certifications]
                      updated[index] = e.target.value
                      setCertifications(updated)
                    }}
                    placeholder="Certification name"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fun Facts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fun Facts</CardTitle>
                  <CardDescription>
                    Interesting facts about yourself
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setFunFacts([...funFacts, ""])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {funFacts.map((fact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={fact}
                    onChange={(e) => {
                      const updated = [...funFacts]
                      updated[index] = e.target.value
                      setFunFacts(updated)
                    }}
                    placeholder="Fun fact about yourself"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFunFacts(funFacts.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Configuration for about page content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# About Page Configuration
ABOUT_FULL_NAME="${fullName}"
ABOUT_TITLE="${title}"
ABOUT_YEARS_EXPERIENCE=${yearsExperience}
ABOUT_LOCATION="${location}"
ABOUT_EMAIL=${email}
ABOUT_LINKEDIN_URL="${linkedinUrl}"
ABOUT_GITHUB_URL="${githubUrl}"
ABOUT_PORTFOLIO_URL="${portfolioUrl}"
ABOUT_RESUME_URL="${resumeUrl}"`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}