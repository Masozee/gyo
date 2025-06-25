"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Copy,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

interface GeneratedPassword {
  password: string
  strength: number
  strengthLabel: string
  entropy: number
  timeToCrack: string
}

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  })

  const [generatedPasswords, setGeneratedPasswords] = useState<GeneratedPassword[]>([])
  const [bulkCount, setBulkCount] = useState(10)
  const [showPasswords, setShowPasswords] = useState(true)
  const [customPattern, setCustomPattern] = useState("")

  const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    similar: "il1Lo0O", // Characters that look similar
    ambiguous: "{}[]()/\\'\"`~,;.<>", // Characters that might be ambiguous
  }

  const generatePassword = (opts: PasswordOptions = options): GeneratedPassword => {
    let charset = ""
    
    if (opts.includeUppercase) charset += characterSets.uppercase
    if (opts.includeLowercase) charset += characterSets.lowercase
    if (opts.includeNumbers) charset += characterSets.numbers
    if (opts.includeSymbols) charset += characterSets.symbols

    // Remove similar/ambiguous characters if requested
    if (opts.excludeSimilar) {
      charset = charset.split('').filter(char => !characterSets.similar.includes(char)).join('')
    }
    if (opts.excludeAmbiguous) {
      charset = charset.split('').filter(char => !characterSets.ambiguous.includes(char)).join('')
    }

    if (charset.length === 0) {
      throw new Error("At least one character type must be selected")
    }

    let password = ""
    const array = new Uint32Array(opts.length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < opts.length; i++) {
      password += charset[array[i] % charset.length]
    }

    // Calculate strength and entropy
    const entropy = Math.log2(charset.length) * opts.length
    const strength = calculatePasswordStrength(password)
    const strengthLabel = getStrengthLabel(strength)
    const timeToCrack = estimateTimeToCrack(entropy)

    return {
      password,
      strength,
      strengthLabel,
      entropy: Math.round(entropy),
      timeToCrack,
    }
  }

  const calculatePasswordStrength = (password: string): number => {
    let score = 0
    
    // Length bonus
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (password.length >= 20) score += 1

    // Character type bonuses
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 1 // Common sequences

    return Math.max(0, Math.min(10, score))
  }

  const getStrengthLabel = (strength: number): string => {
    if (strength <= 2) return "Very Weak"
    if (strength <= 4) return "Weak"
    if (strength <= 6) return "Fair"
    if (strength <= 8) return "Strong"
    return "Very Strong"
  }

  const getStrengthColor = (strength: number): string => {
    if (strength <= 2) return "text-red-600"
    if (strength <= 4) return "text-orange-600"
    if (strength <= 6) return "text-yellow-600"
    if (strength <= 8) return "text-blue-600"
    return "text-green-600"
  }

  const getStrengthIcon = (strength: number) => {
    if (strength <= 2) return <XCircle className="h-4 w-4 text-red-600" />
    if (strength <= 4) return <AlertTriangle className="h-4 w-4 text-orange-600" />
    if (strength <= 6) return <Shield className="h-4 w-4 text-yellow-600" />
    if (strength <= 8) return <CheckCircle className="h-4 w-4 text-blue-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const estimateTimeToCrack = (entropy: number): string => {
    // Assuming 1 trillion guesses per second
    const guessesPerSecond = 1e12
    const combinations = Math.pow(2, entropy)
    const seconds = combinations / (2 * guessesPerSecond) // Average time is half the total combinations

    if (seconds < 60) return "< 1 minute"
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`
    return "Centuries"
  }

  const handleGenerateSingle = () => {
    try {
      const newPassword = generatePassword()
      setGeneratedPasswords([newPassword, ...generatedPasswords.slice(0, 19)]) // Keep last 20
      toast.success("Password generated!")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleGenerateBulk = () => {
    try {
      const passwords: GeneratedPassword[] = []
      for (let i = 0; i < bulkCount; i++) {
        passwords.push(generatePassword())
      }
      setGeneratedPasswords(passwords)
      toast.success(`${bulkCount} passwords generated!`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const generateFromPattern = () => {
    // Simple pattern generator: L=lowercase, U=uppercase, N=number, S=symbol
    if (!customPattern.trim()) {
      toast.error("Please enter a pattern")
      return
    }

    try {
      let password = ""
      for (const char of customPattern) {
        switch (char.toUpperCase()) {
          case 'L':
            password += characterSets.lowercase[Math.floor(Math.random() * characterSets.lowercase.length)]
            break
          case 'U':
            password += characterSets.uppercase[Math.floor(Math.random() * characterSets.uppercase.length)]
            break
          case 'N':
            password += characterSets.numbers[Math.floor(Math.random() * characterSets.numbers.length)]
            break
          case 'S':
            password += characterSets.symbols[Math.floor(Math.random() * characterSets.symbols.length)]
            break
          default:
            password += char // Keep literal characters
        }
      }

      const strength = calculatePasswordStrength(password)
      const strengthLabel = getStrengthLabel(strength)
      const entropy = Math.log2(62) * password.length // Rough estimate
      const timeToCrack = estimateTimeToCrack(entropy)

      const newPassword: GeneratedPassword = {
        password,
        strength,
        strengthLabel,
        entropy: Math.round(entropy),
        timeToCrack,
      }

      setGeneratedPasswords([newPassword, ...generatedPasswords.slice(0, 19)])
      toast.success("Pattern-based password generated!")
    } catch (error) {
      toast.error("Failed to generate password from pattern")
    }
  }

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password)
    toast.success("Password copied to clipboard!")
  }

  const exportPasswords = () => {
    if (generatedPasswords.length === 0) {
      toast.error("No passwords to export")
      return
    }

    const content = generatedPasswords.map(p => 
      `${p.password} | Strength: ${p.strengthLabel} | Entropy: ${p.entropy} bits | Time to crack: ${p.timeToCrack}`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passwords.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Passwords exported!")
  }

  const updateOption = (key: keyof PasswordOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Password Generator</h1>
          <p className="text-gray-600 mt-2">
            Generate secure passwords with customizable length, complexity, and character sets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPasswords(!showPasswords)}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="ml-2">{showPasswords ? "Hide" : "Show"}</span>
          </Button>
          <Button variant="outline" onClick={exportPasswords} disabled={generatedPasswords.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Password</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generate</TabsTrigger>
          <TabsTrigger value="pattern">Pattern Based</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Password Options
                </CardTitle>
                <CardDescription>
                  Customize your password generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Length */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Password Length</Label>
                    <span className="text-sm font-medium">{options.length}</span>
                  </div>
                  <Slider
                    value={[options.length]}
                    onValueChange={([value]) => updateOption('length', value)}
                    min={4}
                    max={128}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* Character Types */}
                <div className="space-y-3">
                  <Label>Character Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uppercase"
                        checked={options.includeUppercase}
                        onCheckedChange={(checked) => updateOption('includeUppercase', checked)}
                      />
                      <Label htmlFor="uppercase" className="text-sm">
                        Uppercase (A-Z)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lowercase"
                        checked={options.includeLowercase}
                        onCheckedChange={(checked) => updateOption('includeLowercase', checked)}
                      />
                      <Label htmlFor="lowercase" className="text-sm">
                        Lowercase (a-z)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="numbers"
                        checked={options.includeNumbers}
                        onCheckedChange={(checked) => updateOption('includeNumbers', checked)}
                      />
                      <Label htmlFor="numbers" className="text-sm">
                        Numbers (0-9)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="symbols"
                        checked={options.includeSymbols}
                        onCheckedChange={(checked) => updateOption('includeSymbols', checked)}
                      />
                      <Label htmlFor="symbols" className="text-sm">
                        Symbols (!@#$%^&*)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-3">
                  <Label>Advanced Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-similar"
                        checked={options.excludeSimilar}
                        onCheckedChange={(checked) => updateOption('excludeSimilar', checked)}
                      />
                      <Label htmlFor="exclude-similar" className="text-sm">
                        Exclude similar characters (il1Lo0O)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-ambiguous"
                        checked={options.excludeAmbiguous}
                        onCheckedChange={(checked) => updateOption('excludeAmbiguous', checked)}
                      />
                      <Label htmlFor="exclude-ambiguous" className="text-sm">
                        Exclude ambiguous symbols
                      </Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleGenerateSingle} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Password
                </Button>
              </CardContent>
            </Card>

            {/* Latest Password */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Password</CardTitle>
                <CardDescription>
                  Your most recently generated password
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedPasswords.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded border">
                      <div className="font-mono text-lg break-all">
                        {showPasswords ? generatedPasswords[0].password : '•'.repeat(generatedPasswords[0].password.length)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => copyPassword(generatedPasswords[0].password)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" onClick={handleGenerateSingle}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Strength:</span>
                        <div className="flex items-center gap-2">
                          {getStrengthIcon(generatedPasswords[0].strength)}
                          <span className={getStrengthColor(generatedPasswords[0].strength)}>
                            {generatedPasswords[0].strengthLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Entropy:</span>
                        <span>{generatedPasswords[0].entropy} bits</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Time to crack:</span>
                        <span>{generatedPasswords[0].timeToCrack}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No password generated yet</p>
                    <p className="text-sm">Click "Generate Password" to create one</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Password Generation</CardTitle>
              <CardDescription>
                Generate multiple passwords at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="bulk-count">Number of passwords</Label>
                  <Input
                    id="bulk-count"
                    type="number"
                    min="1"
                    max="100"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button onClick={handleGenerateBulk} className="mt-6">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate {bulkCount} Passwords
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedPasswords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Passwords ({generatedPasswords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {generatedPasswords.map((pwd, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1 font-mono text-sm">
                        {showPasswords ? pwd.password : '•'.repeat(pwd.password.length)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          {getStrengthIcon(pwd.strength)}
                          <span className={getStrengthColor(pwd.strength)}>
                            {pwd.strengthLabel}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPassword(pwd.password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pattern" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Pattern-Based Generation</CardTitle>
              <CardDescription>
                Generate passwords using custom patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern</Label>
                <Input
                  id="pattern"
                  placeholder="e.g., UULLnnss (8 chars: 2 upper, 2 lower, 2 numbers, 2 symbols)"
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                />
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Pattern Key:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code>U</code> = Uppercase letter (A-Z)</li>
                  <li><code>L</code> = Lowercase letter (a-z)</li>
                  <li><code>N</code> = Number (0-9)</li>
                  <li><code>S</code> = Symbol (!@#$%...)</li>
                  <li>Any other character = Literal character</li>
                </ul>
                <p><strong>Example:</strong> <code>Password-NN</code> → <code>Password-47</code></p>
              </div>

              <Button onClick={generateFromPattern} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Generate from Pattern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password History */}
      {generatedPasswords.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Password History</CardTitle>
            <CardDescription>
              Recently generated passwords (last 20)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {generatedPasswords.slice(1).map((pwd, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex-1 font-mono">
                    {showPasswords ? pwd.password : '•'.repeat(pwd.password.length)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${getStrengthColor(pwd.strength)}`}>
                      {pwd.strengthLabel}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPassword(pwd.password)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Password Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Strong Password Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Use at least 12 characters</li>
                <li>Include uppercase, lowercase, numbers, and symbols</li>
                <li>Avoid dictionary words and personal information</li>
                <li>Use unique passwords for each account</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Storage & Management</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Use a reputable password manager</li>
                <li>Enable two-factor authentication when available</li>
                <li>Never share passwords via email or text</li>
                <li>Change passwords immediately if compromised</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}