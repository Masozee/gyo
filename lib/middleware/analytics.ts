import { NextRequest } from 'next/server'
import { trackApiRequest } from '@/lib/analytics'

export async function trackApiRequestMiddleware(
  request: NextRequest,
  response: Response,
  startTime: number
) {
  try {
    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Extract request details
    const method = request.method
    const path = new URL(request.url).pathname
    const statusCode = response.status
    const userAgent = request.headers.get('user-agent') || ''
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    const referer = request.headers.get('referer') || ''
    const sessionId = request.headers.get('x-session-id') || undefined

    // Get request/response sizes
    const requestSize = request.headers.get('content-length') 
      ? parseInt(request.headers.get('content-length')!) 
      : 0
    
    const responseSize = response.headers.get('content-length')
      ? parseInt(response.headers.get('content-length')!)
      : 0

    // Skip tracking for certain paths
    const skipPaths = [
      '/api/analytics/track',
      '/api/analytics/traffic',
      '/api/analytics/api',
      '/_next',
      '/favicon.ico',
      '/robots.txt',
    ]

    if (skipPaths.some(skipPath => path.startsWith(skipPath))) {
      return
    }

    // Track the API request
    await trackApiRequest({
      sessionId,
      method,
      path,
      statusCode,
      responseTime,
      userAgent,
      ip,
      referer,
      requestSize,
      responseSize,
      errorMessage: statusCode >= 400 ? `HTTP ${statusCode}` : undefined,
    })
  } catch (error) {
    // Don't throw errors for analytics tracking failures
    console.error('Failed to track API request:', error)
  }
}