"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  QrCode,
  Download,
  RefreshCw,
  Copy,
  Smartphone,
  Wifi,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"

export default function QrCodesPage() {
  const [qrType, setQrType] = useState("url")
  const [qrData, setQrData] = useState("")
  const [qrColor, setQrColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [qrSize, setQrSize] = useState("256")
  const [errorLevel, setErrorLevel] = useState("M")
  const [generatedQr, setGeneratedQr] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form data for different QR types
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false
  })

  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    url: ""
  })

  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    query: ""
  })

  const generateQrCode = async () => {
    let data = ""
    
    switch (qrType) {
      case "url":
        data = qrData
        break
      case "text":
        data = qrData
        break
      case "email":
        data = `mailto:${qrData}`
        break
      case "phone":
        data = `tel:${qrData}`
        break
      case "sms":
        data = `sms:${qrData}`
        break
      case "wifi":
        data = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`
        break
      case "contact":
        data = `BEGIN:VCARD
VERSION:3.0
FN:${contactData.firstName} ${contactData.lastName}
TEL:${contactData.phone}
EMAIL:${contactData.email}
ORG:${contactData.organization}
URL:${contactData.url}
END:VCARD`
        break
      case "location":
        if (locationData.latitude && locationData.longitude) {
          data = `geo:${locationData.latitude},${locationData.longitude}`
        } else if (locationData.query) {
          data = `geo:0,0?q=${encodeURIComponent(locationData.query)}`
        }
        break
      default:
        data = qrData
    }

    if (!data.trim()) {
      toast.error("Please enter data to generate QR code")
      return
    }

    try {
      setIsGenerating(true)
      
      // Generate real QR code using the qrcode library
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: parseInt(qrSize),
        color: {
          dark: qrColor,
          light: bgColor
        },
        errorCorrectionLevel: errorLevel as 'L' | 'M' | 'Q' | 'H'
      })

      setGeneratedQr(qrCodeDataUrl)
      toast.success("QR code generated successfully!")
    } catch (error) {
      toast.error("Failed to generate QR code")
      console.error("QR Code generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQrCode = () => {
    if (!generatedQr) return
    
    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.png`
    link.href = generatedQr
    link.click()
    toast.success("QR code downloaded!")
  }

  const copyQrCode = async () => {
    if (!generatedQr) return
    
    try {
      const response = await fetch(generatedQr)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      toast.success("QR code copied to clipboard!")
    } catch (error) {
      // Fallback to copying the data URL as text
      try {
        await navigator.clipboard.writeText(generatedQr)
        toast.success("QR code URL copied to clipboard!")
      } catch (fallbackError) {
        toast.error("Failed to copy QR code")
      }
    }
  }

  const renderQrForm = () => {
    switch (qrType) {
      case "url":
        return (
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
          </div>
        )
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              placeholder="Enter your text here..."
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              rows={4}
            />
          </div>
        )
      case "email":
        return (
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
          </div>
        )
      case "phone":
        return (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1234567890"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
          </div>
        )
      case "sms":
        return (
          <div className="space-y-2">
            <Label htmlFor="sms">Phone Number</Label>
            <Input
              id="sms"
              placeholder="+1234567890"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
          </div>
        )
      case "wifi":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
              <Input
                id="wifi-ssid"
                placeholder="MyWiFiNetwork"
                value={wifiData.ssid}
                onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi-password">Password</Label>
              <Input
                id="wifi-password"
                type="password"
                placeholder="WiFi password"
                value={wifiData.password}
                onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifi-security">Security Type</Label>
              <Select
                value={wifiData.security}
                onValueChange={(value) => setWifiData({...wifiData, security: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case "contact":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-first-name">First Name</Label>
              <Input
                id="contact-first-name"
                placeholder="John"
                value={contactData.firstName}
                onChange={(e) => setContactData({...contactData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-last-name">Last Name</Label>
              <Input
                id="contact-last-name"
                placeholder="Doe"
                value={contactData.lastName}
                onChange={(e) => setContactData({...contactData, lastName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                placeholder="+1234567890"
                value={contactData.phone}
                onChange={(e) => setContactData({...contactData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="john@example.com"
                value={contactData.email}
                onChange={(e) => setContactData({...contactData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-organization">Organization</Label>
              <Input
                id="contact-organization"
                placeholder="Company Name"
                value={contactData.organization}
                onChange={(e) => setContactData({...contactData, organization: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-url">Website</Label>
              <Input
                id="contact-url"
                placeholder="https://example.com"
                value={contactData.url}
                onChange={(e) => setContactData({...contactData, url: e.target.value})}
              />
            </div>
          </div>
        )
      case "location":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location-latitude">Latitude</Label>
                <Input
                  id="location-latitude"
                  placeholder="40.7128"
                  value={locationData.latitude}
                  onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-longitude">Longitude</Label>
                <Input
                  id="location-longitude"
                  placeholder="-74.0060"
                  value={locationData.longitude}
                  onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                />
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">or</div>
            <div className="space-y-2">
              <Label htmlFor="location-query">Search Query</Label>
              <Input
                id="location-query"
                placeholder="New York, NY"
                value={locationData.query}
                onChange={(e) => setLocationData({...locationData, query: e.target.value})}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="text-gray-600 mt-2">
          Generate QR codes for URLs, text, WiFi, contact info, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Generate QR Code
            </CardTitle>
            <CardDescription>
              Choose the type of QR code and customize its appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={qrType} onValueChange={setQrType} className="space-y-4">
              <TabsList className="grid grid-cols-4 gap-1">
                <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                <TabsTrigger value="wifi" className="text-xs">WiFi</TabsTrigger>
                <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-4 gap-1">
                <Button
                  variant={qrType === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQrType("email")}
                  className="text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
                <Button
                  variant={qrType === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQrType("phone")}
                  className="text-xs"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Phone
                </Button>
                <Button
                  variant={qrType === "sms" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQrType("sms")}
                  className="text-xs"
                >
                  <Smartphone className="h-3 w-3 mr-1" />
                  SMS
                </Button>
                <Button
                  variant={qrType === "location" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQrType("location")}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Location
                </Button>
              </div>

              <div className="space-y-4">
                {renderQrForm()}
              </div>
            </Tabs>

            {/* Customization Options */}
            <div className="mt-6 space-y-4 border-t pt-4">
              <h4 className="font-medium">Customization</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-color">QR Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="qr-color"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size">Size (px)</Label>
                  <Select value={qrSize} onValueChange={setQrSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">128x128</SelectItem>
                      <SelectItem value="256">256x256</SelectItem>
                      <SelectItem value="512">512x512</SelectItem>
                      <SelectItem value="1024">1024x1024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="error-level">Error Correction</Label>
                  <Select value={errorLevel} onValueChange={setErrorLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={generateQrCode} disabled={isGenerating} className="w-full mt-4">
              <QrCode className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate QR Code"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview and Download */}
        <Card>
          <CardHeader>
            <CardTitle>Preview & Download</CardTitle>
            <CardDescription>
              Preview your QR code and download in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQr ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50 text-center">
                  <img
                    src={generatedQr}
                    alt="Generated QR Code"
                    className="mx-auto"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={downloadQrCode} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={copyQrCode} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p><strong>Size:</strong> {qrSize}x{qrSize} pixels</p>
                  <p><strong>Format:</strong> PNG</p>
                  <p><strong>Error Correction:</strong> Level {errorLevel}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Code Generated</h3>
                <p className="text-gray-600">
                  Fill out the form and click "Generate QR Code" to create your QR code.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick QR Codes</CardTitle>
          <CardDescription>
            Generate common QR codes quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => {
                setQrType("wifi")
                setWifiData({ssid: "Guest-WiFi", password: "", security: "nopass", hidden: false})
              }}
            >
              <Wifi className="h-6 w-6" />
              <span>Guest WiFi</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => {
                setQrType("url")
                setQrData("https://github.com")
              }}
            >
              <QrCode className="h-6 w-6" />
              <span>GitHub Profile</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => {
                setQrType("email")
                setQrData("contact@company.com")
              }}
            >
              <Mail className="h-6 w-6" />
              <span>Contact Email</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => {
                setQrType("location")
                setLocationData({latitude: "", longitude: "", query: "New York, NY"})
              }}
            >
              <MapPin className="h-6 w-6" />
              <span>Office Location</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}