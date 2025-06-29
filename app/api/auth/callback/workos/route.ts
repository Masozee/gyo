import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithWorkOS } from '@/lib/workos';
import { getUserByEmail, createUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
      );
    }

    // Handle missing code
    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Authorization code missing')}`, request.url)
      );
    }

    // Authenticate with WorkOS
    const workosResult = await authenticateWithWorkOS(code);
    
    if (!workosResult.user?.email) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('No email provided by OAuth provider')}`, request.url)
      );
    }

    // Check if user exists in our database
    let user = await getUserByEmail(workosResult.user.email);
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = await createUser({
        email: workosResult.user.email,
        password: 'oauth-user', // Placeholder password for OAuth users
        firstName: workosResult.user.firstName || '',
        lastName: workosResult.user.lastName || '',
        username: workosResult.user.email.split('@')[0],
      });
    }

    // Create session data (excluding password)
    const sessionData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('auth', JSON.stringify({ isAuthenticated: true, user: sessionData }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
    );
  }
}