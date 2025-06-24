import { NextRequest, NextResponse } from 'next/server'
import { app } from '@/lib/hono-app'

export const runtime = 'nodejs'

// Handle all HTTP methods through Hono
async function handler(req: NextRequest) {
  try {
    // Convert Next.js request to standard Request
    const url = new URL(req.url)
    // Remove /api prefix from pathname to match Hono routes
    const honoPath = url.pathname.replace('/api', '') || '/'
    
    // Handle request body properly
    let requestBody: string | null = null
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      requestBody = await req.text()
    }
    
    const honoRequest = new Request(
      `${url.origin}${honoPath}${url.search}`,
      {
        method: req.method,
        headers: req.headers,
        body: requestBody,
      }
    )

    // Pass to Hono app
    const response = await app.fetch(honoRequest)
    
    // Convert Hono response back to Next.js response
    const body = await response.text()
    
    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export const GET = handler
export const POST = handler  
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const OPTIONS = handler 