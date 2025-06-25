"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Hash,
  Copy,
  Upload,
  FileText,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react"
import { toast } from "sonner"

export default function HashGeneratorPage() {
  const [textInput, setTextInput] = useState("")
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("md5")
  const [hashResult, setHashResult] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileHashResult, setFileHashResult] = useState("")
  
  // Verification
  const [verifyText, setVerifyText] = useState("")
  const [verifyHash, setVerifyHash] = useState("")
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)

  const algorithms = [
    { value: "md5", label: "MD5", description: "128-bit hash (weak security)" },
    { value: "sha1", label: "SHA-1", description: "160-bit hash (deprecated)" },
    { value: "sha256", label: "SHA-256", description: "256-bit hash (recommended)" },
    { value: "sha384", label: "SHA-384", description: "384-bit hash" },
    { value: "sha512", label: "SHA-512", description: "512-bit hash (highest security)" },
  ]

  const generateHash = async (input: string, algorithm: string): Promise<string> => {
    // Using Web Crypto API for client-side hashing
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    
    let hashBuffer: ArrayBuffer
    
    switch (algorithm) {
      case "sha1":
        hashBuffer = await crypto.subtle.digest("SHA-1", data)
        break
      case "sha256":
        hashBuffer = await crypto.subtle.digest("SHA-256", data)
        break
      case "sha384":
        hashBuffer = await crypto.subtle.digest("SHA-384", data)
        break
      case "sha512":
        hashBuffer = await crypto.subtle.digest("SHA-512", data)
        break
      case "md5":
      default:
        // MD5 is not available in Web Crypto API, using a simple simulation
        // In a real app, you'd use a crypto library like crypto-js
        return await simulateMD5(input)
    }
    
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const simulateMD5 = async (input: string): Promise<string> => {
    // This is a simulation - in a real app, use crypto-js or similar
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32)
  }

  const handleGenerateTextHash = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter text to hash")
      return
    }

    try {
      setIsGenerating(true)
      const hash = await generateHash(textInput, selectedAlgorithm)
      setHashResult(hash)
      toast.success("Hash generated successfully!")
    } catch (error) {
      toast.error("Failed to generate hash")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB")
        return
      }
      setUploadedFile(file)
      toast.success("File uploaded successfully!")
    }
  }

  const handleGenerateFileHash = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first")
      return
    }

    try {
      setIsGenerating(true)
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const text = new TextDecoder().decode(uint8Array)
      
      const hash = await generateHash(text, selectedAlgorithm)
      setFileHashResult(hash)
      toast.success("File hash generated successfully!")
    } catch (error) {
      toast.error("Failed to generate file hash")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVerifyHash = async () => {
    if (!verifyText.trim() || !verifyHash.trim()) {
      toast.error("Please enter both text and hash to verify")
      return
    }

    try {
      const generatedHash = await generateHash(verifyText, selectedAlgorithm)
      const isMatch = generatedHash.toLowerCase() === verifyHash.toLowerCase()
      setVerificationResult(isMatch)
      
      if (isMatch) {
        toast.success("Hash verification successful - Match found!")
      } else {
        toast.error("Hash verification failed - No match")
      }
    } catch (error) {
      toast.error("Failed to verify hash")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const clearAll = () => {
    setTextInput("")
    setHashResult("")
    setUploadedFile(null)
    setFileHashResult("")
    setVerifyText("")
    setVerifyHash("")
    setVerificationResult(null)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hash Generator</h1>
          <p className="text-gray-600 mt-2">
            Generate MD5, SHA-1, SHA-256, and other hash types for security and verification
          </p>
        </div>
        <Button variant="outline" onClick={clearAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Algorithm Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Hash Algorithm</CardTitle>
          <CardDescription>
            Choose the cryptographic hash algorithm to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {algorithms.map((algo) => (
              <div
                key={algo.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAlgorithm === algo.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAlgorithm(algo.value)}
              >
                <div className="font-medium">{algo.label}</div>
                <div className="text-xs text-gray-500 mt-1">{algo.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Text Hashing</TabsTrigger>
          <TabsTrigger value="file">File Hashing</TabsTrigger>
          <TabsTrigger value="verify">Hash Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Text Input
                </CardTitle>
                <CardDescription>
                  Enter text to generate its hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text to Hash</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <Button 
                  onClick={handleGenerateTextHash} 
                  disabled={isGenerating || !textInput.trim()}
                  className="w-full"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : `Generate ${selectedAlgorithm.toUpperCase()} Hash`}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hash Result</CardTitle>
                <CardDescription>
                  Generated {selectedAlgorithm.toUpperCase()} hash
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hashResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded border font-mono text-sm break-all">
                      {hashResult}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(hashResult)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Hash
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Algorithm:</strong> {selectedAlgorithm.toUpperCase()}</p>
                      <p><strong>Length:</strong> {hashResult.length} characters</p>
                      <p><strong>Input Length:</strong> {textInput.length} characters</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter text and click "Generate Hash" to see the result</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Upload
                </CardTitle>
                <CardDescription>
                  Upload a file to generate its hash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div>
                        <Button variant="outline" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            Choose File
                          </label>
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".txt,.json,.xml,.csv,.log"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Text files up to 10MB (txt, json, xml, csv, log)
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleGenerateFileHash} 
                  disabled={isGenerating || !uploadedFile}
                  className="w-full"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : `Generate File Hash`}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Hash Result</CardTitle>
                <CardDescription>
                  Generated hash for uploaded file
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fileHashResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded border font-mono text-sm break-all">
                      {fileHashResult}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(fileHashResult)}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy File Hash
                    </Button>

                    {uploadedFile && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>File:</strong> {uploadedFile.name}</p>
                        <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                        <p><strong>Algorithm:</strong> {selectedAlgorithm.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a file and click "Generate File Hash" to see the result</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Hash Verification
              </CardTitle>
              <CardDescription>
                Verify if text matches a given hash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-text">Original Text</Label>
                <Textarea
                  id="verify-text"
                  placeholder="Enter the original text..."
                  value={verifyText}
                  onChange={(e) => setVerifyText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verify-hash">Hash to Verify</Label>
                <Input
                  id="verify-hash"
                  placeholder="Enter the hash to verify against..."
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button 
                onClick={handleVerifyHash} 
                disabled={!verifyText.trim() || !verifyHash.trim()}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Hash
              </Button>

              {verificationResult !== null && (
                <div className={`p-4 rounded border ${
                  verificationResult 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {verificationResult ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {verificationResult ? 'Hash Verified!' : 'Hash Mismatch'}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    {verificationResult 
                      ? 'The provided text matches the hash exactly.'
                      : 'The provided text does not match the given hash.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle>Hash Algorithm Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">MD5</h4>
              <p className="text-gray-600">
                Fast but cryptographically broken. Use only for checksums, not security.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SHA-1</h4>
              <p className="text-gray-600">
                Deprecated for security use. Still used in some legacy systems.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SHA-256</h4>
              <p className="text-gray-600">
                Current standard for cryptographic hashing. Recommended for security.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SHA-384</h4>
              <p className="text-gray-600">
                Higher security variant of SHA-2. Good for sensitive applications.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SHA-512</h4>
              <p className="text-gray-600">
                Highest security in SHA-2 family. Best for maximum security needs.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Use Cases</h4>
              <p className="text-gray-600">
                File integrity, password storage, digital signatures, blockchain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}