"use client"

import * as React from "react"
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, ExternalLink, Github } from "lucide-react"

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
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GitHubSettingsPage() {
  const [oauthEnabled, setOauthEnabled] = React.useState(false)
  const [clientId, setClientId] = React.useState("")
  const [clientSecret, setClientSecret] = React.useState("")
  const [showClientSecret, setShowClientSecret] = React.useState(false)
  const [githubToken, setGithubToken] = React.useState("")
  const [showGithubToken, setShowGithubToken] = React.useState(false)
  const [webhookSecret, setWebhookSecret] = React.useState("")
  const [showWebhookSecret, setShowWebhookSecret] = React.useState(false)
  const [repositoryAccess, setRepositoryAccess] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState("disconnected")

  const handleSave = () => {
    console.log("Saving GitHub settings...")
  }

  const testConnection = () => {
    console.log("Testing GitHub connection...")
    // Mock connection test
    setConnectionStatus("connected")
  }

  const redirectUrl = "https://yoursite.com/api/auth/github/callback"

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">GitHub OAuth & Integration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure GitHub authentication and repository integration
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
                    <Github className="w-5 h-5" />
                    GitHub Connection
                  </CardTitle>
                  <CardDescription>
                    Current status of your GitHub integration
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
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a 
                    href="https://github.com/settings/applications/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Create GitHub App
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Alert>
            <Github className="w-4 h-4" />
            <AlertDescription>
              <strong>Setup Instructions:</strong> Create a new GitHub OAuth App at{" "}
              <a 
                href="https://github.com/settings/applications/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/settings/applications/new
              </a>{" "}
              and use the callback URL: <code className="bg-muted px-1 py-0.5 rounded text-xs">{redirectUrl}</code>
            </AlertDescription>
          </Alert>

          {/* OAuth Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>OAuth Configuration</CardTitle>
              <CardDescription>
                Configure GitHub OAuth for user authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="oauthEnabled">Enable GitHub OAuth</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to sign in with their GitHub accounts
                  </p>
                </div>
                <Switch
                  id="oauthEnabled"
                  checked={oauthEnabled}
                  onCheckedChange={setOauthEnabled}
                />
              </div>

              {oauthEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Ov23liabcdefghijk"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="clientSecret"
                        type={showClientSecret ? "text" : "password"}
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder="abcdef1234567890abcdef1234567890abcdef12"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                      >
                        {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Callback URL</Label>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <code className="text-sm">{redirectUrl}</code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use this URL when setting up your GitHub OAuth App
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GitHub API Integration */}
          <Card>
            <CardHeader>
              <CardTitle>GitHub API Integration</CardTitle>
              <CardDescription>
                Configure GitHub API access for repository data and portfolio sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="repositoryAccess">Repository Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable access to your GitHub repositories for portfolio sync
                  </p>
                </div>
                <Switch
                  id="repositoryAccess"
                  checked={repositoryAccess}
                  onCheckedChange={setRepositoryAccess}
                />
              </div>

              {repositoryAccess && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="githubToken">Personal Access Token</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="githubToken"
                        type={showGithubToken ? "text" : "password"}
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_abcdefghijklmnopqrstuvwxyz1234567890"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowGithubToken(!showGithubToken)}
                      >
                        {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create a token at{" "}
                      <a 
                        href="https://github.com/settings/tokens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        github.com/settings/tokens
                      </a>{" "}
                      with 'repo' and 'user' permissions
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Set up webhooks for real-time repository updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="webhookSecret"
                    type={showWebhookSecret ? "text" : "password"}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder="your-webhook-secret"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="p-3 bg-muted/50 rounded-md">
                  <code className="text-sm">https://yoursite.com/api/webhooks/github</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure this URL in your GitHub repository webhook settings
                </p>
              </div>

              <div className="space-y-2">
                <Label>Webhook Events</Label>
                <div className="p-3 bg-muted/50 rounded-md text-sm">
                  <div className="space-y-1">
                    <div>• <code>push</code> - Repository updates</div>
                    <div>• <code>release</code> - New releases</div>
                    <div>• <code>issues</code> - Issue tracking</div>
                    <div>• <code>pull_request</code> - PR updates</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions and Scopes */}
          <Card>
            <CardHeader>
              <CardTitle>Required Permissions</CardTitle>
              <CardDescription>
                OAuth scopes and API permissions needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">OAuth Scopes:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">user</Badge>
                      <span className="text-muted-foreground">User profile access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">user:email</Badge>
                      <span className="text-muted-foreground">Email access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">repo</Badge>
                      <span className="text-muted-foreground">Repository access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">read:org</Badge>
                      <span className="text-muted-foreground">Organization data</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">API Permissions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Read repository information and metadata</li>
                    <li>Access public and private repositories (if enabled)</li>
                    <li>Read user profile and organization data</li>
                    <li>Receive webhook notifications for repository events</li>
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
                Required .env configuration for GitHub integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# GitHub OAuth Configuration
GITHUB_CLIENT_ID=${clientId || 'Ov23liabcdefghijk'}
GITHUB_CLIENT_SECRET=${clientSecret || 'your-client-secret'}
GITHUB_CALLBACK_URL=${redirectUrl}

# GitHub API Configuration  
GITHUB_PERSONAL_ACCESS_TOKEN=${githubToken || 'ghp_your-token'}
GITHUB_WEBHOOK_SECRET=${webhookSecret || 'your-webhook-secret'}

# NextAuth Configuration
NEXTAUTH_URL=${redirectUrl.replace('/api/auth/github/callback', '')}
NEXTAUTH_SECRET=your-nextauth-secret`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}