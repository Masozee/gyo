import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl, type OAuthProvider } from '@/lib/workos';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as OAuthProvider;
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    
    // Get authorization URL from WorkOS
    const authorizationUrl = getAuthorizationUrl(provider, state);
    
    // Store state in a cookie for verification later
    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}