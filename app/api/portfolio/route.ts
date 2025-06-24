import { NextRequest, NextResponse } from "next/server"
export const runtime = 'nodejs';

// Mock portfolio data - In a real app, this would come from a database
const portfolioData = {
  projects: [
    {
      id: 1,
      title: "E-commerce Dashboard",
      description: "Full-featured admin dashboard built with Django and Next.js. Features real-time analytics, inventory management, order processing, and comprehensive reporting tools.",
      technologies: ["Django", "Next.js", "TypeScript", "PostgreSQL", "Redis", "Tailwind CSS"],
      category: "Full-Stack",
      status: "Completed",
      date: "2024",
      features: [
        "Real-time sales analytics and reporting",
        "Inventory management with automated alerts",
        "Order processing and fulfillment tracking",
        "Customer management system",
        "Payment integration with Stripe",
        "Responsive design for mobile and desktop"
      ],
      github: "https://github.com/yourusername/ecommerce-dashboard",
      demo: "https://ecommerce-demo.vercel.app",
      image: "/projects/ecommerce-dashboard.jpg"
    },
    {
      id: 2,
      title: "Task Management Platform",
      description: "Collaborative project management tool with real-time updates, drag-and-drop interface, team collaboration features, and advanced project tracking.",
      technologies: ["React", "TypeScript", "Node.js", "Socket.io", "MongoDB", "Chakra UI"],
      category: "Frontend",
      status: "Completed",
      date: "2024",
      features: [
        "Drag-and-drop kanban boards",
        "Real-time collaboration with WebSocket",
        "Team member management and permissions",
        "Task dependencies and timeline view",
        "File attachments and comments",
        "Advanced filtering and search"
      ],
      github: "https://github.com/yourusername/task-manager",
      demo: "https://taskmanager-demo.vercel.app",
      image: "/projects/task-management.jpg"
    },
    {
      id: 3,
      title: "Restaurant POS System",
      description: "Point-of-sale system for restaurants built with Django REST API and React frontend. Includes order management, inventory tracking, and sales reporting.",
      technologies: ["Django", "Django REST", "React", "PostgreSQL", "Docker", "AWS"],
      category: "Full-Stack",
      status: "Completed",
      date: "2023",
      features: [
        "Order management and kitchen display",
        "Inventory tracking and alerts",
        "Sales analytics and reporting",
        "Customer loyalty program",
        "Multi-location support",
        "Integration with payment processors"
      ],
      github: "https://github.com/yourusername/restaurant-pos",
      demo: "https://restaurant-pos-demo.herokuapp.com",
      image: "/projects/restaurant-pos.jpg"
    },
    {
      id: 4,
      title: "Personal Finance Tracker",
      description: "Web application for tracking personal finances with categorization, budgeting, and expense analytics. Built with modern TypeScript and clean architecture.",
      technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Chart.js", "NextAuth"],
      category: "Full-Stack",
      status: "In Progress",
      date: "2024",
      features: [
        "Expense categorization and tracking",
        "Budget planning and monitoring",
        "Financial goal setting",
        "Interactive charts and analytics",
        "Bank account integration",
        "Recurring transaction management"
      ],
      github: "https://github.com/yourusername/finance-tracker",
      demo: null,
      image: "/projects/finance-tracker.jpg"
    },
    {
      id: 5,
      title: "Blog CMS",
      description: "Content management system for bloggers with markdown support, SEO optimization, and analytics. Features a clean admin interface and customizable themes.",
      technologies: ["Django", "Next.js", "PostgreSQL", "Markdown", "SEO Tools"],
      category: "Full-Stack",
      status: "Completed",
      date: "2023",
      features: [
        "Markdown editor with live preview",
        "SEO optimization tools",
        "Comment system and moderation",
        "Analytics and visitor tracking",
        "Customizable themes",
        "Tag and category management"
      ],
      github: "https://github.com/yourusername/blog-cms",
      demo: "https://blog-cms-demo.vercel.app",
      image: "/projects/blog-cms.jpg"
    },
    {
      id: 6,
      title: "Weather Dashboard",
      description: "Real-time weather monitoring dashboard with data visualization, forecasts, and location-based services. Built with modern React and weather APIs.",
      technologies: ["React", "TypeScript", "Weather API", "D3.js", "Styled Components"],
      category: "Frontend",
      status: "Completed",
      date: "2023",
      features: [
        "Real-time weather data",
        "7-day weather forecast",
        "Interactive weather maps",
        "Location-based services",
        "Historical weather data",
        "Weather alerts and notifications"
      ],
      github: "https://github.com/yourusername/weather-dashboard",
      demo: "https://weather-dashboard-demo.netlify.app",
      image: "/projects/weather-dashboard.jpg"
    }
  ],
  skills: {
    "Frontend": [
      { name: "Next.js", level: 95 },
      { name: "React", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "JavaScript", level: 95 },
      { name: "Tailwind CSS", level: 90 },
      { name: "HTML/CSS", level: 95 }
    ],
    "Backend": [
      { name: "Django", level: 95 },
      { name: "Python", level: 90 },
      { name: "Node.js", level: 85 },
      { name: "PostgreSQL", level: 85 },
      { name: "REST APIs", level: 90 },
      { name: "GraphQL", level: 75 }
    ],
    "Design & Tools": [
      { name: "UI/UX Design", level: 85 },
      { name: "Figma", level: 80 },
      { name: "Git/GitHub", level: 90 },
      { name: "Docker", level: 75 },
      { name: "AWS", level: 70 },
      { name: "Vercel", level: 85 }
    ]
  },
  experiences: [
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let filteredProjects = portfolioData.projects
    
    if (category && category !== 'All') {
      filteredProjects = portfolioData.projects.filter(project => 
        project.category === category
      )
    }
    
    return NextResponse.json({
      projects: filteredProjects,
      skills: portfolioData.skills,
      experiences: portfolioData.experiences,
      categories: ["All", "Full-Stack", "Frontend", "Backend"]
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    )
  }
}