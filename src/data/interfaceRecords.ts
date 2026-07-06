export type InterfaceRecordStatus = 'Yet to validate' | 'In unposted batch'

export interface InterfaceRecord {
  id: string
  recordType: string
  status: InterfaceRecordStatus
  recordId: string
  description: string
  coNumber: string
  aco: number
  amountToInterface: number
  currentAmount: number
  transactionType: string
}

export const PM_INTERFACE_RECORDS: InterfaceRecord[] = [
  {
    id: '1',
    recordType: 'Approved Change Order',
    status: 'Yet to validate',
    recordId: '702-46',
    description: 'Unforeseen site conditions',
    coNumber: '--',
    aco: 1,
    amountToInterface: 343.314,
    currentAmount: 343.314,
    transactionType: 'New',
  },
  {
    id: '2',
    recordType: 'Purchase Order Change Order',
    status: 'Yet to validate',
    recordId: '134-2438',
    description: 'Permits',
    coNumber: '--',
    aco: 2,
    amountToInterface: 57.64,
    currentAmount: 57.64,
    transactionType: 'New',
  },
  {
    id: '3',
    recordType: 'Quotes',
    status: 'Yet to validate',
    recordId: '12335',
    description: 'Subterranean rock',
    coNumber: '--',
    aco: 2,
    amountToInterface: 694,
    currentAmount: 694,
    transactionType: '--',
  },
  {
    id: '4',
    recordType: 'Purchase Order Change Order',
    status: 'In unposted batch',
    recordId: '123-11',
    description: 'Permits - Zone inspection',
    coNumber: '--',
    aco: 1,
    amountToInterface: 0,
    currentAmount: 0,
    transactionType: 'New',
  },
  {
    id: '5',
    recordType: 'Purchase Order Change Order',
    status: 'Yet to validate',
    recordId: '151-4',
    description: 'Electrical rough-in',
    coNumber: '--',
    aco: 3,
    amountToInterface: 1280.5,
    currentAmount: 1280.5,
    transactionType: 'New',
  },
  {
    id: '6',
    recordType: 'Approved Change Order',
    status: 'Yet to validate',
    recordId: '702-88',
    description: 'Foundation revision',
    coNumber: '--',
    aco: 1,
    amountToInterface: 4120,
    currentAmount: 4120,
    transactionType: 'New',
  },
  {
    id: '7',
    recordType: 'Quotes',
    status: 'Yet to validate',
    recordId: '12890',
    description: 'Steel fabrication',
    coNumber: '--',
    aco: 2,
    amountToInterface: 215.75,
    currentAmount: 215.75,
    transactionType: '--',
  },
  {
    id: '8',
    recordType: 'Purchase Order Change Order',
    status: 'In unposted batch',
    recordId: '198-22',
    description: 'HVAC change order',
    coNumber: '--',
    aco: 2,
    amountToInterface: 0,
    currentAmount: 0,
    transactionType: 'New',
  },
]

export const LOCKED_ROW_IDS = PM_INTERFACE_RECORDS.filter(
  (row) => row.status === 'In unposted batch',
).map((row) => row.id)
