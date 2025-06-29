"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/schema'
import { supabase } from '@/lib/db'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // First check server-side session
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
            setLoading(false)
            return
          }
        }
        
        // Fallback to localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        // Fallback to localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem('user')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const requireAuth = () => {
    if (!loading && !user) {
      router.push('/login')
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    requireAuth,
    isAuthenticated: !!user
  }
} 