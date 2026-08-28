export type MaxRetentionMode = 'none' | 'percent' | 'maximum'

export type WorkflowStatus =
  | 'Approval Required'
  | 'Submitted for Approval'
  | 'Partial Approval'
  | 'Rejected'
  | 'Approved'
  | 'Approval Not Required'

export interface DistributionContact {
  id: string
  responsiblePerson: string
  respPersonName: string
  sendToFirm: string
  sendToFirmName: string
  sendToContact: string
  contactName: string
  send: boolean
  preferredMethod: string
  sendType: string
  dateSent: string
  dateSigned: string
  notes: string
}

export type InclusionExclusionType = 'I' | 'E'

/** Rows entered directly on the Inclusions/Exclusions tab. */
export interface SubcontractInclusionExclusion {
  id: string
  seq: number
  type: InclusionExclusionType
  phase: string
  phaseDesc: string
  detail: string
  /** Stamped when the row is created; not user editable. */
  dateEntered: string
  /** Stamped when the row is created; not user editable. */
  enteredBy: string
  notes: string
}

/**
 * Subcontract change orders originate outside this form, so the tab is a
 * read-only view apart from the Ready for Accounting flag.
 */
export interface SubcontractChangeOrder {
  id: string
  subcontractCO: string
  vendor: string
  vendorName: string
  description: string
  details: string
  date: string
  status: string
  reference: string
  readyForAccounting: boolean
  readyForAccountingBy: string
  dateSent: string
  dateDueBack: string
  dateReceived: string
  dateApproved: string
  notes: string
  interfacedDate: string
  originalSubcontract: number
  priorApprovedSubCOs: number
  currentSubcontract: number
  pendingSubCO: number
  pendingSubcontract: number
  otherPendingSubCOs: number
}

export type CertificateType =
  | 'coi'
  | 'workersComp'
  | 'automobile'
  | 'umbrella'
  | 'bond'
  | 'license'
  | 'w9'
  | 'other'

/** Document register for subcontractor certificates on this subcontract. */
export interface SubcontractCertificate {
  id: string
  certificateType: CertificateType
  certified: boolean
  certificateDate: string
  receivedDate: string
  notes: string
}

export type ComplianceCodeType = 'yesNo' | 'date'
export type ComplianceFrequency = '' | 'weekly' | 'monthly' | 'quarterly' | 'semiAnnual' | 'annual'

/**
 * SL Compliance codes initialized from the subcontract Comp Group.
 * Sequence and compliance code stay read-only; tracking fields are editable.
 */
export interface SubcontractComplianceCode {
  id: string
  seq: number
  compCode: string
  type: ComplianceCodeType
  triggerAtPayment: boolean
  supplier: string
  notes: string
  recurring: boolean
  recurrenceStartDate: string
  frequency: ComplianceFrequency
}

/** File selected on the Attachment tab dropzone. */
export interface SubcontractAttachmentFile {
  id: string
  fileName: string
  sizeBytes: number
}

export type SlItemType = '1' | '2' | '3' | '4'
export type TaxType = '' | '1' | '2' | '3'

export interface SubcontractItem {
  id: string
  seq: number
  project: string
  item: string
  description: string
  itemType: SlItemType
  addOn: string
  addOnDesc: string
  addOnPercent: number
  phase: string
  phaseDesc: string
  costType: string
  um: string
  units: number
  unitCost: number
  amount: number
  subCO: string
  send: boolean
  wcRetPercent: number
  smRetPercent: number
  taxType: TaxType
  taxCode: string
  supplier: string
  supplierName: string
  notes: string
  aco: string
  acoItem: string
  pcoType: string
  pco: string
  pcoDesc: string
  pcoItem: string
  approved: boolean
  interfaced: boolean
  interfaceDate: string
  interfaceMonth: string
  correcting: boolean
}

export interface SubcontractRecord {
  id: string
  subcontract: string
  slDescription: string
  documentType: string
  vendor: string
  vendorName: string
  holdCode: string
  holdCodeDesc: string
  payTerms: string
  payTermsDesc: string
  compGroup: string
  compGroupDesc: string
  totalOrigSubct: number
  totalCurrSubct: number
  startDate: string
  approved: boolean
  approvedBy: string
  claimApprovalRequired: boolean
  slStatus: string
  workflowStatus: WorkflowStatus
  slJob: string
  slJobDesc: string
  percentOfContract: number
  maxRetgAmt: number
  percentOfContAmt: number
  inclAcoInMaxRetg: boolean
  maxRetDistStyle: string
  notes: string
  exhibitAJobsiteRules: boolean
  exhibitBLeedRequirements: boolean
  exhibitCInsurance: boolean
  exhibitDBillingProcedures: boolean
  exhibitESchedule: boolean
  exhibitFPlansAndSpecs: boolean
  bondRequired: boolean
  jhasRequired: boolean
  jhasReqByDate: string
  plansAndSpecsIndexFilepath: string
  maxRetentionMode: MaxRetentionMode
  percentOfSubcontract: number
  retentionAmount: number
  maxAmtByPercent: number
  includeChgOrdersInMaxRetention: boolean
  retentionApprove: boolean
  adjustMaximumInvoice: string
  distribution: DistributionContact[]
  items: SubcontractItem[]
  inclusionsExclusions: SubcontractInclusionExclusion[]
  changeOrders: SubcontractChangeOrder[]
  certificates: SubcontractCertificate[]
  complianceCodes: SubcontractComplianceCode[]
  attachments: SubcontractAttachmentFile[]
}

export const PROJECT_NUMBER = '0-2'
export const PROJECT_DESCRIPTION = 'Main Campus Renovation — Phase 2'

export type SubcontractColumnKey = keyof SubcontractRecord | 'actions'

export interface SubcontractColumnDef {
  key: SubcontractColumnKey
  header: string
  width?: string
  numeric?: boolean
  boolean?: boolean
  required?: boolean
}
