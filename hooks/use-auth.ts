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
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('session')
        } else if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            emailVerified: session.user.email_confirmed_at ? true : false,
            createdAt: session.user.created_at!,
            updatedAt: session.user.updated_at!
          }
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('session', JSON.stringify({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at
          }))
        } else {
          // No session, check localStorage as fallback
          const userData = localStorage.getItem('user')
          if (userData) {
            try {
              setUser(JSON.parse(userData))
            } catch (error) {
              console.error('Error parsing user data:', error)
              localStorage.removeItem('user')
              localStorage.removeItem('session')
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            emailVerified: session.user.email_confirmed_at ? true : false,
            createdAt: session.user.created_at!,
            updatedAt: session.user.updated_at!
          }
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('session', JSON.stringify({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at
          }))
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          localStorage.removeItem('user')
          localStorage.removeItem('session')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('session')
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