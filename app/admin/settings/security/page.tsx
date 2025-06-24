"use client"

import * as React from "react"
import { Save, Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function SecuritySettingsPage() {
  // Authentication Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false)
  const [passwordMinLength, setPasswordMinLength] = React.useState("8")
  const [passwordRequireSymbols, setPasswordRequireSymbols] = React.useState(true)
  const [passwordRequireNumbers, setPasswordRequireNumbers] = React.useState(true)
  const [passwordRequireUppercase, setPasswordRequireUppercase] = React.useState(true)
  const [sessionTimeout, setSessionTimeout] = React.useState("24")
  const [loginAttempts, setLoginAttempts] = React.useState("5")

  // API Security
  const [jwtSecret, setJwtSecret] = React.useState("")
  const [jwtExpiration, setJwtExpiration] = React.useState("7d")
  const [apiRateLimit, setApiRateLimit] = React.useState("100")
  const [apiRatePeriod, setApiRatePeriod] = React.useState("hour")
  const [corsEnabled, setCorsEnabled] = React.useState(true)
  const [corsOrigins, setCorsOrigins] = React.useState("")

  // Security Features
  const [httpsRedirect, setHttpsRedirect] = React.useState(true)
  const [securityHeaders, setSecurityHeaders] = React.useState(true)
  const [contentSecurityPolicy, setContentSecurityPolicy] = React.useState(true)
  const [bruteForceProtection, setBruteForceProtection] = React.useState(true)
  const [ipWhitelist, setIpWhitelist] = React.useState("")
  const [ipBlacklist, setIpBlacklist] = React.useState("")

  // Audit & Monitoring
  const [auditLogging, setAuditLogging] = React.useState(true)
  const [failedLoginAlerts, setFailedLoginAlerts] = React.useState(true)
  const [securityScanEnabled, setSecurityScanEnabled] = React.useState(false)
  const [vulnerabilityChecks, setVulnerabilityChecks] = React.useState(true)

  // Show/Hide States
  const [showJwtSecret, setShowJwtSecret] = React.useState(false)

  const handleSave = () => {
    console.log("Saving security settings...")
  }

  const generateJwtSecret = () => {
    // Generate a random JWT secret
    const secret = Array.from({ length: 64 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('')
    setJwtSecret(secret)
  }

  const runSecurityScan = () => {
    console.log("Running security scan...")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Security Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure authentication, authorization, and security policies
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Status
              </CardTitle>
              <CardDescription>
                Overall security configuration status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">HTTPS</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">2FA</span>
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"} className="flex items-center gap-1">
                    {twoFactorEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Rate Limiting</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Audit Logs</span>
                  <Badge variant={auditLogging ? "default" : "secondary"} className="flex items-center gap-1">
                    {auditLogging ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {auditLogging ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={runSecurityScan}>
                <Shield className="w-4 h-4 mr-2" />
                Run Security Scan
              </Button>
            </CardContent>
          </Card>

          {/* Authentication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure user authentication and password policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin users
                  </p>
                </div>
                <Switch
                  id="twoFactorEnabled"
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Password Policy</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={passwordMinLength}
                      onChange={(e) => setPasswordMinLength(e.target.value)}
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={loginAttempts}
                      onChange={(e) => setLoginAttempts(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireSymbols">Require Symbols</Label>
                    <Switch
                      id="passwordRequireSymbols"
                      checked={passwordRequireSymbols}
                      onCheckedChange={setPasswordRequireSymbols}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                    <Switch
                      id="passwordRequireNumbers"
                      checked={passwordRequireNumbers}
                      onCheckedChange={setPasswordRequireNumbers}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordRequireUppercase">Require Uppercase</Label>
                    <Switch
                      id="passwordRequireUppercase"
                      checked={passwordRequireUppercase}
                      onCheckedChange={setPasswordRequireUppercase}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    placeholder="24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Security */}
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>
                Configure API authentication and rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jwtSecret">JWT Secret Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="jwtSecret"
                    type={showJwtSecret ? "text" : "password"}
                    value={jwtSecret}
                    onChange={(e) => setJwtSecret(e.target.value)}
                    placeholder="Your JWT secret key"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowJwtSecret(!showJwtSecret)}
                  >
                    {showJwtSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateJwtSecret}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jwtExpiration">JWT Expiration</Label>
                  <Select value={jwtExpiration} onValueChange={setJwtExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">Rate Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={apiRateLimit}
                      onChange={(e) => setApiRateLimit(e.target.value)}
                      placeholder="100"
                    />
                    <Select value={apiRatePeriod} onValueChange={setApiRatePeriod}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">min</SelectItem>
                        <SelectItem value="hour">hour</SelectItem>
                        <SelectItem value="day">day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="corsEnabled">CORS Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable Cross-Origin Resource Sharing controls
                  </p>
                </div>
                <Switch
                  id="corsEnabled"
                  checked={corsEnabled}
                  onCheckedChange={setCorsEnabled}
                />
              </div>

              {corsEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Label htmlFor="corsOrigins">Allowed Origins</Label>
                  <Input
                    id="corsOrigins"
                    value={corsOrigins}
                    onChange={(e) => setCorsOrigins(e.target.value)}
                    placeholder="https://yourdomain.com, https://app.yourdomain.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed origins. Leave empty to allow all.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>
                Advanced security protections and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="httpsRedirect">HTTPS Redirect</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically redirect HTTP to HTTPS
                    </p>
                  </div>
                  <Switch
                    id="httpsRedirect"
                    checked={httpsRedirect}
                    onCheckedChange={setHttpsRedirect}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="securityHeaders">Security Headers</Label>
                    <p className="text-sm text-muted-foreground">
                      Add security headers (HSTS, X-Frame-Options, etc.)
                    </p>
                  </div>
                  <Switch
                    id="securityHeaders"
                    checked={securityHeaders}
                    onCheckedChange={setSecurityHeaders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contentSecurityPolicy">Content Security Policy</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent XSS attacks with CSP headers
                    </p>
                  </div>
                  <Switch
                    id="contentSecurityPolicy"
                    checked={contentSecurityPolicy}
                    onCheckedChange={setContentSecurityPolicy}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bruteForceProtection">Brute Force Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically block suspicious login attempts
                    </p>
                  </div>
                  <Switch
                    id="bruteForceProtection"
                    checked={bruteForceProtection}
                    onCheckedChange={setBruteForceProtection}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">IP Access Control</h4>
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Input
                    id="ipWhitelist"
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    placeholder="192.168.1.1, 10.0.0.0/8"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed IP addresses or CIDR blocks
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipBlacklist">IP Blacklist</Label>
                  <Input
                    id="ipBlacklist"
                    value={ipBlacklist}
                    onChange={(e) => setIpBlacklist(e.target.value)}
                    placeholder="192.168.1.100, 203.0.113.0/24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of blocked IP addresses or CIDR blocks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit & Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Audit & Monitoring</CardTitle>
              <CardDescription>
                Security monitoring and audit logging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auditLogging">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all security-related events
                  </p>
                </div>
                <Switch
                  id="auditLogging"
                  checked={auditLogging}
                  onCheckedChange={setAuditLogging}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="failedLoginAlerts">Failed Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts for failed login attempts
                  </p>
                </div>
                <Switch
                  id="failedLoginAlerts"
                  checked={failedLoginAlerts}
                  onCheckedChange={setFailedLoginAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="securityScanEnabled">Security Scanning</Label>
                  <p className="text-sm text-muted-foreground">
                    Regular vulnerability scans
                  </p>
                </div>
                <Switch
                  id="securityScanEnabled"
                  checked={securityScanEnabled}
                  onCheckedChange={setSecurityScanEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vulnerabilityChecks">Vulnerability Checks</Label>
                  <p className="text-sm text-muted-foreground">
                    Check for known security vulnerabilities
                  </p>
                </div>
                <Switch
                  id="vulnerabilityChecks"
                  checked={vulnerabilityChecks}
                  onCheckedChange={setVulnerabilityChecks}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Warning */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Changes to security settings may affect user access. 
              Test configurations in a staging environment before applying to production.
            </AlertDescription>
          </Alert>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Required .env configuration for security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# Security Configuration
JWT_SECRET=${jwtSecret || 'your-jwt-secret-key'}
JWT_EXPIRATION=${jwtExpiration}
SESSION_TIMEOUT_HOURS=${sessionTimeout}

# Password Policy
PASSWORD_MIN_LENGTH=${passwordMinLength}
PASSWORD_REQUIRE_SYMBOLS=${passwordRequireSymbols ? 'true' : 'false'}
PASSWORD_REQUIRE_NUMBERS=${passwordRequireNumbers ? 'true' : 'false'}
PASSWORD_REQUIRE_UPPERCASE=${passwordRequireUppercase ? 'true' : 'false'}
MAX_LOGIN_ATTEMPTS=${loginAttempts}

# API Security
RATE_LIMIT_REQUESTS=${apiRateLimit}
RATE_LIMIT_PERIOD=${apiRatePeriod}
CORS_ENABLED=${corsEnabled ? 'true' : 'false'}
CORS_ORIGINS="${corsOrigins}"

# Security Features
HTTPS_REDIRECT=${httpsRedirect ? 'true' : 'false'}
SECURITY_HEADERS=${securityHeaders ? 'true' : 'false'}
CSP_ENABLED=${contentSecurityPolicy ? 'true' : 'false'}
BRUTE_FORCE_PROTECTION=${bruteForceProtection ? 'true' : 'false'}

# Access Control
IP_WHITELIST="${ipWhitelist}"
IP_BLACKLIST="${ipBlacklist}"

# Monitoring
AUDIT_LOGGING=${auditLogging ? 'true' : 'false'}
FAILED_LOGIN_ALERTS=${failedLoginAlerts ? 'true' : 'false'}
SECURITY_SCAN_ENABLED=${securityScanEnabled ? 'true' : 'false'}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}