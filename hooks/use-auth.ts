"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/schema'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
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