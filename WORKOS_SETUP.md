# WorkOS AuthKit Integration Setup

This guide shows how to integrate WorkOS AuthKit with your existing Supabase authentication system.

## 1. WorkOS Dashboard Setup

1. Go to [WorkOS Dashboard](https://dashboard.workos.com/)
2. Create a new application or use an existing one
3. Configure OAuth providers (Google, Microsoft, etc.)
4. Set redirect URI to: `http://localhost:3000/api/auth/callback/workos`
5. Note down your:
   - API Key (Secret Key)
   - Client ID

## 2. Environment Variables

Add these to your `.env.local` file:

```env
# WorkOS Configuration
WORKOS_API_KEY=your_workos_secret_key_here
WORKOS_CLIENT_ID=your_workos_client_id_here
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback/workos
NEXTAUTH_URL=http://localhost:3000
```

## 3. How It Works

### OAuth Flow:
1. User clicks "Login with Google/Microsoft" on login page
2. User is redirected to `/api/auth/oauth?provider=google`
3. WorkOS generates authorization URL and redirects to OAuth provider
4. User completes OAuth flow with provider
5. Provider redirects to `/api/auth/callback/workos` with authorization code
6. WorkOS exchanges code for user information
7. System checks if user exists in Supabase database
8. If user doesn't exist, creates new user in Supabase
9. Sets session cookie and redirects to dashboard

### Database Integration:
- WorkOS handles OAuth authentication
- User data is stored in your existing Supabase database
- Existing session management system is preserved
- OAuth users get placeholder passwords since they don't use password auth

## 4. Supported Providers

Current implementation supports:
- Google OAuth
- Microsoft OAuth

To add more providers:
1. Add them to `OAUTH_PROVIDERS` in `/lib/workos.ts`
2. Configure them in WorkOS Dashboard
3. Add buttons to login form

## 5. Security Features

- CSRF protection using state parameter
- HttpOnly cookies for session management
- Secure cookie settings for production
- Error handling for failed OAuth attempts

## 6. Testing

1. Make sure your environment variables are set
2. Start the development server: `npm run dev`
3. Go to `/login`
4. Click "Google" or "Microsoft" button
5. Complete OAuth flow
6. Should redirect to dashboard on success

## 7. Production Deployment

For production:
1. Update `WORKOS_REDIRECT_URI` to your production domain
2. Update `NEXTAUTH_URL` to your production domain
3. Configure OAuth providers with production redirect URIs
4. Ensure secure cookie settings are enabled

## 8. Troubleshooting

- Check WorkOS Dashboard for OAuth provider configuration
- Verify redirect URIs match exactly
- Check browser console for errors
- Review server logs for authentication failures
- Ensure environment variables are loaded correctly