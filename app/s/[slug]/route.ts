import { NextRequest, NextResponse } from 'next/server'
import { handleUrlRedirect } from '@/lib/api/tools-server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params
  try {
    const shortCode = params.slug
    
    // Get client information for analytics
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    // Handle the redirect through our server function
    const originalUrl = await handleUrlRedirect(shortCode, {
      ip,
      userAgent,
      referer,
    })

    if (!originalUrl) {
      // Return a 404 page or redirect to home with error
      return NextResponse.redirect(new URL('/?error=url-not-found', request.url), 302)
    }

    // Redirect to the original URL
    return NextResponse.redirect(originalUrl, 302)
  } catch (error) {
    console.error('Error handling URL redirect:', error)
    return NextResponse.redirect(new URL('/?error=redirect-failed', request.url), 302)
  }
} 