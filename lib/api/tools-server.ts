import { eq, desc, and, isNotNull, sql } from 'drizzle-orm'
import { db } from '../db'
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
    customAlias: data.customAlias,
    description: data.description,
    expiresAt: data.expiresAt,
  }

  const [result] = await db.insert(shortenedUrls).values(newUrl).returning()
  return result as ShortenedUrlWithRelations
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
    .all()

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
  device?: string
  browser?: string
  os?: string
}): Promise<void> {
  // Insert click record
  const clickData: NewUrlClick = {
    shortenedUrlId: data.shortenedUrlId,
    ip: data.ip,
    userAgent: data.userAgent,
    referer: data.referer,
    country: data.country,
    city: data.city,
    device: data.device,
    browser: data.browser,
    os: data.os,
  }
  
  await db.insert(urlClicks).values(clickData)

  // Update click count
  await db
    .update(shortenedUrls)
    .set({
      clicks: sql`${shortenedUrls.clicks} + 1`,
      lastClickedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(shortenedUrls.id, data.shortenedUrlId))
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
    .all()

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
      lastScannedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    expiresAt: data.expiresAt,
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
    .all()

  // Get signers for each request
  const requestsWithSigners = await Promise.all(
    requests.map(async (request) => {
      const signers = await db
        .select()
        .from(documentSigners)
        .where(eq(documentSigners.signingRequestId, request.id))
        .all()
      
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
      accessedAt: new Date().toISOString(),
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
      signedAt: new Date().toISOString(),
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
    .all()

  const allSigned = allSigners.every(s => s.status === 'signed')
  
  if (allSigned) {
    // Update request status
    await db
      .update(signingRequests)
      .set({
        status: 'signed',
        completedAt: new Date().toISOString(),
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