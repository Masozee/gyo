"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Youtube,
  Download,
  Play,
  Clock,
  Eye,
  User,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface YouTubeVideoInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  channelName: string
  viewCount: string
  uploadDate: string
  formats: YouTubeFormat[]
}

interface YouTubeFormat {
  quality: string
  format: string
  url: string
  filesize?: string
  type: 'video' | 'audio'
}

export default function YouTubeDownloaderPage() {
  const { user, isAuthenticated } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<YouTubeFormat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Get auth token from localStorage
  const getAuthToken = () => {
    const session = localStorage.getItem('session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        return sessionData.accessToken
      } catch (error) {
        console.error('Error parsing session:', error)
      }
    }
    return null
  }

  const handleGetVideoInfo = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to use YouTube downloader")
      return
    }
    
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL")
      return
    }

    try {
      setIsLoading(true)
      
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch('/api/tools/youtube/info', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: youtubeUrl }),
      })

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get video information')
      }

      const data = await response.json()
      setVideoInfo(data.videoInfo)
      setSelectedFormat(null)
      toast.success("Video information loaded successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to get video information")
      setVideoInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!isAuthenticated || !videoInfo || !selectedFormat) {
      toast.error("Please select a format to download")
      return
    }

    try {
      setIsDownloading(true)
      
      // Extract itag from the selectedFormat URL
      const urlParams = new URLSearchParams(selectedFormat.url.split('?')[1])
      const itag = urlParams.get('itag')
      
      if (!itag) {
        toast.error("Invalid format selected")
        return
      }
      
      const token = getAuthToken()
      
      // Create download URL with authentication
      const streamUrl = new URL('/api/tools/youtube/stream', window.location.origin)
      streamUrl.searchParams.set('url', youtubeUrl)
      streamUrl.searchParams.set('itag', itag)
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = streamUrl.toString()
      
      // Add auth header using fetch and blob approach
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch(streamUrl.toString(), {
        method: 'GET',
        headers,
      })

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to start download')
      }

      // Get the blob and create download
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `video.${selectedFormat.format}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Trigger download
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl)
      
      toast.success("Download started successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to start download")
    } finally {
      setIsDownloading(false)
    }
  }

  const clearVideoInfo = () => {
    setVideoInfo(null)
    setSelectedFormat(null)
    setYoutubeUrl("")
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Youtube className="h-8 w-8 text-red-600" />
          YouTube Downloader
        </h1>
        <p className="text-gray-600 mt-2">
          Download YouTube videos and audio in various formats and qualities. 
          Please respect copyright and only download content you have permission to use.
        </p>
      </div>

      {/* Legal Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Legal Notice</p>
              <p className="mt-1">
                This tool is for educational purposes and personal use only. Please respect YouTube's Terms of Service 
                and copyright laws. Only download content you own or have explicit permission to download.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter YouTube URL</CardTitle>
          <CardDescription>
            Paste any YouTube video URL to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGetVideoInfo()}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleGetVideoInfo} 
                disabled={isLoading || !youtubeUrl.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Get Info
                  </>
                )}
              </Button>
              {videoInfo && (
                <Button variant="outline" onClick={clearVideoInfo}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Information */}
      {videoInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Video Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thumbnail */}
              <div className="lg:col-span-1">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
              
              {/* Video Details */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {videoInfo.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {videoInfo.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{videoInfo.channelName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{videoInfo.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>{videoInfo.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{videoInfo.uploadDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      {videoInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Download Options</CardTitle>
            <CardDescription>
              Select your preferred format and quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Formats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Play className="h-4 w-4" />
                Video Formats
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {videoInfo.formats
                  .filter(format => format.type === 'video')
                  .map((format, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all ${
                        selectedFormat === format 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <Badge variant={format.quality === '1080p' ? 'default' : 'secondary'}>
                            {format.quality}
                          </Badge>
                          <p className="text-sm font-medium">{format.format}</p>
                          <p className="text-xs text-gray-500">{format.filesize}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            <Separator />

            {/* Audio Formats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Audio Only
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {videoInfo.formats
                  .filter(format => format.type === 'audio')
                  .map((format, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all ${
                        selectedFormat === format 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <Badge variant="outline">
                            {format.quality}
                          </Badge>
                          <p className="text-sm font-medium">{format.format}</p>
                          <p className="text-xs text-gray-500">{format.filesize}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Download Button */}
            {selectedFormat && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download {selectedFormat.quality} {selectedFormat.format}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Tips for Best Results</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Higher quality downloads take longer and use more bandwidth</li>
                <li>Audio-only downloads are smaller and faster</li>
                <li>Some videos may have limited format availability</li>
                <li>Downloads are processed directly through our secure servers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}