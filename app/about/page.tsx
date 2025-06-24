import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Code, 
  Database, 
  Palette, 
  Globe, 
  Award, 
  BookOpen, 
  Coffee,
  Github,
  Linkedin,
  Mail,
  Download
} from "lucide-react"

const technicalSkills = {
  "Languages": [
    "JavaScript", "TypeScript", "Python", "HTML", "CSS", "SQL", "Bash"
  ],
  "Frontend": [
    "React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "SCSS", "Styled Components", "Framer Motion"
  ],
  "Backend": [
    "Django", "FastAPI", "Node.js", "Express.js", "GraphQL", "REST APIs", "WebSockets"
  ],
  "Databases": [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase"
  ],
  "Tools & Platforms": [
    "Git", "GitHub", "Docker", "AWS", "Vercel", "Netlify", "Figma", "VS Code"
  ],
  "Testing & DevOps": [
    "Jest", "Cypress", "Playwright", "CI/CD", "GitHub Actions", "Linux", "Nginx"
  ]
}

const experiences = [
  {
    title: "Senior Full-Stack Developer",
    company: "Tech Solutions Inc.",
    period: "2022 - Present",
    description: "Lead development of scalable web applications using Django, Next.js, and TypeScript. Mentored junior developers and implemented best practices for code quality and performance.",
    achievements: [
      "Reduced application load time by 40% through optimization",
      "Led a team of 5 developers on multiple projects",
      "Implemented CI/CD pipelines that reduced deployment time by 60%"
    ]
  },
  {
    title: "Full-Stack Developer",
    company: "Digital Agency Co.",
    period: "2020 - 2022",
    description: "Developed custom web applications and e-commerce solutions for clients. Collaborated with designers to create pixel-perfect, responsive interfaces.",
    achievements: [
      "Delivered 15+ client projects on time and within budget",
      "Improved client satisfaction scores by 25%",
      "Built reusable component library used across multiple projects"
    ]
  },
  {
    title: "Frontend Developer",
    company: "StartupXYZ",
    period: "2019 - 2020",
    description: "Built responsive web interfaces and collaborated with UX designers to create intuitive user experiences. Worked in an agile environment with rapid iterations.",
    achievements: [
      "Increased user engagement by 35% through UI improvements",
      "Reduced bug reports by 50% through comprehensive testing",
      "Contributed to product roadmap and feature planning"
    ]
  }
]

const education = [
  {
    degree: "Bachelor of Computer Science",
    school: "University of Technology",
    period: "2015 - 2019",
    description: "Focused on software engineering, algorithms, and web development. Graduated Magna Cum Laude."
  }
]

const certifications = [
  "AWS Certified Developer",
  "Google Cloud Professional",
  "MongoDB Certified Developer",
  "Certified Scrum Master"
]

export default function About() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            About <span className="text-primary">Me</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Passionate full-stack developer with {new Date().getFullYear() - 2019}+ years of experience 
            creating innovative web solutions and beautiful user interfaces.
          </p>
        </div>

        {/* Personal Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-4">Hello, I'm a Full-Stack Developer</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      I'm passionate about creating digital experiences that make a difference. 
                      With a strong background in both frontend and backend development, I specialize 
                      in building scalable web applications using modern technologies like Django, 
                      Next.js, and TypeScript.
                    </p>
                    <p>
                      My journey in web development started {new Date().getFullYear() - 2019} years ago, and since then, 
                      I've had the privilege of working with startups, agencies, and established companies 
                      to bring their digital visions to life. I believe in writing clean, maintainable 
                      code and creating interfaces that users love to interact with.
                    </p>
                    <p>
                      When I'm not coding, you can find me exploring new technologies, contributing to 
                      open-source projects, or enjoying a good cup of coffee while planning my next project.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-6">
                    <Button asChild>
                      <Link href="mailto:your.email@domain.com">
                        <Mail className="mr-2 h-4 w-4" />
                        Get In Touch
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/resume.pdf" target="_blank">
                        <Download className="mr-2 h-4 w-4" />
                        Download Resume
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center">
                    <Code className="h-24 w-24 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href="https://github.com/yourusername" target="_blank">
                        <Github className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="https://linkedin.com/in/yourusername" target="_blank">
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Skills</h2>
          <div className="space-y-8">
            {Object.entries(technicalSkills).map(([category, skillList]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category === "Languages" && <Code className="h-5 w-5 text-primary" />}
                    {category === "Frontend" && <Globe className="h-5 w-5 text-primary" />}
                    {category === "Backend" && <Database className="h-5 w-5 text-primary" />}
                    {category === "Databases" && <Database className="h-5 w-5 text-primary" />}
                    {category === "Tools & Platforms" && <Palette className="h-5 w-5 text-primary" />}
                    {category === "Testing & DevOps" && <Award className="h-5 w-5 text-primary" />}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {skillList.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Professional Experience</h2>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{exp.title}</h3>
                      <p className="text-primary font-medium">{exp.company}</p>
                    </div>
                    <Badge variant="outline" className="mt-2 md:mt-0">
                      {exp.period}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{exp.description}</p>
                  <div>
                    <h4 className="font-medium mb-2">Key Achievements:</h4>
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start text-sm text-muted-foreground">
                          <span className="text-primary mr-2 mt-1">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Education & Certifications */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Education */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Education
              </h2>
              {education.map((edu, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold">{edu.degree}</h3>
                    <p className="text-primary font-medium">{edu.school}</p>
                    <Badge variant="outline" className="mt-2 mb-4">{edu.period}</Badge>
                    <p className="text-muted-foreground text-sm">{edu.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Certifications */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Certifications
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Fun Facts About Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Coffee className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Coffee Enthusiast</h3>
                <p className="text-sm text-muted-foreground">
                  I've tried coffee from over 20 different countries
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Code className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Open Source</h3>
                <p className="text-sm text-muted-foreground">
                  Contributed to 15+ open source projects
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Continuous Learner</h3>
                <p className="text-sm text-muted-foreground">
                  Read 24+ tech books this year
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Build Something Amazing</h2>
          <p className="text-muted-foreground mb-8">
            I'm always excited to take on new challenges and collaborate on interesting projects. 
            Whether you have a specific idea in mind or just want to explore possibilities, I'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/portfolio">
                View My Work
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="mailto:your.email@domain.com">
                Start a Conversation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}