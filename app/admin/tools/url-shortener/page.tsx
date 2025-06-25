"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Link2,
  Copy,
  ExternalLink,
  BarChart3,
  QrCode,
  Trash2,
  Edit,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

interface ShortenedUrl {
  id: number
  originalUrl: string
  shortCode: string
  customAlias?: string
  clicks: number
  createdAt: string
  description?: string
}

export default function UrlShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/tools/urls')
      if (response.ok) {
        const data = await response.json()
        setShortenedUrls(data)
      }
    } catch (error) {
      console.error('Error fetching URLs:', error)
      toast.error('Failed to load URLs')
    }
  }

  const handleShortenUrl = async () => {
    if (!originalUrl.trim()) {
      toast.error("Please enter a URL to shorten")
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/tools/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl,
          customAlias: customAlias || undefined,
          description: description || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to shorten URL')
      }

      const newUrl = await response.json()
      setShortenedUrls(prev => [newUrl, ...prev])
      setOriginalUrl("")
      setCustomAlias("")
      setDescription("")
      toast.success("URL shortened successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to shorten URL")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("Copied to clipboard!")
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/tools/urls/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete URL')
      }

      setShortenedUrls(prev => prev.filter(url => url.id !== id))
      toast.success("URL deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete URL")
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">URL Shortener</h1>
        <p className="text-gray-600 mt-2">
          Create short URLs and track their performance with detailed analytics
        </p>
      </div>

      {/* URL Shortener Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Shorten URL
          </CardTitle>
          <CardDescription>
            Enter a long URL to create a shortened version with optional custom alias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="original-url">Original URL *</Label>
            <Input
              id="original-url"
              placeholder="https://example.com/very/long/url/path"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-alias">Custom Alias (optional)</Label>
              <Input
                id="custom-alias"
                placeholder="my-custom-alias"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleShortenUrl} disabled={isLoading} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? "Shortening..." : "Shorten URL"}
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total URLs</p>
                <p className="text-2xl font-bold">{shortenedUrls.length}</p>
              </div>
              <Link2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Clicks</p>
                <p className="text-2xl font-bold">
                  {shortenedUrls.length > 0 
                    ? Math.round(shortenedUrls.reduce((sum, url) => sum + url.clicks, 0) / shortenedUrls.length)
                    : 0
                  }
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{shortenedUrls.length}</p>
              </div>
              <Link2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* URL List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Shortened URLs</CardTitle>
          <CardDescription>
            Manage and track all your shortened URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortenedUrls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm truncate max-w-xs">
                          {url.originalUrl}
                        </div>
                        {url.description && (
                          <div className="text-xs text-gray-500">{url.description}</div>
                        )}
                        {url.customAlias && (
                          <Badge variant="secondary" className="text-xs">
                            {url.customAlias}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {`${window.location.origin}/s/${url.shortCode}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(`${window.location.origin}/s/${url.shortCode}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {url.clicks} clicks
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`${window.location.origin}/s/${url.shortCode}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("QR code generation coming soon!")}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("Analytics coming soon!")}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(url.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {shortenedUrls.length === 0 && (
            <div className="text-center py-8">
              <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No URLs yet</h3>
              <p className="text-gray-600">
                Create your first shortened URL using the form above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}