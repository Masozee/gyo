import { db } from '../lib/db'
import { documents } from '../lib/schema'

const sampleDocuments = [
  {
    title: "Master Service Agreement - TechCorp",
    documentNumber: "MSA-2024-001",
    description: "Comprehensive service agreement outlining terms and conditions for ongoing development services",
    type: "MSA",
    status: "ACTIVE",
    priority: "HIGH",
    category: "LEGAL",
    projectId: 1,
    clientId: 2,
    userId: 1,
    version: "2.1",
    tags: JSON.stringify(["legal", "active", "development"]),
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    expiryDate: "2024-12-31",
    contractValue: 120000.00,
    currency: "USD",
    approvalRequired: true,
    content: "<p>This Master Service Agreement establishes the framework for all future projects between the parties...</p>",
    isConfidential: true,
  },
  {
    title: "Non-Disclosure Agreement - StartupXYZ",
    documentNumber: "NDA-2024-003",
    description: "Confidentiality agreement for project consultation and sensitive information sharing",
    type: "NDA",
    status: "SIGNED",
    priority: "MEDIUM",
    category: "LEGAL",
    projectId: null,
    clientId: 2,
    userId: 1,
    version: "1.0",
    tags: JSON.stringify(["nda", "confidential", "consultation"]),
    startDate: "2024-02-15",
    endDate: "2025-02-15",
    signedDate: "2024-02-15",
    contractValue: null,
    currency: "USD",
    approvalRequired: false,
    content: "<p>The receiving party agrees to maintain confidentiality of all proprietary information...</p>",
    isConfidential: true,
  },
  {
    title: "Project Proposal - E-commerce Platform",
    documentNumber: "PROP-2024-007",
    description: "Detailed proposal for developing a custom e-commerce platform with integrated payment processing",
    type: "PROPOSAL",
    status: "UNDER_REVIEW",
    priority: "HIGH",
    category: "TECHNICAL",
    projectId: null,
    clientId: 2,
    userId: 1,
    version: "1.2",
    tags: JSON.stringify(["proposal", "ecommerce", "development"]),
    startDate: null,
    endDate: null,
    expiryDate: "2024-04-30",
    reminderDate: "2024-04-15",
    contractValue: 85000.00,
    currency: "USD",
    approvalRequired: true,
    content: "<p>We propose to develop a comprehensive e-commerce solution featuring...</p>",
    isConfidential: false,
  },
  {
    title: "Statement of Work - Mobile App Development",
    documentNumber: "SOW-2024-012",
    description: "Detailed scope of work for iOS and Android mobile application development",
    type: "SOW",
    status: "APPROVED",
    priority: "URGENT",
    category: "TECHNICAL",
    projectId: 1,
    clientId: 2,
    userId: 1,
    version: "1.0",
    tags: JSON.stringify(["sow", "mobile", "ios", "android"]),
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    contractValue: 65000.00,
    currency: "USD",
    approvalRequired: true,
    content: "<p>This Statement of Work defines the specific deliverables and timeline for mobile app development...</p>",
    isConfidential: false,
  },
  {
    title: "Software License Agreement - Analytics Tool",
    documentNumber: "LIC-2024-005",
    description: "License agreement for proprietary analytics software usage and distribution rights",
    type: "AGREEMENT",
    status: "EXPIRED",
    priority: "LOW",
    category: "LEGAL",
    projectId: null,
    clientId: 2,
    userId: 1,
    version: "3.0",
    tags: JSON.stringify(["license", "software", "analytics"]),
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    expiryDate: "2023-12-31",
    contractValue: 25000.00,
    currency: "USD",
    approvalRequired: false,
    content: "<p>This license grants the right to use our analytics software under the following terms...</p>",
    isConfidential: false,
  },
  {
    title: "Data Processing Amendment",
    documentNumber: "AMD-2024-002",
    description: "Amendment to existing contract addressing new data processing requirements under compliance regulations",
    type: "AMENDMENT",
    status: "DRAFT",
    priority: "MEDIUM",
    category: "COMPLIANCE",
    projectId: 1,
    clientId: 2,
    userId: 1,
    version: "1.0",
    tags: JSON.stringify(["amendment", "gdpr", "compliance", "data"]),
    startDate: null,
    endDate: null,
    reminderDate: "2024-04-01",
    contractValue: null,
    currency: "USD",
    approvalRequired: true,
    content: "<p>This amendment addresses additional data processing requirements to ensure compliance...</p>",
    isConfidential: true,
  },
]

async function createSampleDocuments() {
  console.log('Creating sample documents...')
  
  try {
    // Get the current max internal number
    const existingDocs = await db.select().from(documents)
    const maxInternalNumber = Math.max(...existingDocs.map(d => d.internalNumber), 0)
    
    // Add internal numbers to sample documents
    const documentsWithInternalNumbers = sampleDocuments.map((doc, index) => ({
      ...doc,
      internalNumber: maxInternalNumber + index + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    
    const result = await db.insert(documents).values(documentsWithInternalNumbers).returning()
    
    console.log(`✅ Created ${result.length} sample documents`)
    
    // Log the created documents with their internal numbers
    result.forEach(doc => {
      console.log(`   • #${doc.internalNumber.toString().padStart(4, '0')} - ${doc.title} (${doc.type})`)
    })
    
  } catch (error) {
    console.error('❌ Error creating sample documents:', error)
  }
}

// Run if called directly
if (require.main === module) {
  createSampleDocuments().then(() => {
    console.log('Sample documents creation completed')
    process.exit(0)
  }).catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
}

export { createSampleDocuments } 