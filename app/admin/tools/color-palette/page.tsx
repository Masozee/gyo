"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Palette,
  Copy,
  RefreshCw,
  Download,
  Shuffle,
  Eye,
  EyeOff,
  Contrast,
} from "lucide-react"
import { toast } from "sonner"

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name?: string
}

export default function ColorPalettePage() {
  const [selectedColor, setSelectedColor] = useState("#3b82f6")
  const [generatedPalette, setGeneratedPalette] = useState<Color[]>([])
  const [customColors, setCustomColors] = useState<Color[]>([])
  const [paletteType, setPaletteType] = useState("complementary")
  const [showAccessibility, setShowAccessibility] = useState(false)

  useEffect(() => {
    generatePalette()
  }, [selectedColor, paletteType])

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  const generatePalette = () => {
    const baseRgb = hexToRgb(selectedColor)
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b)
    const colors: Color[] = []

    switch (paletteType) {
      case "complementary":
        colors.push(createColor(selectedColor))
        colors.push(createColor(hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l)))
        break
      
      case "triadic":
        colors.push(createColor(selectedColor))
        colors.push(createColor(hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l)))
        colors.push(createColor(hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l)))
        break
      
      case "analogous":
        for (let i = -2; i <= 2; i++) {
          colors.push(createColor(hslToHex((baseHsl.h + i * 30) % 360, baseHsl.s, baseHsl.l)))
        }
        break
      
      case "monochromatic":
        for (let i = 0; i < 5; i++) {
          colors.push(createColor(hslToHex(baseHsl.h, baseHsl.s, 20 + i * 20)))
        }
        break
      
      case "tetradic":
        colors.push(createColor(selectedColor))
        colors.push(createColor(hslToHex((baseHsl.h + 90) % 360, baseHsl.s, baseHsl.l)))
        colors.push(createColor(hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l)))
        colors.push(createColor(hslToHex((baseHsl.h + 270) % 360, baseHsl.s, baseHsl.l)))
        break
    }

    setGeneratedPalette(colors)
  }

  const createColor = (hex: string): Color => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return { hex, rgb, hsl }
  }

  const generateRandomPalette = () => {
    const colors: Color[] = []
    for (let i = 0; i < 5; i++) {
      const randomHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      colors.push(createColor(randomHex))
    }
    setGeneratedPalette(colors)
  }

  const addToCustomPalette = (color: Color) => {
    if (customColors.length < 10 && !customColors.some(c => c.hex === color.hex)) {
      setCustomColors([...customColors, color])
      toast.success("Color added to custom palette!")
    }
  }

  const removeFromCustomPalette = (index: number) => {
    setCustomColors(customColors.filter((_, i) => i !== index))
  }

  const copyColorValue = (value: string, format: string) => {
    navigator.clipboard.writeText(value)
    toast.success(`${format} value copied to clipboard!`)
  }

  const getContrastRatio = (color1: Color, color2: Color): number => {
    const getLuminance = (color: Color) => {
      const { r, g, b } = color.rgb
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const l1 = getLuminance(color1)
    const l2 = getLuminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  const getAccessibilityRating = (ratio: number): { level: string; color: string } => {
    if (ratio >= 7) return { level: "AAA", color: "text-green-600" }
    if (ratio >= 4.5) return { level: "AA", color: "text-blue-600" }
    if (ratio >= 3) return { level: "AA Large", color: "text-yellow-600" }
    return { level: "Fail", color: "text-red-600" }
  }

  const exportPalette = (format: string) => {
    const colors = generatedPalette.length > 0 ? generatedPalette : customColors
    if (colors.length === 0) {
      toast.error("No colors to export")
      return
    }

    let content = ""
    const filename = `color-palette.${format}`

    switch (format) {
      case "css":
        content = ":root {\n" + colors.map((color, i) => `  --color-${i + 1}: ${color.hex};`).join("\n") + "\n}"
        break
      case "scss":
        content = colors.map((color, i) => `$color-${i + 1}: ${color.hex};`).join("\n")
        break
      case "json":
        content = JSON.stringify(colors.map(c => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl })), null, 2)
        break
      case "txt":
        content = colors.map(c => c.hex).join("\n")
        break
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Palette exported as ${format.toUpperCase()}!`)
  }

  const ColorCard = ({ color, showAdd = false }: { color: Color; showAdd?: boolean }) => {
    const whiteContrast = getContrastRatio(color, createColor("#ffffff"))
    const blackContrast = getContrastRatio(color, createColor("#000000"))
    const textColor = whiteContrast > blackContrast ? "white" : "black"

    return (
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div 
          className="h-24 flex items-center justify-center cursor-pointer"
          style={{ backgroundColor: color.hex, color: textColor }}
          onClick={() => copyColorValue(color.hex, "HEX")}
        >
          <span className="font-medium">{color.hex}</span>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-3 gap-1 text-xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs p-1"
              onClick={() => copyColorValue(color.hex, "HEX")}
            >
              HEX
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs p-1"
              onClick={() => copyColorValue(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, "RGB")}
            >
              RGB
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs p-1"
              onClick={() => copyColorValue(`hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`, "HSL")}
            >
              HSL
            </Button>
          </div>
          
          {showAdd && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => addToCustomPalette(color)}
            >
              Add to Custom
            </Button>
          )}

          {showAccessibility && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>vs White:</span>
                <span className={getAccessibilityRating(whiteContrast).color}>
                  {getAccessibilityRating(whiteContrast).level}
                </span>
              </div>
              <div className="flex justify-between">
                <span>vs Black:</span>
                <span className={getAccessibilityRating(blackContrast).color}>
                  {getAccessibilityRating(blackContrast).level}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Color Palette</h1>
          <p className="text-gray-600 mt-2">
            Advanced color picker with palette generation and accessibility checking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAccessibility(!showAccessibility)}
          >
            {showAccessibility ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="ml-2">Accessibility</span>
          </Button>
          <Button variant="outline" onClick={generateRandomPalette}>
            <Shuffle className="h-4 w-4 mr-2" />
            Random
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Palette Generator</TabsTrigger>
          <TabsTrigger value="picker">Color Picker</TabsTrigger>
          <TabsTrigger value="custom">Custom Palette</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Base Color
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-16 h-16 rounded border"
                  />
                  <div className="flex-1">
                    <Label htmlFor="color-input">Color Value</Label>
                    <Input
                      id="color-input"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Palette Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "complementary", label: "Complementary" },
                    { value: "triadic", label: "Triadic" },
                    { value: "analogous", label: "Analogous" },
                    { value: "monochromatic", label: "Monochromatic" },
                    { value: "tetradic", label: "Tetradic" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={paletteType === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaletteType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Palette */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Palette</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportPalette("css")}>
                    <Download className="h-4 w-4 mr-2" />
                    CSS
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportPalette("json")}>
                    JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {generatedPalette.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {generatedPalette.map((color, index) => (
                    <ColorCard key={index} color={color} showAdd />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a base color to generate a palette</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="picker" className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Advanced Color Picker</CardTitle>
              <CardDescription>
                Pick colors and view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-24 h-24 rounded border"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label>HEX</Label>
                        <div className="flex gap-2">
                          <Input value={selectedColor} readOnly className="font-mono" />
                          <Button variant="outline" size="sm" onClick={() => copyColorValue(selectedColor, "HEX")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const color = createColor(selectedColor)
                    return (
                      <>
                        <div>
                          <Label>RGB</Label>
                          <div className="flex gap-2">
                            <Input 
                              value={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`} 
                              readOnly 
                              className="font-mono" 
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyColorValue(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, "RGB")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>HSL</Label>
                          <div className="flex gap-2">
                            <Input 
                              value={`hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`} 
                              readOnly 
                              className="font-mono" 
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyColorValue(`hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`, "HSL")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              <Button 
                onClick={() => addToCustomPalette(createColor(selectedColor))}
                className="w-full"
              >
                Add to Custom Palette
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Palette</CardTitle>
                  <CardDescription>
                    Build your own color palette ({customColors.length}/10 colors)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCustomColors([])}
                    disabled={customColors.length === 0}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportPalette("css")}
                    disabled={customColors.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customColors.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {customColors.map((color, index) => (
                    <div key={index} className="relative">
                      <ColorCard color={color} />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => removeFromCustomPalette(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No colors in your custom palette yet</p>
                  <p className="text-sm">Add colors from the generator or picker</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}