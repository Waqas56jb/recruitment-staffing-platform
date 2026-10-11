import { images } from './images'

export const industries = [
  {
    id: 'logistics',
    title: 'Logistics & Warehousing',
    summary:
      'Pickers, packers, forklift operators, inventory controllers, and shift supervisors for fast-moving distribution environments.',
    roles: ['Warehouse Operatives', 'Forklift Drivers', 'Team Leaders', 'Inventory Controllers'],
    image: images.logistics,
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing & Production',
    summary:
      'Production operatives, machine operators, quality checkers, and line support for consistent output and coverage.',
    roles: ['Production Operatives', 'Machine Operators', 'QC Assistants', 'Shift Supervisors'],
    image: images.manufacturing,
  },
  {
    id: 'construction',
    title: 'Construction & Technical Trades',
    summary:
      'Trade and site support roles for projects that need reliable skills, clear induction, and dependable attendance.',
    roles: ['General Labour', 'Trade Assistants', 'Site Support', 'Technical Operatives'],
    image: images.construction,
  },
  {
    id: 'hospitality',
    title: 'Hospitality & Catering',
    summary:
      'Front-of-house, kitchen support, and event staffing for venues that cannot compromise on service standards.',
    roles: ['Waiting Staff', 'Kitchen Assistants', 'Bar Staff', 'Event Hosts'],
    image: images.hospitality,
  },
  {
    id: 'retail',
    title: 'Retail & Customer Service',
    summary:
      'Customer-facing and back-of-house retail talent for seasonal peaks, store openings, and ongoing coverage.',
    roles: ['Sales Advisors', 'Cashiers', 'Stockroom Assistants', 'Customer Service'],
    image: images.retail,
  },
  {
    id: 'office',
    title: 'Office & Administration',
    summary:
      'Administrators, coordinators, reception, and business support roles that keep operations running smoothly.',
    roles: ['Administrators', 'Receptionists', 'Coordinators', 'Data Entry'],
    image: images.admin,
  },
  {
    id: 'it-professional',
    title: 'IT & Professional Services',
    summary:
      'Professional and technical placements where capability, communication, and cultural fit matter.',
    roles: ['IT Support', 'Project Coordinators', 'Analysts', 'Business Support'],
    image: images.tech,
  },
  {
    id: 'healthcare-support',
    title: 'Healthcare Support',
    summary:
      'Non-clinical healthcare support roles where reliability, professionalism, and clear compliance expectations are essential. Clinical placements are subject to local regulation.',
    roles: ['Admin Support', 'Reception', 'Facilities Support', 'Care Support Assistants'],
    image: images.healthcare,
  },
]
