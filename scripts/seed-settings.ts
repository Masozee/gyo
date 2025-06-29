import { db } from '../lib/db'
import { siteSettings } from '../lib/schema'

async function seedSettings() {
  try {
    console.log('🌱 Seeding default settings...')
    
    const defaultSettings = [
      // General Settings
      {
        key: 'site_name',
        value: 'Developer Portfolio',
        type: 'text',
        group: 'general',
        label: 'Site Name',
        description: 'The name of your portfolio website',
        order: 1
      },
      {
        key: 'site_description',
        value: 'Full-stack developer specializing in Django, Next.js, TypeScript, and UI/UX design',
        type: 'textarea',
        group: 'general',
        label: 'Site Description',
        description: 'Brief description of your site',
        order: 2
      },
      {
        key: 'site_url',
        value: 'https://yoursite.com',
        type: 'url',
        group: 'general',
        label: 'Site URL',
        description: 'The main URL of your website',
        order: 3
      },
      {
        key: 'timezone',
        value: 'UTC',
        type: 'select',
        group: 'general',
        label: 'Timezone',
        description: 'Default timezone for the application',
        order: 4
      },
      {
        key: 'language',
        value: 'en',
        type: 'select',
        group: 'general',
        label: 'Language',
        description: 'Default language for the application',
        order: 5
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        group: 'general',
        label: 'Maintenance Mode',
        description: 'Enable maintenance mode to show a coming soon page',
        order: 6
      },
      {
        key: 'analytics_enabled',
        value: 'true',
        type: 'boolean',
        group: 'general',
        label: 'Analytics Tracking',
        description: 'Enable Google Analytics and other tracking services',
        order: 7
      },
      {
        key: 'cookie_consent',
        value: 'true',
        type: 'boolean',
        group: 'general',
        label: 'Cookie Consent',
        description: 'Show cookie consent banner for GDPR compliance',
        order: 8
      },

      // API Settings
      {
        key: 'google_analytics_enabled',
        value: 'false',
        type: 'boolean',
        group: 'api',
        label: 'Google Analytics Enabled',
        description: 'Enable Google Analytics tracking',
        order: 1
      },
      {
        key: 'google_analytics_id',
        value: '',
        type: 'password',
        group: 'api',
        label: 'Google Analytics ID',
        description: 'Your Google Analytics tracking ID',
        order: 2
      },
      {
        key: 'google_search_console_enabled',
        value: 'false',
        type: 'boolean',
        group: 'api',
        label: 'Google Search Console Enabled',
        description: 'Enable Google Search Console integration',
        order: 3
      },
      {
        key: 'google_search_console_url',
        value: '',
        type: 'url',
        group: 'api',
        label: 'Google Search Console Site URL',
        description: 'Your verified site URL in Google Search Console',
        order: 4
      },
      {
        key: 'google_search_console_verification',
        value: '',
        type: 'textarea',
        group: 'api',
        label: 'Google Search Console Verification',
        description: 'HTML verification code from Google Search Console',
        order: 5
      },
      {
        key: 'google_maps_enabled',
        value: 'false',
        type: 'boolean',
        group: 'api',
        label: 'Google Maps Enabled',
        description: 'Enable Google Maps integration',
        order: 6
      },
      {
        key: 'google_maps_api_key',
        value: '',
        type: 'password',
        group: 'api',
        label: 'Google Maps API Key',
        description: 'Your Google Maps API key',
        order: 7
      },
      {
        key: 'meta_enabled',
        value: 'false',
        type: 'boolean',
        group: 'api',
        label: 'Meta Integration Enabled',
        description: 'Enable Facebook/Meta integrations',
        order: 8
      },
      {
        key: 'meta_app_id',
        value: '',
        type: 'text',
        group: 'api',
        label: 'Meta App ID',
        description: 'Your Facebook/Meta App ID',
        order: 9
      },
      {
        key: 'meta_app_secret',
        value: '',
        type: 'password',
        group: 'api',
        label: 'Meta App Secret',
        description: 'Your Facebook/Meta App Secret',
        order: 10
      },
      {
        key: 'meta_pixel_id',
        value: '',
        type: 'text',
        group: 'api',
        label: 'Meta Pixel ID',
        description: 'Your Facebook Pixel ID',
        order: 11
      },

      // Branding Settings
      {
        key: 'logo_url',
        value: '',
        type: 'image',
        group: 'branding',
        label: 'Logo URL',
        description: 'URL to your site logo',
        order: 1
      },
      {
        key: 'favicon_url',
        value: '',
        type: 'image',
        group: 'branding',
        label: 'Favicon URL',
        description: 'URL to your site favicon',
        order: 2
      },
      {
        key: 'primary_color',
        value: '#3b82f6',
        type: 'color',
        group: 'branding',
        label: 'Primary Color',
        description: 'Primary brand color',
        order: 3
      },
      {
        key: 'secondary_color',
        value: '#64748b',
        type: 'color',
        group: 'branding',
        label: 'Secondary Color',
        description: 'Secondary brand color',
        order: 4
      },

      // Email Settings
      {
        key: 'email_provider',
        value: 'resend',
        type: 'select',
        group: 'email',
        label: 'Email Provider',
        description: 'Email service provider',
        order: 1
      },
      {
        key: 'email_from_address',
        value: 'noreply@yoursite.com',
        type: 'email',
        group: 'email',
        label: 'From Email Address',
        description: 'Default from email address',
        order: 2
      },
      {
        key: 'email_from_name',
        value: 'Your Site',
        type: 'text',
        group: 'email',
        label: 'From Name',
        description: 'Default from name for emails',
        order: 3
      },
      {
        key: 'email_api_key',
        value: '',
        type: 'password',
        group: 'email',
        label: 'API Key',
        description: 'Email provider API key',
        order: 4
      },

      // Security Settings
      {
        key: 'session_timeout',
        value: '24',
        type: 'number',
        group: 'security',
        label: 'Session Timeout (hours)',
        description: 'How long user sessions should last',
        order: 1
      },
      {
        key: 'max_login_attempts',
        value: '5',
        type: 'number',
        group: 'security',
        label: 'Max Login Attempts',
        description: 'Maximum failed login attempts before lockout',
        order: 2
      },
      {
        key: 'lockout_duration',
        value: '15',
        type: 'number',
        group: 'security',
        label: 'Lockout Duration (minutes)',
        description: 'How long to lock out users after failed attempts',
        order: 3
      },
      {
        key: 'require_2fa',
        value: 'false',
        type: 'boolean',
        group: 'security',
        label: 'Require 2FA',
        description: 'Require two-factor authentication for all users',
        order: 4
      },

      // Financial Settings
      {
        key: 'default_currency',
        value: 'USD',
        type: 'select',
        group: 'financial',
        label: 'Default Currency',
        description: 'Default currency for invoices and payments',
        order: 1
      },
      {
        key: 'tax_rate',
        value: '0',
        type: 'number',
        group: 'financial',
        label: 'Default Tax Rate (%)',
        description: 'Default tax rate for invoices',
        order: 2
      },
      {
        key: 'payment_terms',
        value: 'Net 30',
        type: 'text',
        group: 'financial',
        label: 'Payment Terms',
        description: 'Default payment terms for invoices',
        order: 3
      },
      {
        key: 'invoice_prefix',
        value: 'INV-',
        type: 'text',
        group: 'financial',
        label: 'Invoice Prefix',
        description: 'Prefix for invoice numbers',
        order: 4
      },

      // GitHub Settings
      {
        key: 'github_enabled',
        value: 'false',
        type: 'boolean',
        group: 'github',
        label: 'GitHub Integration Enabled',
        description: 'Enable GitHub integration for portfolio',
        order: 1
      },
      {
        key: 'github_username',
        value: '',
        type: 'text',
        group: 'github',
        label: 'GitHub Username',
        description: 'Your GitHub username',
        order: 2
      },
      {
        key: 'github_token',
        value: '',
        type: 'password',
        group: 'github',
        label: 'GitHub Personal Access Token',
        description: 'GitHub PAT for API access',
        order: 3
      },
      {
        key: 'github_repos_to_show',
        value: '6',
        type: 'number',
        group: 'github',
        label: 'Number of Repos to Show',
        description: 'How many repositories to display on portfolio',
        order: 4
      },

      // About Settings
      {
        key: 'about_title',
        value: 'About Me',
        type: 'text',
        group: 'about',
        label: 'About Title',
        description: 'Title for the about section',
        order: 1
      },
      {
        key: 'about_description',
        value: 'I am a passionate full-stack developer with expertise in modern web technologies.',
        type: 'textarea',
        group: 'about',
        label: 'About Description',
        description: 'Description for the about section',
        order: 2
      },
      {
        key: 'profile_image_url',
        value: '',
        type: 'image',
        group: 'about',
        label: 'Profile Image URL',
        description: 'URL to your profile image',
        order: 3
      },
      {
        key: 'resume_url',
        value: '',
        type: 'url',
        group: 'about',
        label: 'Resume URL',
        description: 'URL to your resume/CV',
        order: 4
      },
      {
        key: 'linkedin_url',
        value: '',
        type: 'url',
        group: 'about',
        label: 'LinkedIn URL',
        description: 'Your LinkedIn profile URL',
        order: 5
      },
      {
        key: 'twitter_url',
        value: '',
        type: 'url',
        group: 'about',
        label: 'Twitter URL',
        description: 'Your Twitter profile URL',
        order: 6
      },
    ]

    // Insert settings in batches to avoid conflicts
    for (const setting of defaultSettings) {
      try {
        await db.insert(siteSettings).values(setting).onConflictDoNothing()
      } catch (error) {
        console.warn(`Setting ${setting.key} already exists, skipping...`)
      }
    }

    console.log('✅ Settings seeded successfully!')
    console.log(`📊 ${defaultSettings.length} settings available`)
  } catch (error) {
    console.error('❌ Error seeding settings:', error)
    throw error
  }
}

if (require.main === module) {
  seedSettings()
    .then(() => {
      console.log('✅ Settings seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Settings seeding failed:', error)
      process.exit(1)
    })
}

export { seedSettings }