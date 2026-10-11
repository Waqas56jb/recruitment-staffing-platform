export const jobCategories = [
  'Logistics',
  'Manufacturing',
  'Hospitality',
  'Office & Admin',
  'IT & Professional',
  'Retail',
  'Construction',
  'Healthcare Support',
]

export const employmentTypes = ['Temporary', 'Permanent', 'Contract']

export const jobs = [
  {
    id: 'sample-warehouse-operative',
    title: 'Warehouse Operative',
    location: 'Birmingham, UK',
    employmentType: 'Temporary',
    category: 'Logistics',
    department: 'Distribution',
    salaryLabel: 'Competitive hourly rate',
    isSample: true,
    postedAt: '2026-09-28',
    summary:
      'Support inbound and outbound warehouse operations across picking, packing, and stock movement.',
    description:
      'This sample listing demonstrates how temporary warehouse roles will appear once live vacancies are supplied. Ideal candidates are reliable, safety-aware, and comfortable with shift-based warehouse environments.',
    responsibilities: [
      'Pick, pack, and prepare orders to required standards',
      'Support goods-in and goods-out processes',
      'Maintain tidy, safe work areas',
      'Follow site health and safety procedures',
    ],
    requirements: [
      'Previous warehouse experience preferred',
      'Ability to work effectively in a team',
      'Flexibility around shift patterns',
      'Right to work in the relevant jurisdiction',
    ],
  },
  {
    id: 'sample-production-operative',
    title: 'Production Operative',
    location: 'Manchester, UK',
    employmentType: 'Temporary',
    category: 'Manufacturing',
    department: 'Production',
    salaryLabel: 'Competitive hourly rate',
    isSample: true,
    postedAt: '2026-09-30',
    summary:
      'Join a production team focused on consistent quality, line output, and safe working practices.',
    description:
      'Sample manufacturing vacancy for demonstration purposes. Real openings will include site-specific shift details and pay information when available.',
    responsibilities: [
      'Operate or support production line processes',
      'Carry out basic quality checks',
      'Report issues promptly to supervisors',
      'Meet daily output and quality targets',
    ],
    requirements: [
      'Manufacturing or production experience helpful',
      'Good attention to detail',
      'Reliable attendance',
      'Comfortable standing for shifts',
    ],
  },
  {
    id: 'sample-office-administrator',
    title: 'Office Administrator',
    location: 'London, UK',
    employmentType: 'Permanent',
    category: 'Office & Admin',
    department: 'Business Support',
    salaryLabel: 'Competitive salary',
    isSample: true,
    postedAt: '2026-10-01',
    summary:
      'Provide organised administrative support across scheduling, documentation, and internal coordination.',
    description:
      'A demonstration permanent office role. Actual vacancies will include employer branding and full application instructions once integrated.',
    responsibilities: [
      'Manage diaries, correspondence, and filing',
      'Support onboarding paperwork and records',
      'Coordinate meetings and travel arrangements',
      'Maintain accurate shared documentation',
    ],
    requirements: [
      'Strong organisational skills',
      'Confident with Microsoft Office or equivalent',
      'Clear written and verbal communication',
      'Previous administration experience preferred',
    ],
  },
  {
    id: 'sample-hospitality-host',
    title: 'Front of House Host',
    location: 'Leeds, UK',
    employmentType: 'Temporary',
    category: 'Hospitality',
    department: 'Guest Services',
    salaryLabel: 'Competitive hourly rate',
    isSample: true,
    postedAt: '2026-10-03',
    summary:
      'Deliver welcoming guest experiences for a busy hospitality venue during peak trading periods.',
    description:
      'Sample hospitality listing to illustrate temporary front-of-house opportunities on the Staffora jobs board.',
    responsibilities: [
      'Greet and seat guests professionally',
      'Support service flow during busy periods',
      'Maintain presentation standards',
      'Collaborate with kitchen and floor teams',
    ],
    requirements: [
      'Customer service experience preferred',
      'Calm under pressure',
      'Flexible availability including weekends',
      'Smart, professional presentation',
    ],
  },
  {
    id: 'sample-it-support',
    title: 'IT Support Coordinator',
    location: 'Remote / Hybrid',
    employmentType: 'Contract',
    category: 'IT & Professional',
    department: 'Technology',
    salaryLabel: 'Competitive contract rate',
    isSample: true,
    postedAt: '2026-10-05',
    summary:
      'Coordinate first-line support tickets, user onboarding, and day-to-day technical assistance.',
    description:
      'Demonstration contract role for professional services. Live roles will include stack details and assignment length when provided.',
    responsibilities: [
      'Triage and resolve support requests',
      'Assist with device and account setup',
      'Document common issues and solutions',
      'Escalate complex incidents appropriately',
    ],
    requirements: [
      'IT support or service desk experience',
      'Clear communicator with non-technical users',
      'Organised ticket hygiene',
      'Familiarity with common workplace IT tools',
    ],
  },
  {
    id: 'sample-retail-advisor',
    title: 'Retail Sales Advisor',
    location: 'Bristol, UK',
    employmentType: 'Temporary',
    category: 'Retail',
    department: 'Store Operations',
    salaryLabel: 'Competitive hourly rate',
    isSample: true,
    postedAt: '2026-10-07',
    summary:
      'Support customers on the shop floor and help maintain stock presentation during seasonal demand.',
    description:
      'Sample retail vacancy for demonstration. Genuine openings will be published with store-specific requirements.',
    responsibilities: [
      'Deliver helpful customer service',
      'Replenish and present merchandise',
      'Support checkout operations as needed',
      'Uphold store standards and policies',
    ],
    requirements: [
      'Retail or customer service experience preferred',
      'Friendly and approachable manner',
      'Availability for weekend trading',
      'Comfortable standing for store shifts',
    ],
  },
]

export function getJobById(id) {
  return jobs.find((job) => job.id === id) ?? null
}

export function getRelatedJobs(job, limit = 3) {
  return jobs
    .filter((item) => item.id !== job.id && (item.category === job.category || item.employmentType === job.employmentType))
    .slice(0, limit)
}
