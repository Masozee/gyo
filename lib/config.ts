export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
};

// Refresh intervals (in milliseconds) to prevent excessive API calls in production
export const REFRESH_INTERVALS = {
  // Dashboard analytics refresh - 5 minutes (was 30 seconds)
  DASHBOARD_ANALYTICS: 5 * 60 * 1000,
  
  // Email counts refresh - 2 minutes (was 30 seconds)
  EMAIL_COUNTS: 2 * 60 * 1000,
  
  // General data refresh for other components - 1 minute
  GENERAL_DATA: 60 * 1000,
  
  // Cache duration for API responses - 5 minutes
  API_CACHE_DURATION: 5 * 60 * 1000,
} as const 