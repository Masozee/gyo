"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileSignature,
  Upload,
  Send,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Mail,
  Calendar,
  User,
} from "lucide-react"
import { toast } from "sonner"

interface DocumentSigningRequest {
  id: string
  documentName: string
  recipientEmail: string
  recipientName: string
  status: "draft" | "sent" | "signed" | "expired" | "declined"
  sentDate?: string
  signedDate?: string
  expiryDate: string
  message?: string
}

interface Signer {
  id: string
  name: string
  email: string
  role: string
  status: "pending" | "signed" | "declined"
  signedAt?: string
}

export default function DocumentSigningPage() {
  const [activeTab, setActiveTab] = useState("send")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [expiryDays, setExpiryDays] = useState("30")
  const [isLoading, setIsLoading] = useState(false)

  const [signingRequests, setSigningRequests] = useState<DocumentSigningRequest[]>([
    {
      id: "1",
      documentName: "Service Agreement Q1 2024.pdf",
      recipientEmail: "client@example.com",
      recipientName: "John Smith",
      status: "signed",
      sentDate: "2024-01-15",
      signedDate: "2024-01-16",
      expiryDate: "2024-02-14",
      message: "Please review and sign the service agreement for Q1 2024."
    },
    {
      id: "2",
      documentName: "NDA - Project Alpha.pdf",
      recipientEmail: "contractor@example.com",
      recipientName: "Jane Doe",
      status: "sent",
      sentDate: "2024-01-20",
      expiryDate: "2024-02-19",
      message: "Please sign this NDA before we proceed with the project."
    },
    {
      id: "3",
      documentName: "Freelance Contract.pdf",
      recipientEmail: "freelancer@example.com",
      recipientName: "Mike Johnson",
      status: "expired",
      sentDate: "2024-01-01",
      expiryDate: "2024-01-31",
      message: "Freelance contract for web development project."
    }
  ])

  const [multiSigners, setMultiSigners] = useState<Signer[]>([
    { id: "1", name: "", email: "", role: "Client", status: "pending" }
  ])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setDocumentFile(file)
        toast.success("Document uploaded successfully!")
      } else {
        toast.error("Please upload a PDF or image file")
      }
    }
  }

  const handleSendForSigning = async () => {
    if (!documentFile) {
      toast.error("Please upload a document first")
      return
    }
    if (!recipientName.trim() || !recipientEmail.trim()) {
      toast.error("Please enter recipient details")
      return
    }

    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newRequest: DocumentSigningRequest = {
        id: Date.now().toString(),
        documentName: documentFile.name,
        recipientEmail,
        recipientName,
        status: "sent",
        sentDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        message: message || undefined
      }

      setSigningRequests(prev => [newRequest, ...prev])
      
      // Reset form
      setDocumentFile(null)
      setRecipientName("")
      setRecipientEmail("")
      setMessage("")
      
      toast.success("Document sent for signing!")
    } catch (error) {
      toast.error("Failed to send document")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMultiPartySigners = () => {
    const validSigners = multiSigners.filter(s => s.name.trim() && s.email.trim())
    if (!documentFile) {
      toast.error("Please upload a document first")
      return
    }
    if (validSigners.length === 0) {
      toast.error("Please add at least one signer")
      return
    }

    toast.success(`Document sent to ${validSigners.length} signers!`)
  }

  const addSigner = () => {
    setMultiSigners(prev => [
      ...prev,
      { id: Date.now().toString(), name: "", email: "", role: "Signer", status: "pending" }
    ])
  }

  const removeSigner = (id: string) => {
    setMultiSigners(prev => prev.filter(s => s.id !== id))
  }

  const updateSigner = (id: string, field: keyof Signer, value: string) => {
    setMultiSigners(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "sent":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "draft":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    total: signingRequests.length,
    signed: signingRequests.filter(r => r.status === "signed").length,
    pending: signingRequests.filter(r => r.status === "sent").length,
    expired: signingRequests.filter(r => r.status === "expired").length,
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Signing</h1>
        <p className="text-gray-600 mt-2">
          Send documents for digital signatures with tracking and compliance features
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileSignature className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed</p>
                <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Document Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Document for Signing
            </CardTitle>
            <CardDescription>
              Upload a document and send it to recipients for digital signatures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="send">Single Signer</TabsTrigger>
                <TabsTrigger value="multi">Multi-Party</TabsTrigger>
              </TabsList>
              
              <TabsContent value="send" className="space-y-4">
                {/* Document Upload */}
                <div className="space-y-2">
                  <Label htmlFor="document">Document *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {documentFile ? (
                      <div className="space-y-2">
                        <FileSignature className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="text-sm font-medium">{documentFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDocumentFile(null)}
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
                            accept=".pdf,image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF or image files up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Recipient Name *</Label>
                    <Input
                      id="recipient-name"
                      placeholder="John Smith"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-email">Recipient Email *</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      placeholder="john@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Message and Expiry */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Please review and sign this document..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry">Expires in (days)</Label>
                  <Input
                    id="expiry"
                    type="number"
                    min="1"
                    max="365"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSendForSigning} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Sending..." : "Send for Signing"}
                </Button>
              </TabsContent>

              <TabsContent value="multi" className="space-y-4">
                {/* Document Upload */}
                <div className="space-y-2">
                  <Label htmlFor="document-multi">Document *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {documentFile ? (
                      <div className="space-y-2">
                        <FileSignature className="h-6 w-6 text-green-500 mx-auto" />
                        <p className="text-sm font-medium">{documentFile.name}</p>
                      </div>
                    ) : (
                      <Button variant="outline" asChild>
                        <label htmlFor="file-upload-multi" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </label>
                      </Button>
                    )}
                    <input
                      id="file-upload-multi"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Signers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Signers</Label>
                    <Button variant="outline" size="sm" onClick={addSigner}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Signer
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {multiSigners.map((signer, index) => (
                      <div key={signer.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Input
                            placeholder="Name"
                            value={signer.name}
                            onChange={(e) => updateSigner(signer.id, "name", e.target.value)}
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="Email"
                            type="email"
                            value={signer.email}
                            onChange={(e) => updateSigner(signer.id, "email", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Role"
                            value={signer.role}
                            onChange={(e) => updateSigner(signer.id, "role", e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          {multiSigners.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSigner(signer.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleMultiPartySigners} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send to All Signers
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signing Requests</CardTitle>
            <CardDescription>
              Track the status of your recent document signing requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-sm">{request.documentName}</p>
                      <p className="text-xs text-gray-500">
                        To: {request.recipientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sent: {request.sentDate}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            {signingRequests.length === 0 && (
              <div className="text-center py-8">
                <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-600">
                  Send your first document for signing using the form.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Signing Requests */}
      <Card>
        <CardHeader>
          <CardTitle>All Signing Requests</CardTitle>
          <CardDescription>
            Complete history of all your document signing requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{request.documentName}</p>
                        {request.message && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {request.message}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{request.recipientName}</p>
                        <p className="text-xs text-gray-500">{request.recipientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.sentDate || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.expiryDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {request.status === "sent" && (
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}