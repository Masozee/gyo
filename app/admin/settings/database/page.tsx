"use client"

import * as React from "react"
import { Save, TestTube, CheckCircle, XCircle, Download, Upload, RefreshCw, Database, AlertTriangle } from "lucide-react"

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
import { Progress } from "@/components/ui/progress"

export default function DatabaseSettingsPage() {
  const [dbProvider, setDbProvider] = React.useState("postgresql")
  const [dbHost, setDbHost] = React.useState("localhost")
  const [dbPort, setDbPort] = React.useState("5432")
  const [dbName, setDbName] = React.useState("")
  const [dbUser, setDbUser] = React.useState("")
  const [dbPassword, setDbPassword] = React.useState("")
  const [dbUrl, setDbUrl] = React.useState("")
  const [sslEnabled, setSslEnabled] = React.useState(true)
  
  // Backup Settings
  const [autoBackupEnabled, setAutoBackupEnabled] = React.useState(false)
  const [backupFrequency, setBackupFrequency] = React.useState("daily")
  const [backupRetention, setBackupRetention] = React.useState("30")
  const [backupLocation, setBackupLocation] = React.useState("local")
  
  // Connection Pool
  const [poolEnabled, setPoolEnabled] = React.useState(true)
  const [poolMin, setPoolMin] = React.useState("2")
  const [poolMax, setPoolMax] = React.useState("10")
  const [poolTimeout, setPoolTimeout] = React.useState("30")
  
  // Status
  const [connectionStatus, setConnectionStatus] = React.useState("connected")
  const [dbSize, setDbSize] = React.useState("2.4 GB")
  const [dbTables, setDbTables] = React.useState("15")
  const [lastBackup, setLastBackup] = React.useState("2024-01-15 14:30:00")

  const handleSave = () => {
    console.log("Saving database settings...")
  }

  const testConnection = () => {
    console.log("Testing database connection...")
    // Mock connection test
    setConnectionStatus("connected")
  }

  const createBackup = () => {
    console.log("Creating database backup...")
  }

  const migrateDatabase = () => {
    console.log("Running database migrations...")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Database Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage database connection, backups, and maintenance
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Database Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Status
                  </CardTitle>
                  <CardDescription>
                    Current database connection and statistics
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dbSize}</div>
                  <div className="text-sm text-muted-foreground">Database Size</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dbTables}</div>
                  <div className="text-sm text-muted-foreground">Tables</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>

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
                  onClick={migrateDatabase}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Migrations
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Database Connection */}
          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>
                Configure your database connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dbProvider">Database Provider</Label>
                <Select value={dbProvider} onValueChange={setDbProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select database provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="supabase">Supabase</SelectItem>
                    <SelectItem value="planetscale">PlanetScale</SelectItem>
                    <SelectItem value="neon">Neon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dbProvider !== "sqlite" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbHost">Host</Label>
                      <Input
                        id="dbHost"
                        value={dbHost}
                        onChange={(e) => setDbHost(e.target.value)}
                        placeholder="localhost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbPort">Port</Label>
                      <Input
                        id="dbPort"
                        value={dbPort}
                        onChange={(e) => setDbPort(e.target.value)}
                        placeholder="5432"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input
                      id="dbName"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="portfolio_db"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbUser">Username</Label>
                      <Input
                        id="dbUser"
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbPassword">Password</Label>
                      <Input
                        id="dbPassword"
                        type="password"
                        value={dbPassword}
                        onChange={(e) => setDbPassword(e.target.value)}
                        placeholder="password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sslEnabled">SSL Connection</Label>
                      <p className="text-sm text-muted-foreground">
                        Use SSL/TLS for secure database connections
                      </p>
                    </div>
                    <Switch
                      id="sslEnabled"
                      checked={sslEnabled}
                      onCheckedChange={setSslEnabled}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="dbUrl">Database URL (Alternative)</Label>
                <Input
                  id="dbUrl"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="postgresql://user:password@host:port/database"
                />
                <p className="text-xs text-muted-foreground">
                  Use a connection string instead of individual fields
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Connection Pool */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Pool</CardTitle>
              <CardDescription>
                Configure database connection pooling for performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="poolEnabled">Enable Connection Pooling</Label>
                  <p className="text-sm text-muted-foreground">
                    Improve performance with connection pooling
                  </p>
                </div>
                <Switch
                  id="poolEnabled"
                  checked={poolEnabled}
                  onCheckedChange={setPoolEnabled}
                />
              </div>

              {poolEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="poolMin">Min Connections</Label>
                      <Input
                        id="poolMin"
                        type="number"
                        value={poolMin}
                        onChange={(e) => setPoolMin(e.target.value)}
                        placeholder="2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poolMax">Max Connections</Label>
                      <Input
                        id="poolMax"
                        type="number"
                        value={poolMax}
                        onChange={(e) => setPoolMax(e.target.value)}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poolTimeout">Timeout (seconds)</Label>
                      <Input
                        id="poolTimeout"
                        type="number"
                        value={poolTimeout}
                        onChange={(e) => setPoolTimeout(e.target.value)}
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>
                Configure automatic backups and restoration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackupEnabled">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable scheduled database backups
                  </p>
                </div>
                <Switch
                  id="autoBackupEnabled"
                  checked={autoBackupEnabled}
                  onCheckedChange={setAutoBackupEnabled}
                />
              </div>

              {autoBackupEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupRetention">Retention (days)</Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        value={backupRetention}
                        onChange={(e) => setBackupRetention(e.target.value)}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupLocation">Backup Storage</Label>
                    <Select value={backupLocation} onValueChange={setBackupLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Manual Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Last backup: {lastBackup}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={createBackup}>
                      <Download className="w-4 h-4 mr-2" />
                      Create Backup
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Database Maintenance</CardTitle>
              <CardDescription>
                Optimize and maintain database performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Optimize Tables
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  Analyze Performance
                </Button>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Check Integrity
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Vacuum Database
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Maintenance Notice:</strong> Some operations may temporarily impact performance. 
                  Schedule maintenance during low-traffic periods.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Required .env configuration for database connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`# Database Configuration
DATABASE_PROVIDER=${dbProvider}
${dbUrl ? `DATABASE_URL="${dbUrl}"` : `DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}`}
DB_SSL=${sslEnabled ? 'true' : 'false'}

# Connection Pool
DB_POOL_MIN=${poolMin}
DB_POOL_MAX=${poolMax}
DB_POOL_TIMEOUT=${poolTimeout}

# Backup Configuration
BACKUP_ENABLED=${autoBackupEnabled ? 'true' : 'false'}
BACKUP_FREQUENCY=${backupFrequency}
BACKUP_RETENTION_DAYS=${backupRetention}
BACKUP_STORAGE=${backupLocation}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}