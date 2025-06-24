import { db } from './db'
import { pageViews, sessions, apiRequests, dailyStats, activeVisitors } from './schema'
import { eq, and, or, desc, asc, sql, gte, lte, count, avg, sum } from 'drizzle-orm'

// Helper function to get device type from user agent
export function getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase()
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile'
  return 'desktop'
}

// Helper function to get browser from user agent
export function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('chrome')) return 'Chrome'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('safari')) return 'Safari'
  if (ua.includes('edge')) return 'Edge'
  if (ua.includes('opera')) return 'Opera'
  return 'Other'
}

// Helper function to get OS from user agent
export function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('mac')) return 'MacOS'
  if (ua.includes('linux')) return 'Linux'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
  return 'Other'
}

// Helper function to determine traffic source
export function getTrafficSource(referrer: string): { source: string; medium: string } {
  if (!referrer || referrer === '') {
    return { source: 'direct', medium: 'none' }
  }

  const ref = referrer.toLowerCase()
  
  // Social media
  if (ref.includes('facebook')) return { source: 'facebook', medium: 'social' }
  if (ref.includes('twitter') || ref.includes('t.co')) return { source: 'twitter', medium: 'social' }
  if (ref.includes('linkedin')) return { source: 'linkedin', medium: 'social' }
  if (ref.includes('instagram')) return { source: 'instagram', medium: 'social' }
  if (ref.includes('youtube')) return { source: 'youtube', medium: 'social' }
  
  // Search engines
  if (ref.includes('google')) return { source: 'google', medium: 'search' }
  if (ref.includes('bing')) return { source: 'bing', medium: 'search' }
  if (ref.includes('yahoo')) return { source: 'yahoo', medium: 'search' }
  if (ref.includes('duckduckgo')) return { source: 'duckduckgo', medium: 'search' }
  
  return { source: new URL(referrer).hostname, medium: 'referral' }
}

// Track page view
export async function trackPageView(data: {
  sessionId: string
  userId?: number
  path: string
  title?: string
  referrer?: string
  userAgent: string
  ip: string
  country?: string
  city?: string
}) {
  const device = getDeviceType(data.userAgent)
  const browser = getBrowser(data.userAgent)
  const os = getOS(data.userAgent)
  const { source, medium } = getTrafficSource(data.referrer || '')

  await db.insert(pageViews).values({
    sessionId: data.sessionId,
    userId: data.userId,
    path: data.path,
    title: data.title,
    referrer: data.referrer,
    userAgent: data.userAgent,
    ip: data.ip,
    country: data.country,
    city: data.city,
    device,
    browser,
    os,
    source,
    medium,
  })

  // Update session page count
  await db
    .update(sessions)
    .set({ 
      pageCount: sql`page_count + 1`,
      updatedAt: new Date().toISOString(),
      exitPage: data.path
    })
    .where(eq(sessions.id, data.sessionId))
}

// Create or update session
export async function trackSession(data: {
  sessionId: string
  userId?: number
  userAgent: string
  ip: string
  country?: string
  city?: string
  referrer?: string
  landingPage: string
}) {
  const device = getDeviceType(data.userAgent)
  const browser = getBrowser(data.userAgent)
  const os = getOS(data.userAgent)
  const { source, medium } = getTrafficSource(data.referrer || '')

  // Check if session already exists
  const existingSession = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, data.sessionId))
    .limit(1)

  if (existingSession.length === 0) {
    // Create new session
    await db.insert(sessions).values({
      id: data.sessionId,
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      country: data.country,
      city: data.city,
      device,
      browser,
      os,
      source,
      medium,
      landingPage: data.landingPage,
      exitPage: data.landingPage,
    })
  } else {
    // Update existing session
    await db
      .update(sessions)
      .set({ 
        updatedAt: new Date().toISOString(),
        exitPage: data.landingPage
      })
      .where(eq(sessions.id, data.sessionId))
  }
}

// Track API request
export async function trackApiRequest(data: {
  sessionId?: string
  userId?: number
  method: string
  path: string
  statusCode: number
  responseTime?: number
  userAgent?: string
  ip?: string
  referer?: string
  errorMessage?: string
  requestSize?: number
  responseSize?: number
}) {
  await db.insert(apiRequests).values(data)
}

