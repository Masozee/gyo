import { eq, desc, and, isNotNull, sql } from 'drizzle-orm'
import { db } from '../db-server'
import { UAParser } from 'ua-parser-js'
import { 
  shortenedUrls, 
  urlClicks, 
  qrCodes, 
  qrCodeScans, 
  signingRequests,
  documentSigners,
  signingEvents,
  type NewShortenedUrl,
  type NewUrlClick,
  type NewQrCode,
  type NewQrCodeScan,
  type NewSigningRequest,
  type NewDocumentSigner,
  type NewSigningEvent,
  type ShortenedUrlWithRelations,
  type QrCodeWithRelations,
  type SigningRequestWithRelations
} from '../schema'

// ─── URL Shortener Functions ───

export async function createShortenedUrl(data: {
  userId: number
  originalUrl: string
  customAlias?: string
  description?: string
  expiresAt?: string
}): Promise<ShortenedUrlWithRelations> {
  try {
    // Generate short code if no custom alias provided
    const shortCode = data.customAlias || generateShortCode()
    
    // Check if alias/shortcode already exists
    const [existing] = await db
      .select()
      .from(shortenedUrls)
      .where(
        data.customAlias 
          ? eq(shortenedUrls.customAlias, data.customAlias)
          : eq(shortenedUrls.shortCode, shortCode)
      )
      .limit(1)
    
    if (existing) {
      throw new Error('Short code or alias already exists')
    }

    const newUrl: NewShortenedUrl = {
      userId: data.userId,
      originalUrl: data.originalUrl,
      shortCode,
      customAlias: data.customAlias || null,
      description: data.description || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }

    const [result] = await db.insert(shortenedUrls).values(newUrl).returning()
    
    return result as ShortenedUrlWithRelations
  } catch (error) {
    console.error('Error in createShortenedUrl:', error)
    throw error
  }
}

export async function getShortenedUrls(userId: number): Promise<ShortenedUrlWithRelations[]> {
  const results = await db
    .select({
      id: shortenedUrls.id,
      userId: shortenedUrls.userId,
      originalUrl: shortenedUrls.originalUrl,
      shortCode: shortenedUrls.shortCode,
      customAlias: shortenedUrls.customAlias,
      description: shortenedUrls.description,
      clicks: shortenedUrls.clicks,
      uniqueClicks: shortenedUrls.uniqueClicks,
      lastClickedAt: shortenedUrls.lastClickedAt,
      isActive: shortenedUrls.isActive,
      expiresAt: shortenedUrls.expiresAt,
      qrCodeUrl: shortenedUrls.qrCodeUrl,
      createdAt: shortenedUrls.createdAt,
      updatedAt: shortenedUrls.updatedAt,
    })
    .from(shortenedUrls)
    .where(eq(shortenedUrls.userId, userId))
    .orderBy(desc(shortenedUrls.createdAt))

  return results as ShortenedUrlWithRelations[]
}

export async function getShortenedUrlByCode(shortCode: string): Promise<ShortenedUrlWithRelations | null> {
  const [result] = await db
    .select()
    .from(shortenedUrls)
    .where(
      and(
        eq(shortenedUrls.shortCode, shortCode),
        eq(shortenedUrls.isActive, true)
      )
    )
    .limit(1)

  return result as ShortenedUrlWithRelations || null
}

export async function trackUrlClick(data: {
  shortenedUrlId: number
  ip?: string
  userAgent?: string
  referer?: string
  country?: string
  city?: string
}): Promise<void> {
  // Parse user agent for device/browser/OS info
  let device = 'Unknown'
  let browser = 'Unknown'
  let os = 'Unknown'
  
  if (data.userAgent) {
    try {
      const parser = new UAParser(data.userAgent)
      const result = parser.getResult()
      
      // Determine device type
      if (result.device.type) {
        device = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)
      } else if (result.os.name?.toLowerCase().includes('mobile') || 
                 result.os.name?.toLowerCase().includes('android') ||
                 result.os.name?.toLowerCase().includes('ios')) {
        device = 'Mobile'
      } else {
        device = 'Desktop'
      }
      
      // Get browser name
      if (result.browser.name) {
        browser = result.browser.name
      }
      
      // Get OS name
      if (result.os.name) {
        os = result.os.name
      }
    } catch (error) {
      console.error('Error parsing user agent:', error)
    }
  }

  // Insert click record
  const clickData: NewUrlClick = {
    shortenedUrlId: data.shortenedUrlId,
    ip: data.ip,
    userAgent: data.userAgent,
    referer: data.referer,
    country: data.country || 'Unknown',
    city: data.city,
    device,
    browser,
    os,
  }
  
  await db.insert(urlClicks).values(clickData)

  // Update click count
  await db
    .update(shortenedUrls)
    .set({
      clicks: sql`${shortenedUrls.clicks} + 1`,
      lastClickedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(shortenedUrls.id, data.shortenedUrlId))
}

