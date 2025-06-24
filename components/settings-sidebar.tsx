"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  Palette,
  Globe,
  Github,
  Mail,
  FileText,
  Shield,
  Database,
  Zap,
  User,
} from "lucide-react"

import { cn } from "@/lib/utils"

const settingsNavigation = [
  {
    title: "General",
    icon: Settings,
    href: "/admin/settings/general",
    description: "Basic site settings and preferences",
  },
  {
    title: "Branding & Logo",
    icon: Palette,
    href: "/admin/settings/branding",
    description: "Logo, colors, and visual identity",
  },
  {
    title: "API Integrations",
    icon: Zap,
    href: "/admin/settings/api",
    description: "Google, Meta, and third-party APIs",
  },
  {
    title: "GitHub OAuth",
    icon: Github,
    href: "/admin/settings/github",
    description: "GitHub authentication and integration",
  },
  {
    title: "Email Services",
    icon: Mail,
    href: "/admin/settings/email",
    description: "SMTP, email providers, and notifications",
  },
  {
    title: "About Page",
    icon: User,
    href: "/admin/settings/about",
    description: "Personal information and biography",
  },
  {
    title: "Security",
    icon: Shield,
    href: "/admin/settings/security",
    description: "Authentication and security settings",
  },
  {
    title: "Database",
    icon: Database,
    href: "/admin/settings/database",
    description: "Database configuration and backups",
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-72 bg-background border-r">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your application configuration
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-4">
        <nav className="space-y-2">
          {settingsNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-primary hover:text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className={cn(
                    "text-xs mt-1",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Configuration Status</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Database Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Email Setup Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>OAuth Setup Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}