"use client"

import * as React from "react"
import { Save, CreditCard, Building, Receipt, Percent, Globe } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function FinancialSettingsPage() {
  // Currency Settings
  const [defaultCurrency, setDefaultCurrency] = React.useState("EUR")
  const [currencyPosition, setCurrencyPosition] = React.useState("before") // before or after
  const [numberFormat, setNumberFormat] = React.useState("european") // european (1.000.000,00) or american (1,000,000.00)
  const [currencySymbol, setCurrencySymbol] = React.useState("€")

  // Tax Settings
  const [defaultTaxRate, setDefaultTaxRate] = React.useState("21")
  const [taxName, setTaxName] = React.useState("VAT")
  const [taxNumber, setTaxNumber] = React.useState("")
  const [includeInPrices, setIncludeInPrices] = React.useState(false)

  // Bank Details
  const [bankName, setBankName] = React.useState("")
  const [accountHolder, setAccountHolder] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [routingNumber, setRoutingNumber] = React.useState("")
  const [iban, setIban] = React.useState("")
  const [bic, setBic] = React.useState("")
  const [address, setAddress] = React.useState("")

  // Invoice Settings
  const [invoicePrefix, setInvoicePrefix] = React.useState("INV")
  const [invoiceNumberLength, setInvoiceNumberLength] = React.useState("6")
  const [defaultDueDays, setDefaultDueDays] = React.useState("30")
  const [lateFeesEnabled, setLateFeesEnabled] = React.useState(false)
  const [lateFeePercentage, setLateFeePercentage] = React.useState("1.5")

  const handleSave = () => {
    // Save settings to backend/database
    console.log("Saving financial settings...", {
      currency: {
        defaultCurrency,
        currencyPosition,
        numberFormat,
        currencySymbol,
      },
      tax: {
        defaultTaxRate,
        taxName,
        taxNumber,
        includeInPrices,
      },
      bank: {
        bankName,
        accountHolder,
        accountNumber,
        routingNumber,
        iban,
        bic,
        address,
      },
      invoice: {
        invoicePrefix,
        invoiceNumberLength,
        defaultDueDays,
        lateFeesEnabled,
        lateFeePercentage,
      },
    })
    toast.success("Financial settings saved successfully!")
  }

  const formatCurrencyExample = (amount: number) => {
    if (numberFormat === "european") {
      const formatted = amount.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return currencyPosition === "before" 
        ? `${currencySymbol}${formatted}` 
        : `${formatted} ${currencySymbol}`
    } else {
      const formatted = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return currencyPosition === "before" 
        ? `${currencySymbol}${formatted}` 
        : `${formatted} ${currencySymbol}`
    }
  }

  const currencies = [
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", symbol: "kr" },
  ]

  React.useEffect(() => {
    const selectedCurrency = currencies.find(c => c.code === defaultCurrency)
    if (selectedCurrency) {
      setCurrencySymbol(selectedCurrency.symbol)
    }
  }, [defaultCurrency])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Financial & Invoice Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure currency, tax settings, bank details, and invoice preferences
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Currency Settings
              </CardTitle>
              <CardDescription>
                Configure default currency and number formatting for invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencyPosition">Currency Symbol Position</Label>
                  <Select value={currencyPosition} onValueChange={setCurrencyPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before amount ({currencySymbol}1.000,00)</SelectItem>
                      <SelectItem value="after">After amount (1.000,00 {currencySymbol})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Select value={numberFormat} onValueChange={setNumberFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="european">European (1.000.000,00)</SelectItem>
                      <SelectItem value="american">American (1,000,000.00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="€"
                    className="w-20"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">Small amount: {formatCurrencyExample(1234.56)}</p>
                  <p className="text-sm">Large amount: {formatCurrencyExample(1234567.89)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Tax Settings
              </CardTitle>
              <CardDescription>
                Configure default tax rates and tax information for invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="defaultTaxRate"
                    type="number"
                    step="0.01"
                    value={defaultTaxRate}
                    onChange={(e) => setDefaultTaxRate(e.target.value)}
                    placeholder="21.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxName">Tax Name</Label>
                  <Input
                    id="taxName"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    placeholder="VAT, GST, Sales Tax"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Registration Number</Label>
                  <Input
                    id="taxNumber"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="Your tax/VAT number"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="includeInPrices">Tax Included in Prices</Label>
                  <p className="text-sm text-muted-foreground">
                    Show prices including tax by default
                  </p>
                </div>
                <Switch
                  id="includeInPrices"
                  checked={includeInPrices}
                  onCheckedChange={setIncludeInPrices}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Settings
              </CardTitle>
              <CardDescription>
                Configure invoice numbering, payment terms, and late fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="INV"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumberLength">Number Length</Label>
                  <Select value={invoiceNumberLength} onValueChange={setInvoiceNumberLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 digits (0001)</SelectItem>
                      <SelectItem value="5">5 digits (00001)</SelectItem>
                      <SelectItem value="6">6 digits (000001)</SelectItem>
                      <SelectItem value="7">7 digits (0000001)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultDueDays">Default Payment Terms (days)</Label>
                  <Select value={defaultDueDays} onValueChange={setDefaultDueDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due on receipt</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lateFeesEnabled">Enable Late Fees</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically calculate late fees for overdue invoices
                    </p>
                  </div>
                  <Switch
                    id="lateFeesEnabled"
                    checked={lateFeesEnabled}
                    onCheckedChange={setLateFeesEnabled}
                  />
                </div>

                {lateFeesEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="lateFeePercentage">Late Fee Percentage (% per month)</Label>
                    <Input
                      id="lateFeePercentage"
                      type="number"
                      step="0.1"
                      value={lateFeePercentage}
                      onChange={(e) => setLateFeePercentage(e.target.value)}
                      placeholder="1.5"
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium">Preview Invoice Number</Label>
                <p className="text-sm mt-1 font-mono">
                  {invoicePrefix}-{"0".repeat(parseInt(invoiceNumberLength) - 1)}1-{String(new Date().getMonth() + 1).padStart(2, '0')}-{new Date().getFullYear()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Bank information to display on invoices for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Your Bank Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Your Name or Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="DE89 3704 0044 0532 0130 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bic">BIC/SWIFT Code</Label>
                  <Input
                    id="bic"
                    value={bic}
                    onChange={(e) => setBic(e.target.value)}
                    placeholder="COBADEFFXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number / Sort Code</Label>
                  <Input
                    id="routingNumber"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Bank Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Bank address (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Notice */}
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>Currency Format:</strong> The European format uses periods (.) as thousand separators 
                  and commas (,) as decimal separators (e.g., 1.000.000,00).
                </p>
                <p>
                  <strong>Bank Details:</strong> This information will be displayed on invoices to help 
                  clients make payments. Ensure all details are accurate.
                </p>
                <p>
                  <strong>Tax Settings:</strong> Changes to tax settings will apply to new invoices only. 
                  Existing invoices will maintain their original tax configuration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}