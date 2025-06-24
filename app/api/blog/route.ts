import { NextRequest, NextResponse } from "next/server"

// Mock blog data - In a real app, this would come from a database
const blogData = {
  posts: [
    {
      id: 1,
      title: "Building Scalable Django APIs with DRF",
      excerpt: "Learn how to create robust and scalable REST APIs using Django REST Framework with best practices for authentication, serialization, and performance optimization.",
      content: "In this comprehensive guide, we'll explore how to build production-ready APIs using Django REST Framework...",
      category: "Django",
      tags: ["Django", "Python", "REST API", "Backend"],
      publishedDate: "2024-06-15",
      readTime: "8 min read",
      featured: true,
      slug: "building-scalable-django-apis-with-drf",
      image: "/blog/django-apis.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 2,
      title: "Next.js 14 App Router: Complete Guide",
      excerpt: "Dive deep into Next.js 14's App Router, exploring server components, streaming, and the new paradigms for building modern React applications.",
      content: "Next.js 14 introduces significant improvements to the App Router, making it easier than ever to build performant React applications...",
      category: "Next.js",
      tags: ["Next.js", "React", "TypeScript", "Frontend"],
      publishedDate: "2024-06-10",
      readTime: "12 min read",
      featured: true,
      slug: "nextjs-14-app-router-complete-guide",
      image: "/blog/nextjs-14.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 3,
      title: "TypeScript Best Practices for Large Applications",
      excerpt: "Discover essential TypeScript patterns and practices that help maintain code quality and developer productivity in enterprise-level applications.",
      content: "As applications grow in size and complexity, maintaining code quality becomes increasingly challenging...",
      category: "TypeScript",
      tags: ["TypeScript", "JavaScript", "Best Practices", "Architecture"],
      publishedDate: "2024-06-05",
      readTime: "10 min read",
      featured: false,
      slug: "typescript-best-practices-large-applications",
      image: "/blog/typescript-practices.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 4,
      title: "Modern CSS Grid Layouts for Dashboard Design",
      excerpt: "Master CSS Grid to create responsive and flexible dashboard layouts that adapt beautifully to any screen size and content structure.",
      content: "Dashboard design requires careful consideration of layout, responsiveness, and user experience...",
      category: "CSS",
      tags: ["CSS", "Grid", "Design", "UI/UX"],
      publishedDate: "2024-05-28",
      readTime: "6 min read",
      featured: false,
      slug: "modern-css-grid-layouts-dashboard-design",
      image: "/blog/css-grid.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 5,
      title: "Database Optimization Strategies for Django",
      excerpt: "Learn advanced database optimization techniques including query optimization, indexing strategies, and connection pooling to improve your Django application performance.",
      content: "Database performance is crucial for any web application's success. In this article, we'll explore various optimization strategies...",
      category: "Database",
      tags: ["Django", "PostgreSQL", "Optimization", "Performance"],
      publishedDate: "2024-05-20",
      readTime: "15 min read",
      featured: false,
      slug: "database-optimization-strategies-django",
      image: "/blog/database-optimization.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 6,
      title: "React Server Components in Next.js",
      excerpt: "Understand React Server Components and how they revolutionize the way we build React applications with improved performance and developer experience.",
      content: "React Server Components represent a paradigm shift in how we think about React applications...",
      category: "React",
      tags: ["React", "Next.js", "Server Components", "Performance"],
      publishedDate: "2024-05-15",
      readTime: "9 min read",
      featured: false,
      slug: "react-server-components-nextjs",
      image: "/blog/react-server-components.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 7,
      title: "Building a Design System with Tailwind CSS",
      excerpt: "Create a comprehensive design system using Tailwind CSS that promotes consistency, scalability, and maintainability across your projects.",
      content: "A well-designed design system is the foundation of any successful product. Learn how to build one with Tailwind CSS...",
      category: "Design",
      tags: ["Tailwind CSS", "Design System", "UI/UX", "Frontend"],
      publishedDate: "2024-05-10",
      readTime: "11 min read",
      featured: false,
      slug: "building-design-system-tailwind-css",
      image: "/blog/design-system.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    },
    {
      id: 8,
      title: "Authentication and Authorization in Django",
      excerpt: "Implement secure authentication and authorization systems in Django applications with JWT tokens, permissions, and role-based access control.",
      content: "Security is paramount in web applications. This guide covers everything you need to know about implementing robust authentication...",
      category: "Security",
      tags: ["Django", "Authentication", "Security", "JWT"],
      publishedDate: "2024-05-05",
      readTime: "13 min read",
      featured: false,
      slug: "authentication-authorization-django",
      image: "/blog/django-auth.jpg",
      author: {
        name: "Developer",
        avatar: "/avatars/developer.jpg"
      }
    }
  ],
  categories: ["All", "Django", "Next.js", "TypeScript", "CSS", "Database", "React", "Design", "Security"]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const search = searchParams.get('search')
    
    let filteredPosts = [...blogData.posts]
    
    // Filter by category
    if (category && category !== 'All') {
      filteredPosts = filteredPosts.filter(post => 
        post.category === category
      )
    }
    
    // Filter by featured
    if (featured === 'true') {
      filteredPosts = filteredPosts.filter(post => post.featured)
    }
    
    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // Sort by date (newest first)
    filteredPosts.sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    )
    
    // Apply limit
    if (limit) {
      filteredPosts = filteredPosts.slice(0, parseInt(limit))
    }
    
    return NextResponse.json({
      posts: filteredPosts,
      categories: blogData.categories,
      total: filteredPosts.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blog data" },
      { status: 500 }
    )
  }
}

// Get single blog post by slug
export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()
    
    const post = blogData.posts.find(p => p.slug === slug)
    
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}