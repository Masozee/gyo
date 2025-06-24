"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

const publicRoutes = ["/", "/about", "/portfolio", "/blog", "/privacy", "/terms"]

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Show footer only on public routes
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith("/blog/")
  
  // Don't show on any admin routes
  const isAdminRoute = pathname.startsWith("/admin/") ||
                       pathname.startsWith("/dashboard") ||
                       pathname.startsWith("/projects") ||
                       pathname.startsWith("/tasks") ||
                       pathname.startsWith("/clients") ||
                       pathname.startsWith("/schedule") ||
                       pathname.startsWith("/analytics") ||
                       pathname.startsWith("/expenses") ||
                       pathname.startsWith("/invoices") ||
                       pathname.startsWith("/docs") ||
                       pathname.startsWith("/cms/") ||
                       pathname.startsWith("/profile") ||
                       pathname.startsWith("/logout") ||
                       pathname.startsWith("/login") ||
                       pathname.startsWith("/register")
  
  if (!isPublicRoute || isAdminRoute) {
    return null
  }
  
  return <Footer />
}