import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-server'
import { siteSettings } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group')
    
    let settings
    if (group) {
      settings = await db.select().from(siteSettings).where(eq(siteSettings.group, group))
    } else {
      settings = await db.select().from(siteSettings)
    }
    
    // Convert to key-value format for easier consumption
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type,
        group: setting.group,
        label: setting.label,
        description: setting.description
      }
      return acc
    }, {} as Record<string, any>)
    
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }
    
    // Update or insert settings
    for (const [key, data] of Object.entries(settings)) {
      const settingData = data as any
      
      // Check if setting exists
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1)
      
      if (existing.length > 0) {
        // Update existing setting
        await db.update(siteSettings)
          .set({
            value: settingData.value,
            updatedAt: new Date()
          })
          .where(eq(siteSettings.key, key))
      } else {
        // Insert new setting
        await db.insert(siteSettings).values({
          key,
          value: settingData.value,
          type: settingData.type || 'text',
          group: settingData.group || 'general',
          label: settingData.label || key,
          description: settingData.description || '',
          order: settingData.order || 0
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, type, group, label, description, order } = body
    
    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }
    
    // Check if setting exists
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1)
    
    if (existing.length > 0) {
      // Update existing setting
      await db.update(siteSettings)
        .set({
          value: value || existing[0].value,
          type: type || existing[0].type,
          group: group || existing[0].group,
          label: label || existing[0].label,
          description: description || existing[0].description,
          order: order || existing[0].order,
          updatedAt: new Date()
        })
        .where(eq(siteSettings.key, key))
    } else {
      // Insert new setting
      await db.insert(siteSettings).values({
        key,
        value: value || '',
        type: type || 'text',
        group: group || 'general',
        label: label || key,
        description: description || '',
        order: order || 0
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      )
    }
    
    await db.delete(siteSettings).where(eq(siteSettings.key, key))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    )
  }
}