"use client"

import { useEffect, useState } from 'react'

interface ClientSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientSafe({ children, fallback = null }: ClientSafeProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 