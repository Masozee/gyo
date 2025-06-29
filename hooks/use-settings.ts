"use client"

import { useState, useEffect } from 'react'

interface Setting {
  value: string
  type: string
  group: string
  label: string
  description: string
}

interface SettingsMap {
  [key: string]: Setting
}

export function useSettings(group?: string) {
  const [settings, setSettings] = useState<SettingsMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = group ? `/api/admin/settings?group=${group}` : '/api/admin/settings'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Record<string, any>) => {
    try {
      setError(null)
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
      
      // Refresh settings after update
      await fetchSettings()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const updateSetting = async (key: string, value: string, options?: {
    type?: string
    group?: string
    label?: string
    description?: string
    order?: number
  }) => {
    try {
      setError(null)
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ...options }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update setting')
      }
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: {
          value,
          type: options?.type || prev[key]?.type || 'text',
          group: options?.group || prev[key]?.group || 'general',
          label: options?.label || prev[key]?.label || key,
          description: options?.description || prev[key]?.description || '',
        }
      }))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const deleteSetting = async (key: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/admin/settings?key=${key}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete setting')
      }
      
      // Remove from local state
      setSettings(prev => {
        const newSettings = { ...prev }
        delete newSettings[key]
        return newSettings
      })
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key]?.value || defaultValue
  }

  const getSettingAsBoolean = (key: string, defaultValue: boolean = false) => {
    const value = settings[key]?.value
    if (value === undefined) return defaultValue
    return value === 'true' || value === '1' || value === 'yes'
  }

  const getSettingAsNumber = (key: string, defaultValue: number = 0) => {
    const value = settings[key]?.value
    if (value === undefined) return defaultValue
    const num = parseFloat(value)
    return isNaN(num) ? defaultValue : num
  }

  useEffect(() => {
    fetchSettings()
  }, [group])

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateSetting,
    deleteSetting,
    getSetting,
    getSettingAsBoolean,
    getSettingAsNumber,
  }
}