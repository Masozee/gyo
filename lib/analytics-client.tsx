"use client"

import { useEffect } from 'react'

// Client-side analytics tracking

let sessionId: string | null = null
let lastPath: string | null = null
let pageStartTime: number = 0

// Initialize session ID
function getSessionId(): string {
  if (sessionId) return sessionId
  
  // Try to get from sessionStorage first
  if (typeof window !== 'undefined') {
    sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
  } else {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  return sessionId
}

// Track page view
export async function trackPageView(path?: string, title?: string, userId?: number) {
  if (typeof window === 'undefined') return
  
  const currentPath = path || window.location.pathname
  const pageTitle = title || document.title
  const referrer = document.referrer
  
  // Track page duration for previous page
  if (lastPath && pageStartTime > 0) {
    const duration = Math.round((Date.now() - pageStartTime) / 1000)
    // We could send duration for the previous page here
  }
  
  // Set new page start time
  pageStartTime = Date.now()
  lastPath = currentPath
  
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId(),
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        userId,
        path: currentPath,
        title: pageTitle,
        referrer,
      }),
    })
    
    if (!response.ok) {
      console.warn('Failed to track page view:', response.statusText)
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error)
  }
}

// Track custom events
export async function trackEvent(eventName: string, properties?: Record<string, any>, userId?: number) {
  if (typeof window === 'undefined') return
  
  try {
    const response = await fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId(),
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
        userId,
        eventName,
        properties,
        path: window.location.pathname,
      }),
    })
    
    if (!response.ok) {
      console.warn('Failed to track event:', response.statusText)
    }
  } catch (error) {
    console.warn('Event tracking error:', error)
  }
}

// Auto-track page views on navigation (for SPA)
export function initializeAnalytics(userId?: number) {
  if (typeof window === 'undefined') return
  
  // Track initial page view
  trackPageView(undefined, undefined, userId)
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && lastPath && pageStartTime > 0) {
      const duration = Math.round((Date.now() - pageStartTime) / 1000)
      // Could track session duration or page duration here
    }
  })
  
  // Track before page unload
  window.addEventListener('beforeunload', () => {
    if (lastPath && pageStartTime > 0) {
      const duration = Math.round((Date.now() - pageStartTime) / 1000)
      // Could track session end or page duration here
    }
  })
}

// Hook for Next.js App Router
export function usePageTracking(userId?: number) {
  if (typeof window === 'undefined') return
  
  useEffect(() => {
    trackPageView(undefined, undefined, userId)
  }, [userId])
}

export function AnalyticsProvider({ 
  children, 
  userId 
}: { 
  children: React.ReactNode
  userId?: number 
}) {
  useEffect(() => {
    initializeAnalytics(userId)
  }, [userId])
  
  return <>{children}</>
}