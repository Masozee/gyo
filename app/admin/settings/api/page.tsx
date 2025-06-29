"use client"

import * as React from "react"
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/hooks/use-settings"

export default function APISettingsPage() {
  const { toast } = useToast()
  const { settings, loading, error, updateSettings, getSetting, getSettingAsBoolean } = useSettings('api')
  
  // Google Analytics
  const [gaEnabled, setGaEnabled] = React.useState(false)
  const [gaTrackingId, setGaTrackingId] = React.useState("")
  const [gaShowPassword, setGaShowPassword] = React.useState(false)

  // Google Search Console
  const [gscEnabled, setGscEnabled] = React.useState(false)
  const [gscSiteUrl, setGscSiteUrl] = React.useState("")
  const [gscVerificationCode, setGscVerificationCode] = React.useState("")

  // Google Maps
  const [gmapsEnabled, setGmapsEnabled] = React.useState(false)
  const [gmapsApiKey, setGmapsApiKey] = React.useState("")
  const [gmapsShowPassword, setGmapsShowPassword] = React.useState(false)

  // Meta (Facebook)
  const [metaEnabled, setMetaEnabled] = React.useState(false)
  const [metaAppId, setMetaAppId] = React.useState("")
  const [metaAppSecret, setMetaAppSecret] = React.useState("")
  const [metaShowPassword, setMetaShowPassword] = React.useState(false)
  const [metaPixelId, setMetaPixelId] = React.useState("")

  // Connection status (mock)
  const [connectionStatus, setConnectionStatus] = React.useState({
    google: "disconnected",
    meta: "disconnected"
  })
  const [saving, setSaving] = React.useState(false)

  // Load settings when they're available
  React.useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setGaEnabled(getSettingAsBoolean('google_analytics_enabled', false))
      setGaTrackingId(getSetting('google_analytics_id', ''))
      setGscEnabled(getSettingAsBoolean('google_search_console_enabled', false))
      setGscSiteUrl(getSetting('google_search_console_url', ''))
      setGscVerificationCode(getSetting('google_search_console_verification', ''))
      setGmapsEnabled(getSettingAsBoolean('google_maps_enabled', false))
      setGmapsApiKey(getSetting('google_maps_api_key', ''))
      setMetaEnabled(getSettingAsBoolean('meta_enabled', false))
      setMetaAppId(getSetting('meta_app_id', ''))
      setMetaAppSecret(getSetting('meta_app_secret', ''))
      setMetaPixelId(getSetting('meta_pixel_id', ''))
      
      // Update connection status based on whether API keys are configured
      setConnectionStatus({
        google: (gaTrackingId || gmapsApiKey) ? "connected" : "disconnected",
        meta: (metaAppId && metaAppSecret) ? "connected" : "disconnected"
      })
    }
  }, [settings, loading, getSetting, getSettingAsBoolean])

  const handleSave = async () => {
    setSaving(true)
    try {
      const settingsToUpdate = {
        google_analytics_enabled: { value: gaEnabled.toString(), type: 'boolean', group: 'api', label: 'Google Analytics Enabled', description: 'Enable Google Analytics tracking' },
        google_analytics_id: { value: gaTrackingId, type: 'password', group: 'api', label: 'Google Analytics ID', description: 'Your Google Analytics tracking ID' },
        google_search_console_enabled: { value: gscEnabled.toString(), type: 'boolean', group: 'api', label: 'Google Search Console Enabled', description: 'Enable Google Search Console integration' },
        google_search_console_url: { value: gscSiteUrl, type: 'url', group: 'api', label: 'Google Search Console Site URL', description: 'Your verified site URL in Google Search Console' },
        google_search_console_verification: { value: gscVerificationCode, type: 'textarea', group: 'api', label: 'Google Search Console Verification', description: 'HTML verification code from Google Search Console' },
        google_maps_enabled: { value: gmapsEnabled.toString(), type: 'boolean', group: 'api', label: 'Google Maps Enabled', description: 'Enable Google Maps integration' },
        google_maps_api_key: { value: gmapsApiKey, type: 'password', group: 'api', label: 'Google Maps API Key', description: 'Your Google Maps API key' },
        meta_enabled: { value: metaEnabled.toString(), type: 'boolean', group: 'api', label: 'Meta Integration Enabled', description: 'Enable Facebook/Meta integrations' },
        meta_app_id: { value: metaAppId, type: 'text', group: 'api', label: 'Meta App ID', description: 'Your Facebook/Meta App ID' },
        meta_app_secret: { value: metaAppSecret, type: 'password', group: 'api', label: 'Meta App Secret', description: 'Your Facebook/Meta App Secret' },
        meta_pixel_id: { value: metaPixelId, type: 'text', group: 'api', label: 'Meta Pixel ID', description: 'Your Facebook Pixel ID' }
      }
      
      const success = await updateSettings(settingsToUpdate)
      if (success) {
        toast({
          title: "Settings saved",
          description: "API settings have been updated successfully.",
        })
        
        // Update connection status
        setConnectionStatus({
          google: (gaTrackingId || gmapsApiKey) ? "connected" : "disconnected",
          meta: (metaAppId && metaAppSecret) ? "connected" : "disconnected"
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save API settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = (service: string) => {
    console.log(`Testing ${service} connection...`)
    // Mock connection test
    setConnectionStatus(prev => ({
      ...prev,
      [service]: "connected"
    }))
    
    toast({
      title: "Connection test",
      description: `${service} connection test completed.`,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">API Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure third-party API integrations and services
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
          {/* Google Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Services</CardTitle>
                  <CardDescription>
                    Configure Google Analytics, Search Console, and Maps
                  </CardDescription>
                </div>
                <Badge 
                  variant={connectionStatus.google === "connected" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {connectionStatus.google === "connected" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {connectionStatus.google}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Analytics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gaEnabled">Google Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Track website traffic and user behavior
                    </p>
                  </div>
                  <Switch
                    id="gaEnabled"
                    checked={gaEnabled}
                    onCheckedChange={setGaEnabled}
                  />
                </div>

                {gaEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="gaTrackingId">Tracking ID / Measurement ID</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="gaTrackingId"
                          type={gaShowPassword ? "text" : "password"}
                          value={gaTrackingId}
                          onChange={(e) => setGaTrackingId(e.target.value)}
                          placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGaShowPassword(!gaShowPassword)}
                        >
                          {gaShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Google Search Console */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gscEnabled">Google Search Console</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor search performance and indexing
                    </p>
                  </div>
                  <Switch
                    id="gscEnabled"
                    checked={gscEnabled}
                    onCheckedChange={setGscEnabled}
                  />
                </div>

                {gscEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="gscSiteUrl">Site URL</Label>
                      <Input
                        id="gscSiteUrl"
                        type="url"
                        value={gscSiteUrl}
                        onChange={(e) => setGscSiteUrl(e.target.value)}
                        placeholder="https://yoursite.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gscVerificationCode">HTML Verification Code</Label>
                      <Textarea
                        id="gscVerificationCode"
                        value={gscVerificationCode}
                        onChange={(e) => setGscVerificationCode(e.target.value)}
                        placeholder="<meta name='google-site-verification' content='...' />"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Google Maps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gmapsEnabled">Google Maps</Label>
                    <p className="text-sm text-muted-foreground">
                      Embed maps and location services
                    </p>
                  </div>
                  <Switch
                    id="gmapsEnabled"
                    checked={gmapsEnabled}
                    onCheckedChange={setGmapsEnabled}
                  />
                </div>

                {gmapsEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="gmapsApiKey">Maps API Key</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="gmapsApiKey"
                          type={gmapsShowPassword ? "text" : "password"}
                          value={gmapsApiKey}
                          onChange={(e) => setGmapsApiKey(e.target.value)}
                          placeholder="AIzaSyC..."
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGmapsShowPassword(!gmapsShowPassword)}
                        >
                          {gmapsShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testConnection("google")}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meta (Facebook) Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meta (Facebook) Services</CardTitle>
                  <CardDescription>
                    Configure Facebook/Meta integrations and Pixel tracking
                  </CardDescription>
                </div>
                <Badge 
                  variant={connectionStatus.meta === "connected" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {connectionStatus.meta === "connected" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {connectionStatus.meta}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="metaEnabled">Enable Meta Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Connect with Facebook and Instagram services
                  </p>
                </div>
                <Switch
                  id="metaEnabled"
                  checked={metaEnabled}
                  onCheckedChange={setMetaEnabled}
                />
              </div>

              {metaEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="metaAppId">App ID</Label>
                    <Input
                      id="metaAppId"
                      value={metaAppId}
                      onChange={(e) => setMetaAppId(e.target.value)}
                      placeholder="1234567890123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaAppSecret">App Secret</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="metaAppSecret"
                        type={metaShowPassword ? "text" : "password"}
                        value={metaAppSecret}
                        onChange={(e) => setMetaAppSecret(e.target.value)}
                        placeholder="abcdef1234567890abcdef1234567890"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setMetaShowPassword(!metaShowPassword)}
                      >
                        {metaShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaPixelId">Facebook Pixel ID</Label>
                    <Input
                      id="metaPixelId"
                      value={metaPixelId}
                      onChange={(e) => setMetaPixelId(e.target.value)}
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testConnection("meta")}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Required .env configuration for API integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# Google Services
GOOGLE_ANALYTICS_ID=${gaTrackingId || 'G-XXXXXXXXXX'}
GOOGLE_SEARCH_CONSOLE_VERIFICATION=${gscVerificationCode ? 'your-verification-code' : 'your-verification-code'}
GOOGLE_MAPS_API_KEY=${gmapsApiKey || 'AIzaSyC...'}

# Meta/Facebook Services
META_APP_ID=${metaAppId || '1234567890123456'}
META_APP_SECRET=${metaAppSecret || 'your-app-secret'}
META_PIXEL_ID=${metaPixelId || '123456789012345'}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}