export async function getUrlAnalytics(id: number, userId: number): Promise<{
  url: ShortenedUrlWithRelations
  totalClicks: number
  uniqueClicks: number
  clicksByDate: Array<{ date: string; clicks: number }>
  clicksByCountry: Array<{ country: string; clicks: number }>
  clicksByDevice: Array<{ device: string; clicks: number }>
  clicksByBrowser: Array<{ browser: string; clicks: number }>
  recentClicks: Array<{
    id: number
    ip?: string
    country?: string
    device?: string
    browser?: string
    referer?: string
    clickedAt: string
  }>
} | null> {
  // Get the URL
  const [url] = await db
    .select()
    .from(shortenedUrls)
    .where(
      and(
        eq(shortenedUrls.id, id),
        eq(shortenedUrls.userId, userId)
      )
    )
    .limit(1)

  if (!url) return null

  // Get total clicks
  const totalClicks = url.clicks || 0

  // Get unique clicks (count distinct IPs)
  const [uniqueResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${urlClicks.ip})` })
    .from(urlClicks)
    .where(eq(urlClicks.shortenedUrlId, id))

  const uniqueClicks = uniqueResult?.count || 0

  // Get clicks by date (last 30 days)
  const clicksByDate = await db
    .select({
      date: sql<string>`DATE(${urlClicks.clickedAt})`.as('date'),
      clicks: sql<number>`COUNT(*)`.as('clicks')
    })
    .from(urlClicks)
    .where(
      and(
        eq(urlClicks.shortenedUrlId, id),
        sql`${urlClicks.clickedAt} >= DATE('now', '-30 days')`
      )
    )
    .groupBy(sql`DATE(${urlClicks.clickedAt})`)
    .orderBy(sql`DATE(${urlClicks.clickedAt}) DESC`)

  // Get clicks by country
  const clicksByCountry = await db
    .select({
      country: urlClicks.country,
      clicks: sql<number>`COUNT(*)`.as('clicks')
    })
    .from(urlClicks)
    .where(
      and(
        eq(urlClicks.shortenedUrlId, id),
        isNotNull(urlClicks.country)
      )
    )
    .groupBy(urlClicks.country)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10)

  // Get clicks by device
  const clicksByDevice = await db
    .select({
      device: urlClicks.device,
      clicks: sql<number>`COUNT(*)`.as('clicks')
    })
    .from(urlClicks)
    .where(
      and(
        eq(urlClicks.shortenedUrlId, id),
        isNotNull(urlClicks.device)
      )
    )
    .groupBy(urlClicks.device)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5)

  // Get clicks by browser
  const clicksByBrowser = await db
    .select({
      browser: urlClicks.browser,
      clicks: sql<number>`COUNT(*)`.as('clicks')
    })
    .from(urlClicks)
    .where(
      and(
        eq(urlClicks.shortenedUrlId, id),
        isNotNull(urlClicks.browser)
      )
    )
    .groupBy(urlClicks.browser)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5)

  // Get recent clicks
  const recentClicks = await db
    .select({
      id: urlClicks.id,
      ip: urlClicks.ip,
      country: urlClicks.country,
      device: urlClicks.device,
      browser: urlClicks.browser,
      referer: urlClicks.referer,
      clickedAt: urlClicks.clickedAt,
    })
    .from(urlClicks)
    .where(eq(urlClicks.shortenedUrlId, id))
    .orderBy(desc(urlClicks.clickedAt))
    .limit(50)

  return {
    url: url as ShortenedUrlWithRelations,
    totalClicks,
    uniqueClicks,
    clicksByDate: clicksByDate.map(row => ({
      date: row.date || '',
      clicks: row.clicks || 0
    })),
    clicksByCountry: clicksByCountry.map(row => ({
      country: row.country || 'Unknown',
      clicks: row.clicks || 0
    })),
    clicksByDevice: clicksByDevice.map(row => ({
      device: row.device || 'Unknown',
      clicks: row.clicks || 0
    })),
    clicksByBrowser: clicksByBrowser.map(row => ({
      browser: row.browser || 'Unknown',
      clicks: row.clicks || 0
    })),
    recentClicks: recentClicks.map(row => ({
      id: row.id,
      ip: row.ip || undefined,
      country: row.country || undefined,
      device: row.device || undefined,
      browser: row.browser || undefined,
      referer: row.referer || undefined,
      clickedAt: row.clickedAt ? (row.clickedAt instanceof Date ? row.clickedAt.toISOString() : row.clickedAt) : ''
    }))
  }
}

export async function deleteShortenedUrl(id: number, userId: number): Promise<boolean> {
  try {
    await db
      .delete(shortenedUrls)
      .where(
        and(
          eq(shortenedUrls.id, id),
          eq(shortenedUrls.userId, userId)
        )
      )

    return true
  } catch (error) {
    console.error('Error deleting shortened URL:', error)
    return false
  }
}

// ─── QR Code Functions ───

export async function createQrCode(data: {
  userId: number
  name: string
  type: string
  data: string
  size?: number
  foregroundColor?: string
  backgroundColor?: string
  errorCorrectionLevel?: string
  format?: string
  shortenedUrlId?: number
}): Promise<QrCodeWithRelations> {
  // Generate QR code image (this would integrate with a QR library)
  const qrCodeUrl = await generateQrCodeImage(data)

  const newQrCode: NewQrCode = {
    userId: data.userId,
    name: data.name,
    type: data.type,
    data: data.data,
    size: data.size || 256,
    foregroundColor: data.foregroundColor || '#000000',
    backgroundColor: data.backgroundColor || '#ffffff',
    errorCorrectionLevel: data.errorCorrectionLevel || 'M',
    format: data.format || 'png',
    qrCodeUrl,
    shortenedUrlId: data.shortenedUrlId,
  }

  const [result] = await db.insert(qrCodes).values(newQrCode).returning()
  return result as QrCodeWithRelations
}

export async function getQrCodes(userId: number): Promise<QrCodeWithRelations[]> {
  const results = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId))
    .orderBy(desc(qrCodes.createdAt))
    

  return results as QrCodeWithRelations[]
}

export async function trackQrCodeScan(data: {
  qrCodeId: number
  ip?: string
  userAgent?: string
  country?: string
  city?: string
  device?: string
  browser?: string
  os?: string
}): Promise<void> {
  // Insert scan record
  const scanData: NewQrCodeScan = {
    qrCodeId: data.qrCodeId,
    ip: data.ip,
    userAgent: data.userAgent,
    country: data.country,
    city: data.city,
    device: data.device,
    browser: data.browser,
    os: data.os,
  }
  
  await db.insert(qrCodeScans).values(scanData)

  // Update scan count
  await db
    .update(qrCodes)
    .set({
      scans: sql`${qrCodes.scans} + 1`,
      lastScannedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.id, data.qrCodeId))
}

export async function deleteQrCode(id: number, userId: number): Promise<boolean> {
  try {
    await db
      .delete(qrCodes)
      .where(
        and(
          eq(qrCodes.id, id),
          eq(qrCodes.userId, userId)
        )
      )

    return true
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return false
  }
}

// ─── Document Signing Functions ───

export async function createSigningRequest(data: {
  userId: number
  documentName: string
  documentUrl: string
  documentSize?: number
  documentType?: string
  title: string
  message?: string
  expiresAt: string
  signers: Array<{
    name: string
    email: string
    role?: string
    signingOrder?: number
  }>
}): Promise<SigningRequestWithRelations> {
  // Create the signing request
  const newRequest: NewSigningRequest = {
    userId: data.userId,
    documentName: data.documentName,
    documentUrl: data.documentUrl,
    documentSize: data.documentSize,
    documentType: data.documentType,
    title: data.title,
    message: data.message,
    expiresAt: new Date(data.expiresAt),
  }

  const [request] = await db.insert(signingRequests).values(newRequest).returning()

  // Create signers
  const signers = await Promise.all(
    data.signers.map(async (signer, index) => {
      const signerData: NewDocumentSigner = {
        signingRequestId: request.id,
        name: signer.name,
        email: signer.email,
        role: signer.role || 'Signer',
        signingOrder: signer.signingOrder || index + 1,
        accessToken: generateAccessToken(),
      }
      const [createdSigner] = await db.insert(documentSigners).values(signerData).returning()
      return createdSigner
    })
  )

  // Create initial event
  const eventData: NewSigningEvent = {
    signingRequestId: request.id,
    eventType: 'created',
    eventData: JSON.stringify({ signerCount: signers.length }),
  }
  await db.insert(signingEvents).values(eventData)

  return {
    ...request,
    signers,
  } as SigningRequestWithRelations
}

export async function getSigningRequests(userId: number): Promise<SigningRequestWithRelations[]> {
  const requests = await db
    .select()
    .from(signingRequests)
    .where(eq(signingRequests.userId, userId))
    .orderBy(desc(signingRequests.createdAt))
    

  // Get signers for each request
  const requestsWithSigners = await Promise.all(
    requests.map(async (request) => {
      const signers = await db
        .select()
        .from(documentSigners)
        .where(eq(documentSigners.signingRequestId, request.id))
        
      
      return {
        ...request,
        signers,
      }
    })
  )

  return requestsWithSigners as SigningRequestWithRelations[]
}

export async function getSigningRequestByToken(accessToken: string): Promise<{
  request: SigningRequestWithRelations
  signer: any
} | null> {
  const [signer] = await db
    .select()
    .from(documentSigners)
    .where(eq(documentSigners.accessToken, accessToken))
    .limit(1)

  if (!signer) return null

  const [request] = await db
    .select()
    .from(signingRequests)
    .where(eq(signingRequests.id, signer.signingRequestId))
    .limit(1)

  if (!request) return null

  // Track access
  await db
    .update(documentSigners)
    .set({
      accessedAt: new Date(),
      accessCount: sql`${documentSigners.accessCount} + 1`,
    })
    .where(eq(documentSigners.id, signer.id))

  // Create access event
  const eventData: NewSigningEvent = {
    signingRequestId: request.id,
    signerId: signer.id,
    eventType: 'viewed',
  }
  await db.insert(signingEvents).values(eventData)

  return {
    request: request as SigningRequestWithRelations,
    signer,
  }
}

export async function signDocument(data: {
  accessToken: string
  signatureData: string
  signatureType: string
  ipAddress?: string
  userAgent?: string
}): Promise<boolean> {
  const [signer] = await db
    .select()
    .from(documentSigners)
    .where(eq(documentSigners.accessToken, data.accessToken))
    .limit(1)

  if (!signer || signer.status !== 'pending') {
    return false
  }

  // Update signer
  await db
    .update(documentSigners)
    .set({
      status: 'signed',
      signedAt: new Date(),
      signatureData: data.signatureData,
      signatureType: data.signatureType,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .where(eq(documentSigners.id, signer.id))

  // Create signing event
  const eventData: NewSigningEvent = {
    signingRequestId: signer.signingRequestId,
    signerId: signer.id,
    eventType: 'signed',
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  }
  await db.insert(signingEvents).values(eventData)

  // Check if all signers have signed
  const allSigners = await db
    .select()
    .from(documentSigners)
    .where(eq(documentSigners.signingRequestId, signer.signingRequestId))
    

  const allSigned = allSigners.every(s => s.status === 'signed')
  
  if (allSigned) {
    // Update request status
    await db
      .update(signingRequests)
      .set({
        status: 'signed',
        completedAt: new Date(),
      })
      .where(eq(signingRequests.id, signer.signingRequestId))

    // Create completion event
    const completionEvent: NewSigningEvent = {
      signingRequestId: signer.signingRequestId,
      eventType: 'completed',
    }
    await db.insert(signingEvents).values(completionEvent)
  }

  return true
}

// ─── Utility Functions ───

function generateShortCode(length: number = 7): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateAccessToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

async function generateQrCodeImage(data: {
  data: string
  size?: number
  foregroundColor?: string
  backgroundColor?: string
  errorCorrectionLevel?: string
  format?: string
}): Promise<string> {
  // This is a placeholder - in a real implementation, you would:
  // 1. Use a QR code library like 'qrcode' to generate the actual QR code
  // 2. Save the image to cloud storage (AWS S3, Cloudflare R2, etc.)
  // 3. Return the public URL
  
  // For now, return a placeholder URL
  const timestamp = Date.now()
  const filename = `qr-${timestamp}.${data.format || 'png'}`
  return `/uploads/qr-codes/${filename}`
}

// ─── URL Redirect Handler ───
export async function handleUrlRedirect(shortCode: string, clientInfo: {
  ip?: string
  userAgent?: string
  referer?: string
}): Promise<string | null> {
  const url = await getShortenedUrlByCode(shortCode)
  
  if (!url) return null
  
  // Check if expired
  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    return null
  }

  // Track the click
  await trackUrlClick({
    shortenedUrlId: url.id,
    ...clientInfo,
  })

  return url.originalUrl
}

// ─── YouTube Downloader Functions ───

interface YouTubeVideoInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  channelName: string
  viewCount: string
  uploadDate: string
  formats: YouTubeFormat[]
}

interface YouTubeFormat {
  quality: string
  format: string
  url: string
  filesize?: string
  type: 'video' | 'audio'
}

export async function getYouTubeVideoInfo(url: string): Promise<YouTubeVideoInfo | null> {
  try {
    // Dynamic import to avoid issues with Edge runtime
    const ytdl = (await import('@distube/ytdl-core')).default
    
    // Validate URL
    if (!ytdl.validateURL(url)) {
      throw new Error('Invalid YouTube URL')
    }

    // Get video info
    const info = await ytdl.getInfo(url)
    const videoDetails = info.videoDetails
    
    // Extract available formats
    const formats: YouTubeFormat[] = []
    
    // Add video formats
    const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
    for (const format of videoFormats) {
      if (format.qualityLabel) {
        formats.push({
          quality: format.qualityLabel,
          format: format.container || 'mp4',
          url: `/api/tools/youtube/stream?url=${encodeURIComponent(url)}&itag=${format.itag}&type=video`,
          filesize: format.contentLength ? `~${Math.round(parseInt(format.contentLength) / 1024 / 1024)}MB` : 'Unknown',
          type: 'video'
        })
      }
    }
    
    // Add audio-only formats
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
    for (const format of audioFormats.slice(0, 2)) { // Take first 2 audio formats
      formats.push({
        quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'High',
        format: 'mp3',
        url: `/api/tools/youtube/stream?url=${encodeURIComponent(url)}&itag=${format.itag}&type=audio`,
        filesize: format.contentLength ? `~${Math.round(parseInt(format.contentLength) / 1024 / 1024)}MB` : 'Unknown',
        type: 'audio'
      })
    }

    return {
      id: videoDetails.videoId,
      title: videoDetails.title || 'Unknown Title',
      description: videoDetails.description?.substring(0, 500) || 'No description available',
      thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || '',
      duration: formatDuration(parseInt(videoDetails.lengthSeconds || '0')),
      channelName: typeof videoDetails.author === 'string' ? videoDetails.author : videoDetails.author?.name || 'Unknown Channel',
      viewCount: parseInt(videoDetails.viewCount || '0').toLocaleString(),
      uploadDate: videoDetails.publishDate || 'Unknown',
      formats
    }
  } catch (error) {
    console.error('Error getting YouTube video info:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function downloadYouTubeVideo(url: string, itag: string, type: 'video' | 'audio'): Promise<{
  success: boolean
  stream?: any
  filename?: string
  message: string
}> {
  try {
    // Dynamic import to avoid issues with Edge runtime
    const ytdl = (await import('@distube/ytdl-core')).default
    
    // Validate URL
    if (!ytdl.validateURL(url)) {
      return {
        success: false,
        message: 'Invalid YouTube URL'
      }
    }

    // Get video info for filename
    const info = await ytdl.getInfo(url)
    const videoDetails = info.videoDetails
    
    // Clean filename
    const cleanTitle = videoDetails.title?.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'video'
    const extension = type === 'audio' ? 'mp3' : 'mp4'
    const filename = `${cleanTitle}.${extension}`
    
    // Create download stream
    const options = {
      quality: itag,
      filter: type === 'audio' ? 'audioonly' as const : 'videoandaudio' as const
    }
    
    const stream = ytdl(url, options)
    
    return {
      success: true,
      stream,
      filename,
      message: 'Download started successfully'
    }
  } catch (error) {
    console.error('Error processing YouTube download:', error)
    return {
      success: false,
      message: 'Failed to process download request'
    }
  }
}

export async function getYouTubeStreamInfo(url: string, itag: string): Promise<{
  success: boolean
  stream?: any
  contentType?: string
  filename?: string
  message: string
}> {
  try {
    // Dynamic import to avoid issues with Edge runtime
    const ytdl = (await import('@distube/ytdl-core')).default
    
    // Validate URL
    if (!ytdl.validateURL(url)) {
      return {
        success: false,
        message: 'Invalid YouTube URL'
      }
    }

    // Get video info
    const info = await ytdl.getInfo(url)
    const videoDetails = info.videoDetails
    
    // Find the specific format
    const format = info.formats.find(f => f.itag.toString() === itag)
    if (!format) {
      return {
        success: false,
        message: 'Format not found'
      }
    }
    
    // Clean filename
    const cleanTitle = videoDetails.title?.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'video'
    const extension = format.container || (format.mimeType?.includes('audio') ? 'mp3' : 'mp4')
    const filename = `${cleanTitle}.${extension}`
    
    // Create stream
    const stream = ytdl(url, { quality: itag })
    
    return {
      success: true,
      stream,
      contentType: format.mimeType || 'video/mp4',
      filename,
      message: 'Stream ready'
    }
  } catch (error) {
    console.error('Error getting YouTube stream:', error)
    return {
      success: false,
      message: 'Failed to get stream'
    }
  }
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}