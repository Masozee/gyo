import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('auth')
    
    // Redirect to login if not authenticated
    if (!authCookie || !authCookie.value) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      // Basic authentication check
      const authData = JSON.parse(authCookie.value)
      if (!authData.isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}