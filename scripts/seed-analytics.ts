import { db } from '../lib/db'
import { sessions, pageViews, apiRequests, dailyStats } from '../lib/schema'

async function seedAnalytics() {
  console.log('Seeding analytics data...')

  // Generate data for the last 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const devices = ['desktop', 'mobile', 'tablet']
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
  const sources = ['direct', 'google', 'facebook', 'twitter', 'linkedin']
  const pages = ['/admin/dashboard', '/admin/projects', '/admin/clients', '/admin/mail/inbox', '/admin/analytics', '/admin/settings']
  const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France']
  const cities = ['New York', 'London', 'Toronto', 'Berlin', 'Paris']

  // Generate sessions and page views
  const sessionData = []
  const pageViewData = []
  const apiRequestData = []

  for (let day = 0; day < 30; day++) {
    const date = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseTraffic = isWeekend ? 50 : 120 // Lower traffic on weekends
    const dailyVariation = Math.random() * 0.5 + 0.75 // 75-125% of base traffic
    const dailySessions = Math.floor(baseTraffic * dailyVariation)

    for (let session = 0; session < dailySessions; session++) {
      const sessionId = `session_${date.getTime()}_${session}`
      const device = devices[Math.floor(Math.random() * devices.length)]
      const browser = browsers[Math.floor(Math.random() * browsers.length)]
      const source = sources[Math.floor(Math.random() * sources.length)]
      const country = countries[Math.floor(Math.random() * countries.length)]
      const city = cities[Math.floor(Math.random() * cities.length)]
      
      // Generate session time (between 9 AM and 6 PM with peak at noon)
      const hour = Math.floor(9 + Math.random() * 9)
      const minute = Math.floor(Math.random() * 60)
      const sessionTime = new Date(date)
      sessionTime.setHours(hour, minute, 0, 0)

      const pageCount = Math.floor(Math.random() * 5) + 1 // 1-5 pages per session
      const sessionDuration = Math.floor(Math.random() * 1800) + 60 // 1-30 minutes
      const bounced = pageCount === 1 && sessionDuration < 120

      sessionData.push({
        id: sessionId,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: `${browser} Browser`,
        country,
        city,
        device,
        browser,
        os: device === 'mobile' ? 'iOS' : 'Windows',
        source,
        medium: source === 'direct' ? 'none' : source === 'google' ? 'search' : 'social',
        landingPage: pages[Math.floor(Math.random() * pages.length)],
        exitPage: pages[Math.floor(Math.random() * pages.length)],
        pageCount,
        duration: sessionDuration,
        bounced,
        converted: Math.random() < 0.05, // 5% conversion rate
        createdAt: sessionTime.toISOString(),
        updatedAt: sessionTime.toISOString(),
      })

      // Generate page views for this session
      let currentPagePath = pages[Math.floor(Math.random() * pages.length)]
      for (let page = 0; page < pageCount; page++) {
        const pageTime = new Date(sessionTime.getTime() + page * (sessionDuration / pageCount) * 1000)
        const pagePath = page === 0 ? currentPagePath : pages[Math.floor(Math.random() * pages.length)]
        
        pageViewData.push({
          sessionId,
          path: pagePath,
          title: `Admin ${pagePath.split('/').pop()?.charAt(0).toUpperCase()}${pagePath.split('/').pop()?.slice(1)}`,
          referrer: page === 0 ? (source === 'direct' ? '' : `https://${source}.com`) : '',
          userAgent: `${browser} Browser`,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          country,
          city,
          device,
          browser,
          os: device === 'mobile' ? 'iOS' : 'Windows',
          source,
          medium: source === 'direct' ? 'none' : source === 'google' ? 'search' : 'social',
          duration: Math.floor(sessionDuration / pageCount),
          createdAt: pageTime.toISOString(),
        })
        currentPagePath = pagePath
      }

      // Generate API requests for this session
      const apiRequestCount = Math.floor(Math.random() * 10) + 5 // 5-15 API requests per session
      for (let api = 0; api < apiRequestCount; api++) {
        const apiTime = new Date(sessionTime.getTime() + Math.random() * sessionDuration * 1000)
        const methods = ['GET', 'POST', 'PUT', 'DELETE']
        const paths = ['/api/projects', '/api/clients', '/api/mail/emails', '/api/analytics/traffic', '/api/settings']
        const statusCodes = [200, 200, 200, 200, 201, 400, 404, 500] // Mostly successful
        
        apiRequestData.push({
          sessionId,
          method: methods[Math.floor(Math.random() * methods.length)],
          path: paths[Math.floor(Math.random() * paths.length)],
          statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
          responseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
          userAgent: `${browser} Browser`,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          referer: currentPagePath,
          requestSize: Math.floor(Math.random() * 1000),
          responseSize: Math.floor(Math.random() * 5000) + 500,
          createdAt: apiTime.toISOString(),
        })
      }
    }
  }

  // Insert data in batches
  console.log(`Inserting ${sessionData.length} sessions...`)
  for (let i = 0; i < sessionData.length; i += 100) {
    const batch = sessionData.slice(i, i + 100)
    await db.insert(sessions).values(batch)
  }

  console.log(`Inserting ${pageViewData.length} page views...`)
  for (let i = 0; i < pageViewData.length; i += 100) {
    const batch = pageViewData.slice(i, i + 100)
    await db.insert(pageViews).values(batch)
  }

  console.log(`Inserting ${apiRequestData.length} API requests...`)
  for (let i = 0; i < apiRequestData.length; i += 100) {
    const batch = apiRequestData.slice(i, i + 100)
    await db.insert(apiRequests).values(batch)
  }

  console.log('Analytics data seeding completed!')
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedAnalytics().catch(console.error)
}

export { seedAnalytics }