// Get analytics data for dashboard
export async function getAnalyticsData(dateRange: { from: string; to: string }) {
  const fromDate = new Date(dateRange.from).toISOString()
  const toDate = new Date(dateRange.to).toISOString()

  // Get total sessions and page views
  const [sessionStats] = await db
    .select({
      totalSessions: count(sessions.id),
      uniqueVisitors: sql<number>`COUNT(DISTINCT ${sessions.ip})`,
    })
    .from(sessions)
    .where(and(
      gte(sessions.createdAt, fromDate),
      lte(sessions.createdAt, toDate)
    ))

  const [pageViewStats] = await db
    .select({
      totalPageViews: count(pageViews.id),
      avgPageViews: avg(sql<number>`CAST(${sessions.pageCount} AS REAL)`),
    })
    .from(pageViews)
    .leftJoin(sessions, eq(pageViews.sessionId, sessions.id))
    .where(and(
      gte(pageViews.createdAt, fromDate),
      lte(pageViews.createdAt, toDate)
    ))

  // Get device breakdown
  const deviceStats = await db
    .select({
      device: sessions.device,
      count: count(sessions.id),
    })
    .from(sessions)
    .where(and(
      gte(sessions.createdAt, fromDate),
      lte(sessions.createdAt, toDate)
    ))
    .groupBy(sessions.device)

  // Get traffic sources
  const sourceStats = await db
    .select({
      source: sessions.source,
      count: count(sessions.id),
    })
    .from(sessions)
    .where(and(
      gte(sessions.createdAt, fromDate),
      lte(sessions.createdAt, toDate)
    ))
    .groupBy(sessions.source)
    .orderBy(desc(count(sessions.id)))
    .limit(5)

  // Get top pages
  const topPages = await db
    .select({
      path: pageViews.path,
      count: count(pageViews.id),
    })
    .from(pageViews)
    .where(and(
      gte(pageViews.createdAt, fromDate),
      lte(pageViews.createdAt, toDate)
    ))
    .groupBy(pageViews.path)
    .orderBy(desc(count(pageViews.id)))
    .limit(10)

  // Get daily traffic data
  const dailyTraffic = await db
    .select({
      date: sql<string>`DATE(${sessions.createdAt})`,
      desktop: sql<number>`SUM(CASE WHEN ${sessions.device} = 'desktop' THEN 1 ELSE 0 END)`,
      mobile: sql<number>`SUM(CASE WHEN ${sessions.device} = 'mobile' THEN 1 ELSE 0 END)`,
      tablet: sql<number>`SUM(CASE WHEN ${sessions.device} = 'tablet' THEN 1 ELSE 0 END)`,
    })
    .from(sessions)
    .where(and(
      gte(sessions.createdAt, fromDate),
      lte(sessions.createdAt, toDate)
    ))
    .groupBy(sql`DATE(${sessions.createdAt})`)
    .orderBy(asc(sql`DATE(${sessions.createdAt})`))

  // Get hourly traffic pattern
  const hourlyTraffic = await db
    .select({
      hour: sql<string>`strftime('%H:00', ${sessions.createdAt})`,
      desktop: sql<number>`SUM(CASE WHEN ${sessions.device} = 'desktop' THEN 1 ELSE 0 END)`,
      mobile: sql<number>`SUM(CASE WHEN ${sessions.device} = 'mobile' THEN 1 ELSE 0 END)`,
    })
    .from(sessions)
    .where(and(
      gte(sessions.createdAt, fromDate),
      lte(sessions.createdAt, toDate)
    ))
    .groupBy(sql`strftime('%H', ${sessions.createdAt})`)
    .orderBy(asc(sql`strftime('%H', ${sessions.createdAt})`))

  // Calculate bounce rate
  const [bounceRateStats] = await db
    .select({
      totalSessions: count(sessions.id),
      bouncedSessions: sql<number>`SUM(CASE WHEN ${sessions.bounced} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(sessions)
    .where(and(
      gte(sessions.createdAt, fromDate),
      lte(sessions.createdAt, toDate)
    ))

  const bounceRate = bounceRateStats.totalSessions > 0 
    ? (bounceRateStats.bouncedSessions / bounceRateStats.totalSessions) * 100 
    : 0

  return {
    totalSessions: sessionStats.totalSessions,
    totalPageViews: pageViewStats.totalPageViews,
    uniqueVisitors: sessionStats.uniqueVisitors,
    avgPageViews: pageViewStats.avgPageViews || 0,
    bounceRate: bounceRate.toFixed(1),
    deviceStats,
    sourceStats,
    topPages,
    dailyTraffic,
    hourlyTraffic,
  }
}

// Get API analytics
export async function getApiAnalytics(dateRange: { from: string; to: string }) {
  const fromDate = new Date(dateRange.from).toISOString()
  const toDate = new Date(dateRange.to).toISOString()

  // Get total API requests
  const [requestStats] = await db
    .select({
      totalRequests: count(apiRequests.id),
      avgResponseTime: avg(apiRequests.responseTime),
    })
    .from(apiRequests)
    .where(and(
      gte(apiRequests.createdAt, fromDate),
      lte(apiRequests.createdAt, toDate)
    ))

  // Get requests by status code
  const statusStats = await db
    .select({
      statusCode: apiRequests.statusCode,
      count: count(apiRequests.id),
    })
    .from(apiRequests)
    .where(and(
      gte(apiRequests.createdAt, fromDate),
      lte(apiRequests.createdAt, toDate)
    ))
    .groupBy(apiRequests.statusCode)
    .orderBy(desc(count(apiRequests.id)))

  // Get most popular endpoints
  const endpointStats = await db
    .select({
      path: apiRequests.path,
      method: apiRequests.method,
      count: count(apiRequests.id),
      avgResponseTime: avg(apiRequests.responseTime),
    })
    .from(apiRequests)
    .where(and(
      gte(apiRequests.createdAt, fromDate),
      lte(apiRequests.createdAt, toDate)
    ))
    .groupBy(apiRequests.path, apiRequests.method)
    .orderBy(desc(count(apiRequests.id)))
    .limit(10)

  // Get daily API request trends
  const dailyApiRequests = await db
    .select({
      date: sql<string>`DATE(${apiRequests.createdAt})`,
      requests: count(apiRequests.id),
      errors: sql<number>`SUM(CASE WHEN ${apiRequests.statusCode} >= 400 THEN 1 ELSE 0 END)`,
    })
    .from(apiRequests)
    .where(and(
      gte(apiRequests.createdAt, fromDate),
      lte(apiRequests.createdAt, toDate)
    ))
    .groupBy(sql`DATE(${apiRequests.createdAt})`)
    .orderBy(asc(sql`DATE(${apiRequests.createdAt})`))

  return {
    totalRequests: requestStats.totalRequests,
    avgResponseTime: requestStats.avgResponseTime || 0,
    statusStats,
    endpointStats,
    dailyApiRequests,
  }
}

// Update active visitors
export async function updateActiveVisitor(data: {
  sessionId: string
  userId?: number
  currentPage: string
  ip: string
  country?: string
  city?: string
  device: string
  browser: string
  source: string
}) {
  await db.insert(activeVisitors).values({
    ...data,
    lastSeen: new Date().toISOString(),
  }).onConflictDoUpdate({
    target: activeVisitors.sessionId,
    set: {
      currentPage: data.currentPage,
      lastSeen: new Date().toISOString(),
    }
  })
}

// Get active visitors count
export async function getActiveVisitorsCount(): Promise<number> {
  // Consider visitors active if they were seen in the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  
  const [result] = await db
    .select({ count: count(activeVisitors.sessionId) })
    .from(activeVisitors)
    .where(gte(activeVisitors.lastSeen, fiveMinutesAgo))

  return result.count
}

// Clean up old active visitors (should be run periodically)
export async function cleanupActiveVisitors() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  await db
    .delete(activeVisitors)
    .where(lte(activeVisitors.lastSeen, oneHourAgo))
}