# Fix Session Expiration on Vercel Production

## 1. Set Environment Variables on Vercel

In your Vercel dashboard, go to Project Settings → Environment Variables and add:

```
SUPABASE_URL=https://vvzhwzzotfqbfvivjgyv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2emh3enpvdGZxYmZ2aXZqZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDI1NDgsImV4cCI6MjA2NjQxODU0OH0.YdPn4BYp5Rt5ETeP7MeWWySPDuPPgMWNFLN4X8qJ8So
DATABASE_URL=postgresql://postgres.vvzhwzzotfqbfvivjgyv:yur4v3bl1z4__@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
GOOGLE_GEMINI_API_KEY=AIzaSyCWOlZEspk_aWjuyFdYy0p1-KYbJl9k6Rc
```

## 2. Add Production Domain to Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel domain to the allowed domains:
   - `https://your-app-name.vercel.app`
   - `https://your-custom-domain.com` (if applicable)

## 3. Update Supabase Configuration for Production

Add these additional settings in Supabase Authentication → URL Configuration:
- Site URL: `https://your-app-name.vercel.app`
- Redirect URLs: 
  - `https://your-app-name.vercel.app/login`
  - `https://your-app-name.vercel.app/admin/**`

## 4. Common Session Issues to Check:

### Missing SUPABASE_ANON_KEY
The key in your .env.local appears truncated. Get the full key from Supabase Dashboard → Settings → API

### Supabase RLS Policies
If you have Row Level Security enabled, ensure policies allow authenticated users to access data.

### Token Refresh Issues
Supabase tokens expire after 1 hour by default. Your app should handle refresh automatically.

## 5. Debug Steps:

1. Check Vercel Function Logs for auth errors
2. Verify environment variables are set in Vercel
3. Test authentication flow in production
4. Check browser network tab for 401/403 errors

## 6. Quick Test:

After deploying, open browser dev tools and check:
- Local storage for Supabase session data
- Network requests for auth-related 401 errors
- Console for Supabase auth error messages