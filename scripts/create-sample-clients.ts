import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { clients } from '../lib/schema'

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(databaseUrl, { prepare: false });
const db = drizzle(client);

const sampleClients = [
  {
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    address: '123 Business Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    website: 'https://techcorp.com',
    notes: 'Key decision maker for enterprise solutions. Prefers email communication.',
    isActive: true,
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@innovatedesign.co',
    phone: '+1 (555) 987-6543',
    company: 'Innovate Design Co',
    address: '456 Creative Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
    website: 'https://innovatedesign.co',
    notes: 'CEO of design agency. Very responsive and detail-oriented.',
    isActive: true,
  },
  {
    name: 'Michael Chen',
    email: 'mchen@globaltech.net',
    phone: '+1 (555) 555-0123',
    company: 'Global Tech Networks',
    address: '789 Innovation Drive',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'USA',
    website: 'https://globaltech.net',
    notes: 'CTO position. Technical background. Prefers technical demonstrations.',
    isActive: true,
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@startuplab.io',
    phone: '+1 (555) 246-8135',
    company: 'StartupLab Ventures',
    address: '321 Venture Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    website: 'https://startuplab.io',
    notes: 'Investor relations. Looking for scalable solutions.',
    isActive: true,
  },
  {
    name: 'David Wilson',
    email: 'david@consultingpro.biz',
    phone: '+1 (555) 369-2580',
    company: 'ConsultingPro Business Services',
    address: '654 Professional Plaza',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    website: 'https://consultingpro.biz',
    notes: 'Management consultant. Focuses on operational efficiency.',
    isActive: true,
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa@creativestudio.com',
    phone: '+1 (555) 147-2589',
    company: 'Creative Studio Inc',
    address: '987 Art District',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
    website: 'https://creativestudio.com',
    notes: 'Creative director. Values aesthetic and user experience.',
    isActive: true,
  },
  {
    name: 'Robert Brown',
    email: 'rbrown@financeplus.org',
    phone: '+1 (555) 741-8520',
    company: 'FinancePlus Corporation',
    address: '147 Financial Center',
    city: 'Boston',
    state: 'MA',
    zipCode: '02101',
    country: 'USA',
    website: 'https://financeplus.org',
    notes: 'CFO. Concerned with ROI and cost efficiency.',
    isActive: true,
  },
  {
    name: 'Maria Garcia',
    email: 'maria@healthtech.med',
    phone: '+1 (555) 852-9630',
    company: 'HealthTech Solutions',
    address: '258 Medical Park',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    country: 'USA',
    website: 'https://healthtech.med',
    notes: 'Healthcare technology specialist. Compliance-focused.',
    isActive: true,
  },
  {
    name: 'James Miller',
    email: 'james@retailmax.store',
    phone: '+1 (555) 963-7410',
    company: 'RetailMax Enterprises',
    address: '369 Commerce Way',
    city: 'Denver',
    state: 'CO',
    zipCode: '80201',
    country: 'USA',
    website: 'https://retailmax.store',
    notes: 'E-commerce platform manager. Mobile-first approach.',
    isActive: false,
  },
  {
    name: 'Jennifer Davis',
    email: 'jen@educatefuture.edu',
    phone: '+1 (555) 159-4826',
    company: 'EducateFuture Institute',
    address: '753 Learning Lane',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA',
    website: 'https://educatefuture.edu',
    notes: 'Educational technology coordinator. Budget-conscious.',
    isActive: true,
  },
  {
    name: 'William Jones',
    email: 'will@manufact.pro',
    phone: '+1 (555) 357-1593',
    company: 'Manufacturing Pro Solutions',
    address: '951 Industrial Blvd',
    city: 'Detroit',
    state: 'MI',
    zipCode: '48201',
    country: 'USA',
    website: 'https://manufact.pro',
    notes: 'Operations manager. Needs robust, reliable solutions.',
    isActive: true,
  },
  {
    name: 'Amanda Taylor',
    email: 'amanda@nonprofithelp.org',
    phone: '+1 (555) 468-2751',
    company: 'NonProfit Helper Foundation',
    address: '357 Community Center',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30301',
    country: 'USA',
    website: 'https://nonprofithelp.org',
    notes: 'Program director. Limited budget but high impact potential.',
    isActive: false,
  },
  {
    name: 'Kevin Anderson',
    email: 'kevin@realestatemax.realty',
    phone: '+1 (555) 642-8397',
    company: 'RealEstate Max Realty',
    address: '159 Property Plaza',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    country: 'USA',
    website: 'https://realestatemax.realty',
    notes: 'Real estate broker. Needs CRM and property management tools.',
    isActive: true,
  },
  {
    name: 'Laura White',
    email: 'laura@lawfirmpro.legal',
    phone: '+1 (555) 753-9512',
    company: 'LawFirm Pro Associates',
    address: '753 Justice Boulevard',
    city: 'Nashville',
    state: 'TN',
    zipCode: '37201',
    country: 'USA',
    website: 'https://lawfirmpro.legal',
    notes: 'Partner at law firm. Security and confidentiality are paramount.',
    isActive: true,
  },
  {
    name: 'Christopher Lee',
    email: 'chris@architectsync.design',
    phone: '+1 (555) 864-2046',
    company: 'ArchitectSync Design Studio',
    address: '246 Design District',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    country: 'USA',
    website: 'https://architectsync.design',
    notes: 'Principal architect. Values visual design and user interface.',
    isActive: true,
  }
]

async function createSampleClients() {
  try {
    console.log('Creating sample clients...')
    
    for (const clientData of sampleClients) {
      await db.insert(clients).values(clientData)
      console.log(`Created client: ${clientData.name}`)
    }
    
    console.log(`✅ Successfully created ${sampleClients.length} sample clients`)
  } catch (error) {
    console.error('❌ Error creating sample clients:', error)
  } finally {
    process.exit(0)
  }
}

createSampleClients() 