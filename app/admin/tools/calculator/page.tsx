"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  Plus,
  Minus,
  X,
  Divide,
  Percent,
  RotateCcw,
  Clock,
  DollarSign,
} from "lucide-react"

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  // Project Calculator
  const [hourlyRate, setHourlyRate] = useState("")
  const [hoursWorked, setHoursWorked] = useState("")
  const [projectExpenses, setProjectExpenses] = useState("")
  const [taxRate, setTaxRate] = useState("20")

  // Currency Converter
  const [amount, setAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [convertedAmount, setConvertedAmount] = useState("")

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const performCalculation = {
    "+": (firstOperand: number, secondOperand: number) => firstOperand + secondOperand,
    "-": (firstOperand: number, secondOperand: number) => firstOperand - secondOperand,
    "*": (firstOperand: number, secondOperand: number) => firstOperand * secondOperand,
    "/": (firstOperand: number, secondOperand: number) => firstOperand / secondOperand,
    "=": (firstOperand: number, secondOperand: number) => secondOperand,
  }

  const calculate = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = performCalculation[operation as keyof typeof performCalculation](
        currentValue,
        inputValue
      )

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculateProject = () => {
    const rate = parseFloat(hourlyRate) || 0
    const hours = parseFloat(hoursWorked) || 0
    const expenses = parseFloat(projectExpenses) || 0
    const tax = parseFloat(taxRate) || 0

    const labor = rate * hours
    const subtotal = labor + expenses
    const taxAmount = (subtotal * tax) / 100
    const total = subtotal + taxAmount

    return {
      labor,
      subtotal,
      taxAmount,
      total,
    }
  }

  const convertCurrency = async () => {
    // Placeholder for currency conversion - in real app would use exchange rate API
    const exchangeRates: { [key: string]: number } = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      AUD: 1.35,
      CAD: 1.25,
    }

    const fromRate = exchangeRates[fromCurrency] || 1
    const toRate = exchangeRates[toCurrency] || 1
    const amountNum = parseFloat(amount) || 0
    
    const converted = (amountNum / fromRate) * toRate
    setConvertedAmount(converted.toFixed(2))
  }

  const projectResults = calculateProject()

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calculator</h1>
        <p className="text-gray-600 mt-2">
          Advanced calculator with project calculations and currency conversion
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Calculator</TabsTrigger>
          <TabsTrigger value="project">Project Calculator</TabsTrigger>
          <TabsTrigger value="currency">Currency Converter</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Basic Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Display */}
                <div className="bg-gray-900 text-white p-4 rounded text-right text-2xl font-mono min-h-[60px] flex items-center justify-end">
                  {display}
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="outline" onClick={clear} className="h-12">
                    C
                  </Button>
                  <Button variant="outline" onClick={() => calculate("%")} className="h-12">
                    <Percent className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="h-12">
                    ±
                  </Button>
                  <Button variant="outline" onClick={() => calculate("/")} className="h-12">
                    <Divide className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" onClick={() => inputDigit("7")} className="h-12">
                    7
                  </Button>
                  <Button variant="outline" onClick={() => inputDigit("8")} className="h-12">
                    8
                  </Button>
                  <Button variant="outline" onClick={() => inputDigit("9")} className="h-12">
                    9
                  </Button>
                  <Button variant="outline" onClick={() => calculate("*")} className="h-12">
                    <X className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" onClick={() => inputDigit("4")} className="h-12">
                    4
                  </Button>
                  <Button variant="outline" onClick={() => inputDigit("5")} className="h-12">
                    5
                  </Button>
                  <Button variant="outline" onClick={() => inputDigit("6")} className="h-12">
                    6
                  </Button>
                  <Button variant="outline" onClick={() => calculate("-")} className="h-12">
                    <Minus className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" onClick={() => inputDigit("1")} className="h-12">
                    1
                  </Button>
                  <Button variant="outline" onClick={() => inputDigit("2")} className="h-12">
                    2
                  </Button>
                  <Button variant="outline" onClick={() => inputDigit("3")} className="h-12">
                    3
                  </Button>
                  <Button variant="outline" onClick={() => calculate("+")} className="h-12">
                    <Plus className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" onClick={() => inputDigit("0")} className="h-12 col-span-2">
                    0
                  </Button>
                  <Button variant="outline" onClick={inputDecimal} className="h-12">
                    .
                  </Button>
                  <Button onClick={() => calculate("=")} className="h-12">
                    =
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Project Calculator
                </CardTitle>
                <CardDescription>
                  Calculate project costs including labor, expenses, and taxes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    placeholder="75"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours-worked">Hours Worked</Label>
                  <Input
                    id="hours-worked"
                    type="number"
                    placeholder="40"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-expenses">Project Expenses ($)</Label>
                  <Input
                    id="project-expenses"
                    type="number"
                    placeholder="500"
                    value={projectExpenses}
                    onChange={(e) => setProjectExpenses(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    placeholder="20"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Labor Cost:</span>
                    <span className="font-medium">${projectResults.labor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-medium">${(parseFloat(projectExpenses) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Subtotal:</span>
                    <span className="font-medium">${projectResults.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-medium">${projectResults.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span>${projectResults.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Project Summary</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Hourly Rate: ${hourlyRate || 0}/hour</li>
                    <li>• Total Hours: {hoursWorked || 0} hours</li>
                    <li>• Effective Rate: ${projectResults.total / (parseFloat(hoursWorked) || 1) || 0}/hour</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency Converter
              </CardTitle>
              <CardDescription>
                Convert between different currencies (rates are approximated)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-currency">From</Label>
                  <select
                    id="from-currency"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-currency">To</Label>
                  <select
                    id="to-currency"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
              </div>

              <Button onClick={convertCurrency} className="w-full">
                Convert Currency
              </Button>

              {convertedAmount && (
                <div className="p-4 bg-blue-50 rounded border text-center">
                  <div className="text-lg">
                    <span className="font-medium">{amount} {fromCurrency}</span>
                    <span className="mx-2">=</span>
                    <span className="font-bold text-blue-600">{convertedAmount} {toCurrency}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Exchange rates are approximated for demonstration purposes
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p><strong>Note:</strong> Exchange rates shown are for demonstration purposes only. 
                For accurate rates, please use a financial service or bank.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}