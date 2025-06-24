"use client"

import * as React from "react"
import { Save, Upload, Eye, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function BrandingSettingsPage() {
  const [logoUrl, setLogoUrl] = React.useState("")
  const [faviconUrl, setFaviconUrl] = React.useState("")
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = React.useState("#64748b")
  const [accentColor, setAccentColor] = React.useState("#f59e0b")

  const handleSave = () => {
    console.log("Saving branding settings...")
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle file upload - convert to base64 or upload to storage
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFaviconUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Branding & Logo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your brand identity and visual appearance
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Logo Configuration</CardTitle>
              <CardDescription>
                Upload and manage your site logos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Logo */}
              <div className="space-y-4">
                <Label>Main Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center">
                        No logo<br />uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="sr-only"
                          />
                        </label>
                      </Button>
                      {logoUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLogoUrl("")}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: SVG, PNG, or JPG. Max 2MB. Optimal size: 200x60px
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Favicon */}
              <div className="space-y-4">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                    {faviconUrl ? (
                      <img 
                        src={faviconUrl} 
                        alt="Favicon preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center">
                        No favicon
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Favicon
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFaviconUpload}
                            className="sr-only"
                          />
                        </label>
                      </Button>
                      {faviconUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setFaviconUrl("")}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: ICO, PNG. Size: 16x16, 32x32, or 48x48px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Define your brand colors and theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded-md border border-input cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-10 rounded-md border border-input cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="accentColor"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 rounded-md border border-input cursor-pointer"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="space-y-4">
                <Label>Color Preview</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div 
                      className="h-20 rounded-lg border"
                      style={{ backgroundColor: primaryColor }}
                    ></div>
                    <p className="text-xs text-center text-muted-foreground">Primary</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="h-20 rounded-lg border"
                      style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <p className="text-xs text-center text-muted-foreground">Secondary</p>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="h-20 rounded-lg border"
                      style={{ backgroundColor: accentColor }}
                    ></div>
                    <p className="text-xs text-center text-muted-foreground">Accent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines</CardTitle>
              <CardDescription>
                Best practices for your brand assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Logo Usage</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use high-resolution images for crisp display on all devices</li>
                    <li>Ensure good contrast against background colors</li>
                    <li>Maintain aspect ratio when resizing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Color Guidelines</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Primary color should be used for main CTAs and highlights</li>
                    <li>Secondary color for supporting elements and text</li>
                    <li>Accent color for special highlights and notifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Required .env configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
{`# Branding Configuration
NEXT_PUBLIC_SITE_LOGO_URL=${logoUrl ? (logoUrl.startsWith('data:') ? 'data:image/...base64-encoded-data...' : logoUrl) : 'your-logo-url'}
NEXT_PUBLIC_SITE_FAVICON_URL=${faviconUrl ? (faviconUrl.startsWith('data:') ? 'data:image/...base64-encoded-data...' : faviconUrl) : 'your-favicon-url'}
NEXT_PUBLIC_PRIMARY_COLOR=${primaryColor}
NEXT_PUBLIC_SECONDARY_COLOR=${secondaryColor}
NEXT_PUBLIC_ACCENT_COLOR=${accentColor}`}
                </pre>
              </div>
              {(logoUrl?.startsWith('data:') || faviconUrl?.startsWith('data:')) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> When using uploaded images, the actual environment variables will contain base64-encoded data. 
                    For production, consider uploading images to a CDN or cloud storage service and use those URLs instead.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}