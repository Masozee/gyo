export interface CurrencySettings {
  defaultCurrency: string
  currencyPosition: 'before' | 'after'
  numberFormat: 'european' | 'american'
  currencySymbol: string
}

// Default European formatting settings
export const defaultCurrencySettings: CurrencySettings = {
  defaultCurrency: 'EUR',
  currencyPosition: 'after',
  numberFormat: 'european',
  currencySymbol: '€'
}

/**
 * Format currency amount with European number formatting
 * European: 1.000.000,00 (periods for thousands, comma for decimal)
 * American: 1,000,000.00 (commas for thousands, period for decimal)
 */
export function formatCurrency(
  amount: number, 
  settings: CurrencySettings = defaultCurrencySettings
): string {
  if (isNaN(amount)) return '0'

  let formatted: string

  if (settings.numberFormat === 'european') {
    // European format: 1.000.000,00
    formatted = amount.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } else {
    // American format: 1,000,000.00
    formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Add currency symbol
  if (settings.currencyPosition === 'before') {
    return `${settings.currencySymbol}${formatted}`
  } else {
    return `${formatted} ${settings.currencySymbol}`
  }
}

/**
 * Format currency amount without symbol (for calculations)
 */
export function formatNumber(
  amount: number,
  format: 'european' | 'american' = 'european'
): string {
  if (isNaN(amount)) return '0'

  if (format === 'european') {
    return amount.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } else {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}

/**
 * Parse European formatted number string back to number
 * Converts "1.000.000,00" or "1,000,000.00" back to 1000000.00
 */
export function parseCurrencyString(
  value: string,
  format: 'european' | 'american' = 'european'
): number {
  if (!value || typeof value !== 'string') return 0

  // Remove currency symbols and spaces
  let cleaned = value.replace(/[€$£¥₹₽¢₦₡₨₩₪₫₱₹₴₵₦₡₨₩₪₫₱₹₴₵]/g, '').trim()

  if (format === 'european') {
    // European: "1.000.000,00" -> 1000000.00
    // Last comma is decimal separator, periods are thousand separators
    const lastCommaIndex = cleaned.lastIndexOf(',')
    const lastPeriodIndex = cleaned.lastIndexOf('.')
    
    if (lastCommaIndex > lastPeriodIndex) {
      // Comma is decimal separator
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else if (lastPeriodIndex > lastCommaIndex) {
      // Period is decimal separator (mixed format)
      cleaned = cleaned.replace(/,/g, '')
    }
  } else {
    // American: "1,000,000.00" -> 1000000.00
    // Last period is decimal separator, commas are thousand separators
    const lastCommaIndex = cleaned.lastIndexOf(',')
    const lastPeriodIndex = cleaned.lastIndexOf('.')
    
    if (lastPeriodIndex > lastCommaIndex) {
      // Period is decimal separator
      cleaned = cleaned.replace(/,/g, '')
    } else if (lastCommaIndex > lastPeriodIndex) {
      // Comma is decimal separator (mixed format)
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    }
  }

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    AUD: 'A$',
    CAD: 'C$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RUB: '₽',
    INR: '₹',
    CNY: '¥',
    BRL: 'R$',
    MXN: '$',
    ZAR: 'R',
    TRY: '₺',
  }
  
  return symbols[currencyCode] || currencyCode
}

/**
 * Validate IBAN format
 */
export function validateIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  
  // Basic IBAN format check (country code + 2 check digits + BBAN)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/
  
  return ibanRegex.test(cleaned)
}

/**
 * Format IBAN with spaces for display
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}