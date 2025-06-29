"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Link2,
  QrCode,
  FileSignature,
  Calculator,
  Hash,
  Palette,
  Zap,
  Globe,
  Search,
  ExternalLink,
  Youtube,
  Bot,
  FileText,
} from "lucide-react"

const tools = [
  {
    title: "CV Builder",
    description: "Create professional CVs with ATS-friendly and creative templates. Download as PDF instantly.",
    icon: FileText,
    href: "/admin/tools/cv-builder",
    color: "bg-indigo-500",
    features: ["ATS Templates", "Creative Designs", "PDF Download", "Multiple Formats"],
  },
  {
    title: "URL Shortener",
    description: "Create short URLs and track click analytics. Perfect for social media and marketing campaigns.",
    icon: Link2,
    href: "/admin/tools/url-shortener",
    color: "bg-blue-500",
    features: ["Custom aliases", "Click tracking", "QR codes", "Bulk shortening"],
  },
  {
    title: "QR Code Generator",
    description: "Generate QR codes for URLs, text, WiFi, contact info, and more with customizable styling.",
    icon: QrCode,
    href: "/admin/tools/qr-codes",
    color: "bg-green-500",
    features: ["Multiple formats", "Custom colors", "Logo embedding", "High resolution"],
  },
  {
    title: "Document Signing",
    description: "Send documents for digital signatures with tracking and legal compliance features.",
    icon: FileSignature,
    href: "/admin/tools/document-signing",
    color: "bg-purple-500",
    features: ["E-signatures", "Document tracking", "Legal compliance", "Email notifications"],
  },
  {
    title: "YouTube Downloader",
    description: "Download YouTube videos and audio in various formats and qualities with legal compliance.",
    icon: Youtube,
    href: "/admin/tools/youtube-downloader",
    color: "bg-red-600",
    features: ["Multiple formats", "Quality options", "Audio extraction", "Legal compliance"],
  },
  {
    title: "Chat with Gemini AI",
    description: "Have conversations with Google's advanced Gemini AI. Get help with coding, writing, analysis, and more.",
    icon: Bot,
    href: "/admin/tools/gemini-chat",
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
    features: ["Advanced AI chat", "Conversation history", "Code assistance", "Real-time responses"],
  },
  {
    title: "Calculator",
    description: "Advanced calculator with project cost calculations, time tracking, and financial planning.",
    icon: Calculator,
    href: "/admin/tools/calculator",
    color: "bg-orange-500",
    features: ["Basic operations", "Project calculations", "Currency conversion", "History"],
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and other hash types for security and verification.",
    icon: Hash,
    href: "/admin/tools/hash-generator",
    color: "bg-red-500",
    features: ["Multiple algorithms", "File hashing", "Text hashing", "Verification"],
  },
  {
    title: "Color Palette",
    description: "Advanced color picker with palette generation, accessibility checking, and export options.",
    icon: Palette,
    href: "/admin/tools/color-palette",
    color: "bg-pink-500",
    features: ["Color picker", "Palette generation", "Accessibility check", "Export formats"],
  },
  {
    title: "Password Generator",
    description: "Generate secure passwords with customizable length, complexity, and character sets.",
    icon: Zap,
    href: "/admin/tools/password-generator",
    color: "bg-yellow-500",
    features: ["Custom length", "Character sets", "Strength meter", "Bulk generation"],
  },
  {
    title: "Domain Checker",
    description: "Check domain availability, get WHOIS information, and monitor domain status.",
    icon: Globe,
    href: "/admin/tools/domain-checker",
    color: "bg-indigo-500",
    features: ["Availability check", "WHOIS lookup", "Bulk checking", "Suggestions"],
  },
]

export default function ToolsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tools & Utilities</h1>
          <p className="text-gray-600 mt-2">
            Powerful tools to boost your productivity and streamline your workflow
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card key={tool.href} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${tool.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(tool.href)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {tool.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={() => router.push(tool.href)}
                    className="w-full"
                    variant="outline"
                  >
                    Open Tool
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms to find the tool you're looking for.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Tools Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{tools.length}</div>
            <div className="text-sm text-gray-600">Total Tools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Free</div>
            <div className="text-sm text-gray-600">Usage</div>
          </div>
        </div>
      </div>
    </div>
  )
}