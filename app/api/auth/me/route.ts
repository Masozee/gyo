import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth')

    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    try {
      const authData = JSON.parse(authCookie.value)
      
      if (!authData.isAuthenticated || !authData.user) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        user: authData.user
      })
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}