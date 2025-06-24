"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function FontProvider() {
  const pathname = usePathname()
  
  useEffect(() => {
    const isAdminRoute = pathname.startsWith('/admin/') ||
                         pathname.startsWith('/login') ||
                         pathname.startsWith('/register') ||
                         pathname.startsWith('/logout')
    
    const body = document.body
    
    if (isAdminRoute) {
      // Use Geist for admin routes
      body.classList.remove('font-mono')
      body.classList.add('font-sans')
    } else {
      // Use Fira Code for public routes
      body.classList.remove('font-sans')
      body.classList.add('font-mono')
    }
  }, [pathname])
  
  return null
}