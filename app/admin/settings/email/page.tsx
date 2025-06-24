"use client"

import * as React from "react"
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, Mail, Send } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EmailSettingsPage() {
  const [emailProvider, setEmailProvider] = React.useState("resend")
  const [emailEnabled, setEmailEnabled] = React.useState(true)
  
  // SMTP Settings
  const [smtpHost, setSmtpHost] = React.useState("")
  const [smtpPort, setSmtpPort] = React.useState("587")
  const [smtpUser, setSmtpUser] = React.useState("")
  const [smtpPassword, setSmtpPassword] = React.useState("")
  const [smtpEncryption, setSmtpEncryption] = React.useState("tls")
  const [showSmtpPassword, setShowSmtpPassword] = React.useState(false)

  // SendGrid Settings
  const [sendgridApiKey, setSendgridApiKey] = React.useState("")
  const [showSendgridKey, setShowSendgridKey] = React.useState(false)

  // Mailgun Settings
  const [mailgunApiKey, setMailgunApiKey] = React.useState("")
  const [mailgunDomain, setMailgunDomain] = React.useState("")
  const [showMailgunKey, setShowMailgunKey] = React.useState(false)

  // Resend Settings
  const [resendApiKey, setResendApiKey] = React.useState("re_3PZ25XXm_4ZEJzUoDqXif2v1ahSDsXDVQ")
  const [showResendKey, setShowResendKey] = React.useState(false)

  // Email Settings
  const [fromEmail, setFromEmail] = React.useState("mail@nurojilukmansyah.com")
  const [fromName, setFromName] = React.useState("Nuroji Lukmansyah")
  const [replyToEmail, setReplyToEmail] = React.useState("mail@nurojilukmansyah.com")
  
  // Notification Settings
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [adminEmail, setAdminEmail] = React.useState("mail@nurojilukmansyah.com")
  const [contactFormEnabled, setContactFormEnabled] = React.useState(true)
  const [newsletterEnabled, setNewsletterEnabled] = React.useState(false)

  const [connectionStatus, setConnectionStatus] = React.useState("connected")

  const handleSave = () => {
    console.log("Saving email settings...")
  }

  const testConnection = () => {
    console.log("Testing email connection...")
    // Mock connection test
    setConnectionStatus("connected")
  }

  const sendTestEmail = () => {
    console.log("Sending test email...")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Email Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure email providers and notification settings
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Service Status
                  </CardTitle>
                  <CardDescription>
                    Current status of your email configuration
                  </CardDescription>
                </div>
                <Badge 
                  variant={connectionStatus === "connected" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {connectionStatus === "connected" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {connectionStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testConnection}
                  disabled={!emailEnabled}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={sendTestEmail}
                  disabled={!emailEnabled || connectionStatus !== "connected"}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Provider Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Email Provider</CardTitle>
              <CardDescription>
                Choose and configure your email service provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailEnabled">Enable Email Services</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable email functionality for your application
                  </p>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              {emailEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="emailProvider">Email Provider</Label>
                    <Select value={emailProvider} onValueChange={setEmailProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP (Custom Server)</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="resend">Resend</SelectItem>
                        <SelectItem value="ses">Amazon SES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* SMTP Configuration */}
                  {emailProvider === "smtp" && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium">SMTP Configuration</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtpHost">SMTP Host</Label>
                          <Input
                            id="smtpHost"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtpPort">Port</Label>
                          <Select value={smtpPort} onValueChange={setSmtpPort}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="587">587 (TLS)</SelectItem>
                              <SelectItem value="465">465 (SSL)</SelectItem>
                              <SelectItem value="25">25 (No encryption)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpUser">Username</Label>
                        <Input
                          id="smtpUser"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">Password</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="smtpPassword"
                            type={showSmtpPassword ? "text" : "password"}
                            value={smtpPassword}
                            onChange={(e) => setSmtpPassword(e.target.value)}
                            placeholder="your-app-password"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                          >
                            {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpEncryption">Encryption</Label>
                        <Select value={smtpEncryption} onValueChange={setSmtpEncryption}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* SendGrid Configuration */}
                  {emailProvider === "sendgrid" && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium">SendGrid Configuration</h4>
                      <div className="space-y-2">
                        <Label htmlFor="sendgridApiKey">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="sendgridApiKey"
                            type={showSendgridKey ? "text" : "password"}
                            value={sendgridApiKey}
                            onChange={(e) => setSendgridApiKey(e.target.value)}
                            placeholder="SG.your-api-key"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowSendgridKey(!showSendgridKey)}
                          >
                            {showSendgridKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mailgun Configuration */}
                  {emailProvider === "mailgun" && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium">Mailgun Configuration</h4>
                      <div className="space-y-2">
                        <Label htmlFor="mailgunDomain">Domain</Label>
                        <Input
                          id="mailgunDomain"
                          value={mailgunDomain}
                          onChange={(e) => setMailgunDomain(e.target.value)}
                          placeholder="mg.yourdomain.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mailgunApiKey">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="mailgunApiKey"
                            type={showMailgunKey ? "text" : "password"}
                            value={mailgunApiKey}
                            onChange={(e) => setMailgunApiKey(e.target.value)}
                            placeholder="key-your-api-key"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowMailgunKey(!showMailgunKey)}
                          >
                            {showMailgunKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resend Configuration */}
                  {emailProvider === "resend" && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium">Resend Configuration</h4>
                      <div className="space-y-2">
                        <Label htmlFor="resendApiKey">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="resendApiKey"
                            type={showResendKey ? "text" : "password"}
                            value={resendApiKey}
                            onChange={(e) => setResendApiKey(e.target.value)}
                            placeholder="re_your-api-key"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowResendKey(!showResendKey)}
                          >
                            {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure sender information and email preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="noreply@yourdomain.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyToEmail">Reply-To Email</Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="hello@yourdomain.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email notifications and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificationsEnabled">Admin Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              {notificationsEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contactFormEnabled">Contact Form</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable contact form email delivery
                  </p>
                </div>
                <Switch
                  id="contactFormEnabled"
                  checked={contactFormEnabled}
                  onCheckedChange={setContactFormEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletterEnabled">Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable newsletter subscription functionality
                  </p>
                </div>
                <Switch
                  id="newsletterEnabled"
                  checked={newsletterEnabled}
                  onCheckedChange={setNewsletterEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Recommendations</CardTitle>
              <CardDescription>
                Choose the right email provider for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">SendGrid</h4>
                    <p className="text-muted-foreground text-xs mt-1">
                      Best for: High volume, reliable delivery, detailed analytics
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Resend</h4>
                    <p className="text-muted-foreground text-xs mt-1">
                      Best for: Developers, simple setup, modern API
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Mailgun</h4>
                    <p className="text-muted-foreground text-xs mt-1">
                      Best for: Transactional emails, powerful API
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">SMTP</h4>
                    <p className="text-muted-foreground text-xs mt-1">
                      Best for: Custom servers, Gmail, existing infrastructure
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Required .env configuration for email services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# Email Configuration
EMAIL_PROVIDER=${emailProvider}
EMAIL_FROM_NAME="${fromName || 'Your Name'}"
EMAIL_FROM_ADDRESS=${fromEmail || 'noreply@yourdomain.com'}
EMAIL_REPLY_TO=${replyToEmail || 'hello@yourdomain.com'}

# Provider-specific settings
${emailProvider === 'smtp' ? `SMTP_HOST=${smtpHost || 'smtp.gmail.com'}
SMTP_PORT=${smtpPort}
SMTP_USER=${smtpUser || 'your-email@gmail.com'}
SMTP_PASSWORD=${smtpPassword || 'your-app-password'}
SMTP_ENCRYPTION=${smtpEncryption}` : ''}${emailProvider === 'sendgrid' ? `SENDGRID_API_KEY=${sendgridApiKey || 'SG.your-api-key'}` : ''}${emailProvider === 'mailgun' ? `MAILGUN_API_KEY=${mailgunApiKey || 'key-your-api-key'}
MAILGUN_DOMAIN=${mailgunDomain || 'mg.yourdomain.com'}` : ''}${emailProvider === 'resend' ? `RESEND_API_KEY=${resendApiKey || 're_your-api-key'}` : ''}

# Admin Settings
ADMIN_EMAIL=${adminEmail || 'admin@yourdomain.com'}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}