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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Link2,
  Copy,
  ExternalLink,
  BarChart3,
  QrCode,
  Trash2,
  Edit,
  Plus,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Activity,
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

interface UrlAnalytics {
  url: ShortenedUrl
  totalClicks: number
  uniqueClicks: number
  clicksByDate: Array<{ date: string; clicks: number }>
  clicksByCountry: Array<{ country: string; clicks: number }>
  clicksByDevice: Array<{ device: string; clicks: number }>
  clicksByBrowser: Array<{ browser: string; clicks: number }>
  recentClicks: Array<{
    id: number
    ip?: string
    country?: string
    device?: string
    browser?: string
    referer?: string
    clickedAt: string
  }>
}

export default function UrlShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false)
  const [selectedUrlAnalytics, setSelectedUrlAnalytics] = useState<UrlAnalytics | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

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

  const handleViewAnalytics = async (id: number) => {
    try {
      setLoadingAnalytics(true)
      const response = await fetch(`/api/tools/urls/${id}/analytics`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const analytics = await response.json()
      setSelectedUrlAnalytics(analytics)
      setAnalyticsDialogOpen(true)
    } catch (error) {
      toast.error("Failed to load analytics")
    } finally {
      setLoadingAnalytics(false)
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
                          onClick={() => handleViewAnalytics(url.id)}
                          disabled={loadingAnalytics}
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

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>URL Analytics</DialogTitle>
            <DialogDescription>
              Detailed analytics for your shortened URL
            </DialogDescription>
          </DialogHeader>
          
          {selectedUrlAnalytics && (
            <div className="space-y-6">
              {/* URL Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      <span className="font-medium">Short URL:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {`${window.location.origin}/s/${selectedUrlAnalytics.url.shortCode}`}
                      </code>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Original URL:</strong> {selectedUrlAnalytics.url.originalUrl}
                    </div>
                    {selectedUrlAnalytics.url.description && (
                      <div className="text-sm text-gray-600">
                        <strong>Description:</strong> {selectedUrlAnalytics.url.description}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Total Clicks</span>
                    </div>
                    <div className="text-2xl font-bold">{selectedUrlAnalytics.totalClicks}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Unique Visitors</span>
                    </div>
                    <div className="text-2xl font-bold">{selectedUrlAnalytics.uniqueClicks}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Created</span>
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(selectedUrlAnalytics.url.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clicks by Date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clicks by Date (Last 30 days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUrlAnalytics.clicksByDate.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUrlAnalytics.clicksByDate.slice(0, 10).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(5, (item.clicks / Math.max(...selectedUrlAnalytics.clicksByDate.map(d => d.clicks))) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{item.clicks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No click data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Countries */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUrlAnalytics.clicksByCountry.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUrlAnalytics.clicksByCountry.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.country}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(5, (item.clicks / Math.max(...selectedUrlAnalytics.clicksByCountry.map(d => d.clicks))) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{item.clicks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No location data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Device Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Device Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUrlAnalytics.clicksByDevice.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUrlAnalytics.clicksByDevice.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {item.device.toLowerCase().includes('mobile') || item.device.toLowerCase().includes('tablet') ? (
                                <Smartphone className="h-4 w-4" />
                              ) : (
                                <Monitor className="h-4 w-4" />
                              )}
                              <span className="text-sm">{item.device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(5, (item.clicks / Math.max(...selectedUrlAnalytics.clicksByDevice.map(d => d.clicks))) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{item.clicks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No device data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Browsers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUrlAnalytics.clicksByBrowser.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUrlAnalytics.clicksByBrowser.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.browser}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(5, (item.clicks / Math.max(...selectedUrlAnalytics.clicksByBrowser.map(d => d.clicks))) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{item.clicks}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No browser data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Clicks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUrlAnalytics.recentClicks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Browser</TableHead>
                            <TableHead>Referrer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUrlAnalytics.recentClicks.slice(0, 20).map((click) => (
                            <TableRow key={click.id}>
                              <TableCell className="text-sm">
                                {new Date(click.clickedAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm">
                                {click.country || 'Unknown'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {click.device || 'Unknown'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {click.browser || 'Unknown'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {click.referer ? (
                                  <span className="truncate max-w-32" title={click.referer}>
                                    {click.referer}
                                  </span>
                                ) : (
                                  'Direct'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent clicks</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}