"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Link2,
  QrCode,
  FileSignature,
  Calculator,
  Hash,
  Palette,
  Zap,
  Globe,
  FileText,
  Youtube,
  Bot,
} from "lucide-react"

import { cn } from "@/lib/utils"

const toolsNavigation = [
  {
    title: "CV Builder",
    icon: FileText,
    href: "/admin/tools/cv-builder",
    description: "Create professional CVs with templates",
  },
  {
    title: "URL Shortener",
    icon: Link2,
    href: "/admin/tools/url-shortener",
    description: "Create short URLs and track analytics",
  },
  {
    title: "QR Code Generator",
    icon: QrCode,
    href: "/admin/tools/qr-codes",
    description: "Generate QR codes for URLs, text, and more",
  },
  {
    title: "Document Signing",
    icon: FileSignature,
    href: "/admin/tools/document-signing",
    description: "Send documents for digital signatures",
  },
  {
    title: "YouTube Downloader",
    icon: Youtube,
    href: "/admin/tools/youtube-downloader",
    description: "Download YouTube videos and audio",
  },
  {
    title: "Chat with Gemini AI",
    icon: Bot,
    href: "/admin/tools/gemini-chat",
    description: "AI assistant for coding and writing",
  },
  {
    title: "Calculator",
    icon: Calculator,
    href: "/admin/tools/calculator",
    description: "Advanced calculator with project calculations",
  },
  {
    title: "Hash Generator",
    icon: Hash,
    href: "/admin/tools/hash-generator",
    description: "Generate MD5, SHA-1, SHA-256 hashes",
  },
  {
    title: "Color Palette",
    icon: Palette,
    href: "/admin/tools/color-palette",
    description: "Color picker and palette generator",
  },
  {
    title: "Password Generator",
    icon: Zap,
    href: "/admin/tools/password-generator",
    description: "Generate secure passwords",
  },
  {
    title: "Domain Checker",
    icon: Globe,
    href: "/admin/tools/domain-checker",
    description: "Check domain availability and WHOIS info",
  },
]

export function ToolsSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-72 bg-background border-r">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Tools</h2>
        <p className="text-sm text-muted-foreground">
          Productivity tools and utilities
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-4">
        <nav className="space-y-2">
          {toolsNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-green-500 hover:text-white",
                  isActive && "bg-green-500 text-white"
                )}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className={cn(
                    "text-xs mt-1",
                    isActive ? "text-white/80" : "text-muted-foreground"
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
          <p className="font-medium">Tools Status</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All Tools Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{toolsNavigation.length} Tools Loaded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}