"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

const publicRoutes = ["/", "/about", "/portfolio", "/blog", "/privacy", "/terms"]

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Show portfolio navbar only on public routes
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith("/blog/") ||
                        pathname === "/login" ||
                        pathname === "/register"
  
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
                       pathname.startsWith("/logout")
  
  if (!isPublicRoute || isAdminRoute) {
    return null
  }
  
  return <Navbar />
}