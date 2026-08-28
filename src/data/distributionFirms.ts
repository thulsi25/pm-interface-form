export interface DistributionFirm {
  id: string
  firmCode: string
  firmName: string
  contact: string
  sortName: string
  contactName: string
}

export const DISTRIBUTION_FIRM_COLUMNS: {
  key: keyof Omit<DistributionFirm, 'id'>
  header: string
  width: string
}[] = [
  { key: 'firmCode', header: 'Firm Code', width: '7rem' },
  { key: 'firmName', header: 'Firm Name', width: '18rem' },
  { key: 'contact', header: 'Contact', width: '6rem' },
  { key: 'sortName', header: 'Sort Name', width: '12rem' },
  { key: 'contactName', header: 'Contact Name', width: '12rem' },
]

export const DISTRIBUTION_FIRMS: DistributionFirm[] = [
  {
    id: 'firm-7342',
    firmCode: '7342',
    firmName: 'D&M Concrete',
    contact: '1',
    sortName: 'D&M Concrete',
    contactName: 'Mark Gosselin',
  },
  {
    id: 'firm-4358',
    firmCode: '4358',
    firmName: "Dean's Landscaping",
    contact: '2',
    sortName: 'North Dean',
    contactName: 'Bob Smith',
  },
  {
    id: 'firm-4562',
    firmCode: '4562',
    firmName: 'Carlson Gravel & Sand Co.',
    contact: '1',
    sortName: 'Richards Peter',
    contactName: 'Alex Molden',
  },
  {
    id: 'firm-7897',
    firmCode: '7897',
    firmName: 'Construction Supply Co.',
    contact: '1',
    sortName: 'Ratcher',
    contactName: 'Oscar Owner',
  },
  {
    id: 'firm-2134',
    firmCode: '2134',
    firmName: 'Dallwig Brothers Building Supply Inc.',
    contact: '2',
    sortName: 'A. Gosselin Ste',
    contactName: 'Richard Morris',
  },
  {
    id: 'firm-1235',
    firmCode: '1235',
    firmName: 'Culver Development LLC',
    contact: '1',
    sortName: 'Denron Plumbing',
    contactName: 'Thulsi Priya',
  },
  {
    id: 'firm-8534',
    firmCode: '8534',
    firmName: 'Ace Drywall & Acoustics',
    contact: '1',
    sortName: 'Molden',
    contactName: 'Aaron Boudreau',
  },
  {
    id: 'firm-3543',
    firmCode: '3543',
    firmName: 'Advanced Framing',
    contact: '1',
    sortName: 'Anderson Sam',
    contactName: 'Sam Anderson',
  },
  {
    id: 'firm-0897',
    firmCode: '897',
    firmName: 'Baxter Flooring and Ceiling',
    contact: '1',
    sortName: 'Baxter Flooring',
    contactName: 'Namita Kurelashuwani',
  },
  {
    id: 'firm-23909',
    firmCode: '23909',
    firmName: 'Nebula Paint Varnish',
    contact: '1',
    sortName: 'Everest Earlington',
    contactName: 'Earlington Everest',
  },
  {
    id: 'firm-9764',
    firmCode: '9764',
    firmName: 'Sharon Impex',
    contact: '1',
    sortName: 'Impex Sharon',
    contactName: 'Evelyn Matolla',
  },
  {
    id: 'firm-1042',
    firmCode: '1042',
    firmName: 'Granite Earthworks Inc',
    contact: '3',
    sortName: 'Earthworks Granite',
    contactName: 'Marcus Reed',
  },
  {
    id: 'firm-1250',
    firmCode: '1250',
    firmName: 'Ironclad Steel Erectors',
    contact: '2',
    sortName: 'Ironclad Steel',
    contactName: 'Priya Raman',
  },
  {
    id: 'firm-1790',
    firmCode: '1790',
    firmName: 'Apex Mechanical',
    contact: '1',
    sortName: 'Apex Mech',
    contactName: 'Grace Okafor',
  },
  {
    id: 'firm-9001',
    firmCode: '9001',
    firmName: 'Halvorsen Design Group',
    contact: '2',
    sortName: 'Halvorsen Design',
    contactName: 'Ellen Park',
  },
]
