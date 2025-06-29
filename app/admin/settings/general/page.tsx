"use client"

import * as React from "react"
import { Save, RefreshCw, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/hooks/use-settings"

export default function GeneralSettingsPage() {
  const { toast } = useToast()
  const { settings, loading, error, updateSettings, getSetting, getSettingAsBoolean } = useSettings('general')
  
  const [siteName, setSiteName] = React.useState("")
  const [siteDescription, setSiteDescription] = React.useState("")
  const [siteUrl, setSiteUrl] = React.useState("")
  const [timezone, setTimezone] = React.useState("")
  const [language, setLanguage] = React.useState("")
  const [maintenanceMode, setMaintenanceMode] = React.useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true)
  const [cookieConsent, setCookieConsent] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Load settings when they're available
  React.useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setSiteName(getSetting('site_name', 'Developer Portfolio'))
      setSiteDescription(getSetting('site_description', 'Full-stack developer specializing in Django, Next.js, TypeScript, and UI/UX design'))
      setSiteUrl(getSetting('site_url', 'https://yoursite.com'))
      setTimezone(getSetting('timezone', 'UTC'))
      setLanguage(getSetting('language', 'en'))
      setMaintenanceMode(getSettingAsBoolean('maintenance_mode', false))
      setAnalyticsEnabled(getSettingAsBoolean('analytics_enabled', true))
      setCookieConsent(getSettingAsBoolean('cookie_consent', true))
    }
  }, [settings, loading, getSetting, getSettingAsBoolean])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settingsToUpdate = {
        site_name: { value: siteName, type: 'text', group: 'general', label: 'Site Name', description: 'The name of your portfolio website' },
        site_description: { value: siteDescription, type: 'textarea', group: 'general', label: 'Site Description', description: 'Brief description of your site' },
        site_url: { value: siteUrl, type: 'url', group: 'general', label: 'Site URL', description: 'The main URL of your website' },
        timezone: { value: timezone, type: 'select', group: 'general', label: 'Timezone', description: 'Default timezone for the application' },
        language: { value: language, type: 'select', group: 'general', label: 'Language', description: 'Default language for the application' },
        maintenance_mode: { value: maintenanceMode.toString(), type: 'boolean', group: 'general', label: 'Maintenance Mode', description: 'Enable maintenance mode to show a coming soon page' },
        analytics_enabled: { value: analyticsEnabled.toString(), type: 'boolean', group: 'general', label: 'Analytics Tracking', description: 'Enable Google Analytics and other tracking services' },
        cookie_consent: { value: cookieConsent.toString(), type: 'boolean', group: 'general', label: 'Cookie Consent', description: 'Show cookie consent banner for GDPR compliance' }
      }
      
      const success = await updateSettings(settingsToUpdate)
      if (success) {
        toast({
          title: "Settings saved",
          description: "General settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">General Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Basic configuration for your portfolio website
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic information about your portfolio website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Your site name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Brief description of your site"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <CardTitle>Localization</CardTitle>
              <CardDescription>
                Language and timezone settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Features */}
          <Card>
            <CardHeader>
              <CardTitle>Site Features</CardTitle>
              <CardDescription>
                Enable or disable various site features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to show a coming soon page
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable Google Analytics and other tracking services
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cookies">Cookie Consent</Label>
                  <p className="text-sm text-muted-foreground">
                    Show cookie consent banner for GDPR compliance
                  </p>
                </div>
                <Switch
                  id="cookies"
                  checked={cookieConsent}
                  onCheckedChange={setCookieConsent}
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Configuration Notice */}
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Settings are dynamically stored in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  These settings are stored in your database and can be changed dynamically without 
                  redeploying your application. Changes take effect immediately.
                </p>
                {error && (
                  <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                    Error loading settings: {error}
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading settings...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}