# URL Shortener Guide

## Overview
The URL shortener allows you to create short, memorable URLs that redirect to longer original URLs. It includes analytics tracking and click monitoring.

## How It Works

### 1. Creating Short URLs
1. Go to `/admin/tools/url-shortener`
2. Enter the original URL you want to shorten
3. Optionally add a custom alias and description
4. Click "Shorten URL"

### 2. URL Format
- Short URLs follow the pattern: `https://yourdomain.com/s/{shortCode}`
- Example: `https://yourdomain.com/s/abc123`

### 3. Redirect Process
1. User visits short URL (e.g., `/s/abc123`)
2. System looks up the short code in the database
3. If found and not expired, redirects to original URL
4. Click is tracked for analytics (IP, user agent, referrer, etc.)
5. If not found, redirects to home page with error

## Testing the URL Shortener

### Step 1: Create a Short URL
1. Log in to the admin panel
2. Navigate to Tools → URL Shortener
3. Create a short URL for testing (e.g., `https://google.com`)

### Step 2: Test the Redirect
1. Copy the generated short URL
2. Open it in a new browser tab
3. You should be redirected to the original URL
4. Check the analytics to see the click was tracked

### Example Test URLs
- Original: `https://www.google.com`
- Short: `https://yourdomain.com/s/google` (if using custom alias)

## Analytics Features
- Total clicks and unique visitors
- Click tracking by date, country, device, and browser
- Recent click history with details
- Export capabilities

## Technical Implementation

### Database Schema
- `shortened_urls` table stores URL mappings
- `url_clicks` table tracks each click with metadata

### API Endpoints
- `POST /api/tools/urls` - Create shortened URL
- `GET /api/tools/urls` - List user's URLs
- `GET /api/tools/urls/{id}/analytics` - Get analytics
- `DELETE /api/tools/urls/{id}` - Delete URL

### Redirect Handler
- `GET /s/[slug]` - Next.js route handler for redirects
- Located at `app/s/[slug]/route.ts`

## Features
- ✅ Custom aliases
- ✅ Click tracking and analytics
- ✅ User authentication
- ✅ Expiration dates (optional)
- ✅ Description/notes
- ✅ Bulk operations
- 🔄 QR code generation (coming soon)

## Troubleshooting

### Common Issues
1. **404 on short URLs**: Check if the route handler exists at `app/s/[slug]/route.ts`
2. **Redirect not working**: Verify the short code exists in the database
3. **Analytics not tracking**: Check if click tracking is working in the API

### Debug Steps
1. Check browser network tab for redirect response (should be 302)
2. Verify the short code in the database
3. Check server logs for any errors
4. Test with a simple URL like `https://google.com` 