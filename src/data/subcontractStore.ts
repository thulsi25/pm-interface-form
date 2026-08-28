import type { InterfaceRecord } from './interfaceRecords'
import type {
  CertificateType,
  ComplianceCodeType,
  DistributionContact,
  SubcontractCertificate,
  SubcontractChangeOrder,
  SubcontractComplianceCode,
  SubcontractInclusionExclusion,
  SubcontractItem,
  SubcontractRecord,
} from './subcontractTypes'
import { PROJECT_DESCRIPTION, PROJECT_NUMBER } from './subcontractTypes'
import { seedWorkflowStatus } from '../utils/subcontractWorkflow'

/** Bump the suffix whenever SEED_RECORDS changes so cached lists get refreshed. */
const STORAGE_KEY = 'pm-subcontracts-records-v24'

function createDistributionRow(
  partial: Partial<DistributionContact> = {},
): DistributionContact {
  return {
    id: partial.id ?? crypto.randomUUID(),
    responsiblePerson: partial.responsiblePerson ?? '',
    respPersonName: partial.respPersonName ?? '',
    sendToFirm: partial.sendToFirm ?? '',
    sendToFirmName: partial.sendToFirmName ?? '',
    sendToContact: partial.sendToContact ?? '',
    contactName: partial.contactName ?? '',
    send: partial.send ?? false,
    preferredMethod: partial.preferredMethod ?? 'Email',
    sendType: partial.sendType ?? 'Cc',
    dateSent: partial.dateSent ?? '',
    dateSigned: partial.dateSigned ?? '',
    notes: partial.notes ?? '',
  }
}

/** Vista stamps the audit columns when the row is created. */
export function createInclusionExclusionRow(
  partial: Partial<SubcontractInclusionExclusion> = {},
): SubcontractInclusionExclusion {
  return {
    id: partial.id ?? crypto.randomUUID(),
    seq: partial.seq ?? 1,
    type: partial.type ?? 'I',
    phase: partial.phase ?? '',
    phaseDesc: partial.phaseDesc ?? '',
    detail: partial.detail ?? '',
    dateEntered: partial.dateEntered ?? '',
    enteredBy: partial.enteredBy ?? '',
    notes: partial.notes ?? '',
  }
}

export function createChangeOrderRow(
  partial: Partial<SubcontractChangeOrder> = {},
): SubcontractChangeOrder {
  return {
    id: partial.id ?? crypto.randomUUID(),
    subcontractCO: partial.subcontractCO ?? '',
    vendor: partial.vendor ?? '',
    vendorName: partial.vendorName ?? '',
    description: partial.description ?? '',
    details: partial.details ?? '',
    date: partial.date ?? '',
    status: partial.status ?? '',
    reference: partial.reference ?? '',
    readyForAccounting: partial.readyForAccounting ?? false,
    readyForAccountingBy: partial.readyForAccountingBy ?? '',
    dateSent: partial.dateSent ?? '',
    dateDueBack: partial.dateDueBack ?? '',
    dateReceived: partial.dateReceived ?? '',
    dateApproved: partial.dateApproved ?? '',
    notes: partial.notes ?? '',
    interfacedDate: partial.interfacedDate ?? '',
    originalSubcontract: partial.originalSubcontract ?? 0,
    priorApprovedSubCOs: partial.priorApprovedSubCOs ?? 0,
    currentSubcontract: partial.currentSubcontract ?? 0,
    pendingSubCO: partial.pendingSubCO ?? 0,
    pendingSubcontract: partial.pendingSubcontract ?? 0,
    otherPendingSubCOs: partial.otherPendingSubCOs ?? 0,
  }
}

export function createCertificateRow(
  partial: Partial<SubcontractCertificate> = {},
): SubcontractCertificate {
  return {
    id: partial.id ?? crypto.randomUUID(),
    certificateType: partial.certificateType ?? 'coi',
    certified: partial.certified ?? false,
    certificateDate: partial.certificateDate ?? '',
    receivedDate: partial.receivedDate ?? '',
    notes: partial.notes ?? '',
  }
}

export function createComplianceCodeRow(
  partial: Partial<SubcontractComplianceCode> = {},
): SubcontractComplianceCode {
  return {
    id: partial.id ?? crypto.randomUUID(),
    seq: partial.seq ?? 1,
    compCode: partial.compCode ?? '',
    type: partial.type ?? 'yesNo',
    triggerAtPayment: partial.triggerAtPayment ?? false,
    supplier: partial.supplier ?? '',
    notes: partial.notes ?? '',
    recurring: partial.recurring ?? false,
    recurrenceStartDate: partial.recurrenceStartDate ?? '',
    frequency: partial.frequency ?? '',
  }
}

export function createSubcontractItem(
  partial: Partial<SubcontractItem> & Pick<SubcontractItem, 'id' | 'seq'> = {
    id: crypto.randomUUID(),
    seq: 1,
  },
): SubcontractItem {
  const um = partial.um ?? 'LS'
  const units = partial.units ?? 0
  const unitCost = partial.unitCost ?? 0
  const amount = partial.amount ?? (um === 'LS' ? 0 : round2(units * unitCost))

  return {
    id: partial.id,
    seq: partial.seq,
    project: partial.project ?? PROJECT_NUMBER,
    item: partial.item ?? String(partial.seq),
    description: partial.description ?? '',
    itemType: partial.itemType ?? '1',
    addOn: partial.addOn ?? '',
    addOnDesc: partial.addOnDesc ?? '',
    addOnPercent: partial.addOnPercent ?? 0,
    phase: partial.phase ?? '',
    phaseDesc: partial.phaseDesc ?? '',
    costType: partial.costType ?? 'L',
    um,
    units,
    unitCost,
    amount,
    subCO: partial.subCO ?? '',
    send: partial.send ?? true,
    wcRetPercent: partial.wcRetPercent ?? 10,
    smRetPercent: partial.smRetPercent ?? 0,
    taxType: partial.taxType ?? '1',
    taxCode: partial.taxCode ?? '',
    supplier: partial.supplier ?? '',
    supplierName: partial.supplierName ?? '',
    notes: partial.notes ?? '',
    aco: partial.aco ?? '',
    acoItem: partial.acoItem ?? '',
    pcoType: partial.pcoType ?? '',
    pco: partial.pco ?? '',
    pcoDesc: partial.pcoDesc ?? '',
    pcoItem: partial.pcoItem ?? '',
    approved: partial.approved ?? false,
    interfaced: partial.interfaced ?? false,
    interfaceDate: partial.interfaceDate ?? '',
    interfaceMonth: partial.interfaceMonth ?? '',
    correcting: partial.correcting ?? false,
  }
}

export function applySubcontractItemPatch(
  item: SubcontractItem,
  patch: Partial<SubcontractItem>,
  regularAmountTotal = 0,
): SubcontractItem {
  const next: SubcontractItem = { ...item, ...patch }

  if (next.itemType === '4') {
    next.um = 'LS'
    next.units = 0
    if (next.addOnPercent > 0) {
      next.amount = round2((regularAmountTotal * next.addOnPercent) / 100)
    }
  } else if (next.um !== 'LS') {
    next.amount = round2(next.units * next.unitCost)
  }

  return next
}

export function createEmptySubcontract(subcontractNumber: string): SubcontractRecord {
  return {
    id: crypto.randomUUID(),
    subcontract: subcontractNumber,
    slDescription: '',
    documentType: '',
    vendor: '',
    vendorName: '',
    holdCode: '',
    holdCodeDesc: '',
    payTerms: '',
    payTermsDesc: '',
    compGroup: '',
    compGroupDesc: '',
    totalOrigSubct: 0,
    totalCurrSubct: 0,
    startDate: '',
    approved: false,
    approvedBy: '',
    claimApprovalRequired: false,
    slStatus: '3 - Pending',
    workflowStatus: 'Approval Required',
    slJob: '',
    slJobDesc: '',
    percentOfContract: 0,
    maxRetgAmt: 0,
    percentOfContAmt: 0,
    inclAcoInMaxRetg: false,
    maxRetDistStyle: 'C-Composite Percentage same on all Items',
    notes: '',
    exhibitAJobsiteRules: false,
    exhibitBLeedRequirements: false,
    exhibitCInsurance: false,
    exhibitDBillingProcedures: false,
    exhibitESchedule: false,
    exhibitFPlansAndSpecs: false,
    bondRequired: false,
    jhasRequired: false,
    jhasReqByDate: '',
    plansAndSpecsIndexFilepath: '',
    maxRetentionMode: 'none',
    percentOfSubcontract: 0,
    retentionAmount: 0,
    maxAmtByPercent: 0,
    includeChgOrdersInMaxRetention: false,
    retentionApprove: false,
    adjustMaximumInvoice: 'C-Composite Percentage same on all Items',
    distribution: [],
    items: [],
    inclusionsExclusions: [],
    changeOrders: [],
    certificates: [],
    complianceCodes: [],
    attachments: [],
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

const SEED_AUTHORS = ['K. Nguyen', 'M. Alvarez', 'D. Whitfield', 'T. Priya', 'R. Osei']

const SEED_INCLUSIONS = [
  'All labor, material, equipment, and supervision for the scope shown on the contract documents.',
  'Shop drawings, product data, and samples required by the specifications.',
  'Daily cleanup and removal of debris generated by this trade.',
  'Layout from control lines established by the general contractor.',
  'Manufacturer warranty and closeout documentation at substantial completion.',
  'Coordination drawings with adjacent trades prior to fabrication.',
]

const SEED_EXCLUSIONS = [
  'Temporary heat, hoisting, and site power.',
  'Overtime or premium-time work unless authorized in writing.',
  'Permits, testing, and special inspections furnished by others.',
  'Winter conditions, weather protection, and snow removal.',
  'Cutting and patching of structural elements.',
  'Removal or abatement of hazardous materials.',
]

const SEED_CHANGE_ORDERS = [
  { description: 'Owner-directed scope addition', details: 'Added scope per architect bulletin.' },
  { description: 'Design revision credit', details: 'Scope reduced and credited back to the owner.' },
  { description: 'Unforeseen field condition', details: 'Existing conditions differed from the documents.' },
  { description: 'Schedule acceleration', details: 'Additional crews approved to recover the schedule.' },
  { description: 'Material substitution', details: 'Specified product discontinued; equal approved.' },
]

const SEED_CO_STATUSES = ['Approved', 'Pending', 'Approved and interfaced']

/** Deterministic offset so every subcontract gets a different slice of the pools. */
function seedOffset(id: string): number {
  return Number(id.replace(/\D/g, '')) || 0
}

function seedDate(offset: number, step: number): string {
  const base = new Date(2026, 6, 6)
  base.setDate(base.getDate() + ((offset + step * 5) % 45))
  const month = String(base.getMonth() + 1).padStart(2, '0')
  const day = String(base.getDate()).padStart(2, '0')
  return `${month}-${day}-${base.getFullYear()}`
}

function buildSeedInclusions(
  id: string,
  phase: string,
  phaseDesc: string,
): SubcontractInclusionExclusion[] {
  const offset = seedOffset(id)
  const rows: { type: 'I' | 'E'; detail: string }[] = [
    { type: 'I', detail: SEED_INCLUSIONS[offset % SEED_INCLUSIONS.length] },
    { type: 'I', detail: SEED_INCLUSIONS[(offset + 2) % SEED_INCLUSIONS.length] },
    { type: 'E', detail: SEED_EXCLUSIONS[offset % SEED_EXCLUSIONS.length] },
    { type: 'E', detail: SEED_EXCLUSIONS[(offset + 3) % SEED_EXCLUSIONS.length] },
  ]

  return rows.map((row, index) =>
    createInclusionExclusionRow({
      id: `incl-${id}-${index + 1}`,
      seq: index + 1,
      type: row.type,
      // Inclusions are scoped to the trade's phase; exclusions are contract-wide.
      phase: row.type === 'I' ? phase : '',
      phaseDesc: row.type === 'I' ? phaseDesc : '',
      detail: row.detail,
      dateEntered: seedDate(offset, index),
      enteredBy: SEED_AUTHORS[(offset + index) % SEED_AUTHORS.length],
      notes: index === 1 ? 'Reviewed with the project team.' : '',
    }),
  )
}

function buildSeedChangeOrders(
  id: string,
  subcontract: string,
  vendor: string,
  vendorName: string,
  originalSubcontract: number,
): SubcontractChangeOrder[] {
  const offset = seedOffset(id)
  const count = 2 + (offset % 2)

  const drafts = Array.from({ length: count }, (_, index) => {
    const template = SEED_CHANGE_ORDERS[(offset + index) % SEED_CHANGE_ORDERS.length]
    const status = SEED_CO_STATUSES[(offset + index) % SEED_CO_STATUSES.length]
    const magnitude = round2((originalSubcontract * (1.5 + ((offset + index) % 4))) / 100)
    return {
      index,
      template,
      status,
      // Credits reduce the contract; every other line adds scope.
      amount: template.description.includes('credit') ? -magnitude : magnitude,
    }
  })

  const pendingTotal = drafts
    .filter((draft) => draft.status === 'Pending')
    .reduce((sum, draft) => sum + draft.amount, 0)

  return drafts.map((draft) => {
    const { amount, index, status, template } = draft
    const approved = status !== 'Pending'
    const interfaced = status === 'Approved and interfaced'
    const priorApproved = drafts
      .slice(0, index)
      .filter((prior) => prior.status !== 'Pending')
      .reduce((sum, prior) => sum + prior.amount, 0)
    const currentSubcontract = round2(originalSubcontract + priorApproved)
    const pendingSubCO = approved ? 0 : amount

    return createChangeOrderRow({
      id: `sco-${id}-${index + 1}`,
      subcontractCO: `${subcontract}-${String(index + 1).padStart(3, '0')}`,
      vendor,
      vendorName,
      description: template.description,
      details: template.details,
      date: seedDate(offset, index + 2),
      status,
      reference:
        index % 2 === 0 ? `ACO ${(offset % 40) + index}` : `PCO ${(offset % 40) + index + 7}`,
      readyForAccounting: approved,
      readyForAccountingBy: approved ? SEED_AUTHORS[(offset + index) % SEED_AUTHORS.length] : '',
      dateSent: seedDate(offset, index + 3),
      dateDueBack: seedDate(offset, index + 4),
      dateReceived: approved ? seedDate(offset, index + 5) : '',
      dateApproved: approved ? seedDate(offset, index + 6) : '',
      notes: approved ? 'Backup filed with the monthly billing package.' : 'Awaiting owner sign-off.',
      interfacedDate: interfaced ? seedDate(offset, index + 7) : '',
      originalSubcontract,
      priorApprovedSubCOs: round2(priorApproved),
      currentSubcontract,
      pendingSubCO,
      pendingSubcontract: round2(currentSubcontract + pendingSubCO),
      otherPendingSubCOs: round2(pendingTotal - pendingSubCO),
    })
  })
}

const SEED_CERTIFICATE_TYPES: CertificateType[] = [
  'coi',
  'workersComp',
  'automobile',
  'umbrella',
  'bond',
  'license',
  'w9',
]

function buildSeedCertificates(id: string): SubcontractCertificate[] {
  const offset = seedOffset(id)
  const count = 2 + (offset % 3)

  return Array.from({ length: count }, (_, index) => {
    const certificateType = SEED_CERTIFICATE_TYPES[(offset + index) % SEED_CERTIFICATE_TYPES.length]
    const certified = !(index === count - 1 && offset % 3 === 0)
    return createCertificateRow({
      id: `cert-${id}-${index + 1}`,
      certificateType,
      certified,
      certificateDate: seedDate(offset, index + 1),
      receivedDate: certified ? seedDate(offset, index + 2) : '',
      notes: index === 0 ? 'Additional insured endorsement on file.' : '',
    })
  })
}

type ComplianceTemplate = {
  code: string
  description: string
  type: ComplianceCodeType
}

const BASE_COMPLIANCE_CODES: ComplianceTemplate[] = [
  { code: 'COI', description: 'Certificate of Insurance', type: 'date' },
  { code: 'WC', description: 'Workers Compensation', type: 'date' },
  { code: 'CERTPAY', description: 'Certified Payroll', type: 'yesNo' },
  { code: 'LIEN', description: 'Waiver of Lien', type: 'yesNo' },
]

const EXTRA_COMPLIANCE_BY_GROUP: Record<string, ComplianceTemplate> = {
  MINOR: { code: 'MBE', description: 'Minority Business Certification', type: 'date' },
  SAFE: { code: 'JHA', description: 'Job Hazard Analysis on file', type: 'yesNo' },
  ENV: { code: 'SWPPP', description: 'SWPPP acknowledgment', type: 'yesNo' },
  QC: { code: 'QCPLAN', description: 'Quality control plan received', type: 'yesNo' },
  AISC: { code: 'AISC', description: 'AISC certification current', type: 'date' },
  LEED: { code: 'LEED', description: 'LEED documentation complete', type: 'yesNo' },
  DOT: { code: 'DBE', description: 'DBE certification', type: 'date' },
  NFPA: { code: 'BOND', description: 'Performance and payment bond', type: 'date' },
}

function buildSeedCompliance(id: string, compGroup: string): SubcontractComplianceCode[] {
  if (!compGroup.trim()) return []

  const offset = seedOffset(id)
  const extra = EXTRA_COMPLIANCE_BY_GROUP[compGroup]
  const templates = extra ? [...BASE_COMPLIANCE_CODES, extra] : BASE_COMPLIANCE_CODES

  return templates.map((template, index) => {
    const recurring = template.type === 'yesNo' && index % 2 === 0
    return createComplianceCodeRow({
      id: `comp-${id}-${template.code}`,
      seq: index + 1,
      compCode: template.code,
      type: template.type,
      triggerAtPayment: template.code === 'CERTPAY' || template.code === 'LIEN',
      supplier: template.type === 'date' ? 'Travelers' : '',
      notes: template.description,
      recurring,
      recurrenceStartDate: recurring ? seedDate(offset, index + 1) : '',
      frequency: recurring ? 'weekly' : '',
    })
  })
}

function seedRecord(
  id: string,
  subcontract: string,
  overrides: Partial<SubcontractRecord>,
): SubcontractRecord {
  const record: SubcontractRecord = {
    ...createEmptySubcontract(subcontract),
    id,
    documentType: 'SC - Subcontract',
    slJob: PROJECT_NUMBER,
    slJobDesc: PROJECT_DESCRIPTION,
    payTerms: '30',
    payTermsDesc: 'Net 30 Days',
    compGroup: 'STD',
    compGroupDesc: 'Standard Compliance',
    percentOfContract: 10,
    percentOfContAmt: 10,
    inclAcoInMaxRetg: true,
    exhibitAJobsiteRules: true,
    exhibitCInsurance: true,
    exhibitDBillingProcedures: true,
    exhibitESchedule: true,
    exhibitFPlansAndSpecs: true,
    plansAndSpecsIndexFilepath: `/projects/${PROJECT_NUMBER}/exhibits/${subcontract}-plans-index.pdf`,
    ...overrides,
  }

  const retention = round2((record.totalCurrSubct * record.percentOfContract) / 100)
  const leadItem = record.items[0]

  return {
    ...record,
    maxRetgAmt: overrides.maxRetgAmt ?? retention,
    retentionAmount: overrides.retentionAmount ?? retention,
    percentOfSubcontract: overrides.percentOfSubcontract ?? record.percentOfContract,
    inclusionsExclusions:
      overrides.inclusionsExclusions ??
      buildSeedInclusions(id, leadItem?.phase ?? '', leadItem?.phaseDesc ?? ''),
    changeOrders:
      overrides.changeOrders ??
      buildSeedChangeOrders(
        id,
        subcontract,
        record.vendor,
        record.vendorName,
        record.totalOrigSubct,
      ),
    certificates: overrides.certificates ?? buildSeedCertificates(id),
    complianceCodes: overrides.complianceCodes ?? buildSeedCompliance(id, record.compGroup),
    workflowStatus:
      overrides.workflowStatus ?? seedWorkflowStatus(record.approved, record.slStatus),
  }
}

const SEED_RECORDS: SubcontractRecord[] = [
  {
    ...createEmptySubcontract('0-2001'),
    id: 'sl-2001',
    slDescription: 'One11',
    documentType: 'SC - Lump Sum',
    vendor: '14',
    vendorName: 'Alliance Interiors LLC',
    holdCode: 'S',
    holdCodeDesc: 'Submittal Pending',
    payTerms: '5',
    payTermsDesc: 'Net 5 Days',
    compGroup: 'MINOR',
    compGroupDesc: 'Minority-Owned Business',
    percentOfContract: 6,
    percentOfContAmt: 6,
    totalOrigSubct: 742800,
    totalCurrSubct: 768250,
    startDate: '28-07-26',
    approved: true,
    approvedBy: 'K. Nguyen',
    slStatus: '3 - Pending',
    workflowStatus: 'Submitted for Approval',
    slJob: PROJECT_NUMBER,
    slJobDesc: PROJECT_DESCRIPTION,
    maxRetDistStyle: 'C-Composite Percentage same on all Items',
    exhibitAJobsiteRules: true,
    exhibitBLeedRequirements: true,
    exhibitCInsurance: true,
    exhibitDBillingProcedures: true,
    exhibitESchedule: true,
    exhibitFPlansAndSpecs: true,
    distribution: [
      createDistributionRow({
        id: 'dist-1',
        sendToFirm: '25259',
        sendToFirmName: '1 Clark W Griswold',
        sendToContact: '125',
        contactName: 'Robert R Talner',
        send: true,
        preferredMethod: 'Email',
        sendType: 'Cc',
        dateSent: '07-15-2026',
        dateSigned: '07-18-2026',
      }),
      createDistributionRow({
        id: 'dist-2',
        sendToFirm: '7342',
        sendToFirmName: 'D&M Concrete',
        sendToContact: '1',
        contactName: 'Mark Gosselin',
        send: true,
        preferredMethod: 'Email',
        sendType: 'To',
        dateSent: '07-22-2026',
        dateSigned: '07-25-2026',
      }),
      createDistributionRow({
        id: 'dist-3',
        sendToFirm: '4358',
        sendToFirmName: "Dean's Landscaping",
        sendToContact: '2',
        contactName: 'Bob Smith',
        send: true,
        preferredMethod: 'Email',
        sendType: 'Cc',
        dateSent: '08-01-2026',
        dateSigned: '08-04-2026',
      }),
      createDistributionRow({
        id: 'dist-4',
        sendToFirm: '4562',
        sendToFirmName: 'Carlson Gravel & Sand Co.',
        sendToContact: '1',
        contactName: 'Alex Molden',
        send: false,
        preferredMethod: 'Print',
        sendType: 'To',
        dateSent: '08-09-2026',
        dateSigned: '08-12-2026',
      }),
      createDistributionRow({
        id: 'dist-5',
        sendToFirm: '7897',
        sendToFirmName: 'Construction Supply Co.',
        sendToContact: '1',
        contactName: 'Oscar Owner',
        send: true,
        preferredMethod: 'Fax',
        sendType: 'Bcc',
        dateSent: '08-16-2026',
        dateSigned: '08-19-2026',
      }),
      createDistributionRow({
        id: 'dist-6',
        sendToFirm: '1235',
        sendToFirmName: 'Culver Development LLC',
        sendToContact: '1',
        contactName: 'Thulsi Priya',
        send: true,
        preferredMethod: 'Email',
        sendType: 'To',
        dateSent: '07-28-2026',
        dateSigned: '08-02-2026',
      }),
    ],
    items: [
      createSubcontractItem({
        id: 'item-2001-1',
        seq: 1,
        item: '1',
        description: 'Interior metal framing',
        itemType: '1',
        phase: '09-100',
        phaseDesc: 'Metal Framing',
        costType: 'L',
        um: 'LS',
        amount: 185000,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2001-2',
        seq: 2,
        item: '2',
        description: 'Gypsum board assemblies',
        itemType: '1',
        phase: '09-200',
        phaseDesc: 'Drywall',
        costType: 'L',
        um: 'SF',
        units: 12000,
        unitCost: 4.25,
        amount: 51000,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2001-3',
        seq: 3,
        item: '3',
        description: 'Acoustical ceilings',
        itemType: '1',
        phase: '09-510',
        phaseDesc: 'Ceilings',
        costType: 'L',
        um: 'LS',
        amount: 42800,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2001-4',
        seq: 4,
        item: '4',
        description: 'Performance bond',
        itemType: '4',
        addOn: 'BOND',
        addOnDesc: 'Performance Bond',
        addOnPercent: 2,
        phase: '01-200',
        phaseDesc: 'Allowances',
        costType: 'L',
        um: 'LS',
        amount: 3700,
        send: false,
        wcRetPercent: 0,
        taxType: '',
      }),
      createSubcontractItem({
        id: 'item-2001-5',
        seq: 5,
        item: '5',
        description: 'Doors, frames, and hardware',
        itemType: '1',
        phase: '08-100',
        phaseDesc: 'Doors and Hardware',
        costType: 'L',
        um: 'LS',
        amount: 67450,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
        interfaced: true,
        interfaceDate: '07-15-2026',
        interfaceMonth: 'June, 2026',
      }),
      createSubcontractItem({
        id: 'item-2001-6',
        seq: 6,
        item: '6',
        description: 'Architectural millwork',
        itemType: '1',
        phase: '06-400',
        phaseDesc: 'Architectural Woodwork',
        costType: 'L',
        um: 'LS',
        amount: 89200,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
        notes: 'Shop drawings approved 07-08-2026.',
        interfaced: true,
        interfaceDate: '07-15-2026',
        interfaceMonth: 'June, 2026',
      }),
      createSubcontractItem({
        id: 'item-2001-7',
        seq: 7,
        item: '7',
        description: 'Interior glazing and storefront',
        itemType: '1',
        phase: '08-800',
        phaseDesc: 'Glazing',
        costType: 'L',
        um: 'LS',
        amount: 42300,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
        interfaced: true,
        interfaceDate: '07-22-2026',
        interfaceMonth: 'July, 2026',
      }),
      createSubcontractItem({
        id: 'item-2001-8',
        seq: 8,
        item: '8',
        description: 'Acoustic ceiling systems',
        itemType: '1',
        phase: '09-200',
        phaseDesc: 'Ceilings',
        costType: 'L',
        um: 'LS',
        amount: 31850,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
        interfaced: true,
        interfaceDate: '07-22-2026',
        interfaceMonth: 'July, 2026',
      }),
      createSubcontractItem({
        id: 'item-2001-9',
        seq: 9,
        item: '9',
        description: 'Resilient flooring and base',
        itemType: '1',
        phase: '09-600',
        phaseDesc: 'Flooring',
        costType: 'L',
        um: 'SF',
        units: 12400,
        unitCost: 4.75,
        amount: 58900,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
        interfaced: true,
        interfaceDate: '07-29-2026',
        interfaceMonth: 'July, 2026',
      }),
      createSubcontractItem({
        id: 'item-2001-10',
        seq: 10,
        item: '10',
        description: 'Window treatments and blinds',
        itemType: '1',
        phase: '12-200',
        phaseDesc: 'Window Treatments',
        costType: 'L',
        um: 'LS',
        amount: 15600,
        send: true,
        wcRetPercent: 6,
        taxCode: 'TX01',
        notes: 'Lead times confirmed with supplier.',
        interfaced: true,
        interfaceDate: '07-29-2026',
        interfaceMonth: 'July, 2026',
      }),
    ],
    inclusionsExclusions: [
      createInclusionExclusionRow({
        id: 'incl-2001-1',
        seq: 1,
        type: 'I',
        phase: '08-100',
        phaseDesc: 'Doors and Hardware',
        detail: 'All shop drawings, submittals, and product data for door assemblies.',
        dateEntered: '07-02-2026',
        enteredBy: 'K. Nguyen',
        notes: 'Submittal log tracked in the compliance portal.',
      }),
      createInclusionExclusionRow({
        id: 'incl-2001-2',
        seq: 2,
        type: 'I',
        phase: '06-400',
        phaseDesc: 'Architectural Woodwork',
        detail: 'Field measurements and templating prior to fabrication.',
        dateEntered: '07-02-2026',
        enteredBy: 'K. Nguyen',
        notes: '',
      }),
      createInclusionExclusionRow({
        id: 'incl-2001-3',
        seq: 3,
        type: 'E',
        phase: '',
        phaseDesc: '',
        detail: 'Temporary heat, hoisting, and site power.',
        dateEntered: '07-06-2026',
        enteredBy: 'M. Alvarez',
        notes: 'Provided by the general contractor.',
      }),
      createInclusionExclusionRow({
        id: 'incl-2001-4',
        seq: 4,
        type: 'E',
        phase: '09-600',
        phaseDesc: 'Flooring',
        detail: 'Moisture mitigation or floor levelling beyond 1/8 inch in 10 feet.',
        dateEntered: '07-06-2026',
        enteredBy: 'M. Alvarez',
        notes: 'Priced separately if required after slab testing.',
      }),
      createInclusionExclusionRow({
        id: 'incl-2001-5',
        seq: 5,
        type: 'E',
        phase: '',
        phaseDesc: '',
        detail: 'Overtime or premium-time work unless authorized in writing.',
        dateEntered: '07-14-2026',
        enteredBy: 'T. Priya',
        notes: '',
      }),
    ],
    changeOrders: [
      createChangeOrderRow({
        id: 'sco-2001-1',
        subcontractCO: '0-2001-001',
        vendor: '14',
        vendorName: 'Alliance Interiors LLC',
        description: 'Added hardware for corridor doors',
        details: 'Upgraded to hospital-grade hinges and closers on 12 corridor doors.',
        date: '07-15-2026',
        status: 'Approved',
        reference: 'ACO 12',
        readyForAccounting: true,
        readyForAccountingBy: 'K. Nguyen',
        dateSent: '07-16-2026',
        dateDueBack: '07-23-2026',
        dateReceived: '07-21-2026',
        dateApproved: '07-24-2026',
        notes: 'Backup filed with the July billing package.',
        interfacedDate: '07-27-2026',
        originalSubcontract: 185000,
        priorApprovedSubCOs: 0,
        currentSubcontract: 185000,
        pendingSubCO: 0,
        pendingSubcontract: 185000,
        otherPendingSubCOs: 8450,
      }),
      createChangeOrderRow({
        id: 'sco-2001-2',
        subcontractCO: '0-2001-002',
        vendor: '14',
        vendorName: 'Alliance Interiors LLC',
        description: 'Revised millwork at reception',
        details: 'Reception transaction counter reworked per architect bulletin 04.',
        date: '07-22-2026',
        status: 'Pending',
        reference: 'PCO 27',
        readyForAccounting: false,
        dateSent: '07-23-2026',
        dateDueBack: '07-30-2026',
        notes: 'Awaiting owner sign-off on the revised counter detail.',
        originalSubcontract: 185000,
        priorApprovedSubCOs: 6200,
        currentSubcontract: 191200,
        pendingSubCO: 8450,
        pendingSubcontract: 199650,
        otherPendingSubCOs: 0,
      }),
      createChangeOrderRow({
        id: 'sco-2001-3',
        subcontractCO: '0-2001-003',
        vendor: '14',
        vendorName: 'Alliance Interiors LLC',
        description: 'Credit for deleted window treatments',
        details: 'Level 3 blinds removed from scope and returned to owner supply.',
        date: '07-29-2026',
        status: 'Approved',
        reference: 'ACO 15',
        readyForAccounting: false,
        dateSent: '07-30-2026',
        dateDueBack: '08-06-2026',
        dateReceived: '08-04-2026',
        dateApproved: '08-07-2026',
        notes: 'Credit confirmed against the owner supply allowance.',
        originalSubcontract: 185000,
        priorApprovedSubCOs: 6200,
        currentSubcontract: 191200,
        pendingSubCO: 0,
        pendingSubcontract: 191200,
        otherPendingSubCOs: 8450,
      }),
    ],
    certificates: [
      createCertificateRow({
        id: 'cert-2001-1',
        certificateType: 'coi',
        certified: true,
        certificateDate: '07-01-2026',
        receivedDate: '07-03-2026',
        notes: 'Additional insured endorsement on file.',
      }),
      createCertificateRow({
        id: 'cert-2001-2',
        certificateType: 'workersComp',
        certified: true,
        certificateDate: '07-01-2026',
        receivedDate: '07-03-2026',
        notes: '',
      }),
      createCertificateRow({
        id: 'cert-2001-3',
        certificateType: 'automobile',
        certified: false,
        certificateDate: '06-15-2026',
        receivedDate: '',
        notes: 'Renewal requested; coverage lapsed.',
      }),
      createCertificateRow({
        id: 'cert-2001-4',
        certificateType: 'bond',
        certified: true,
        certificateDate: '07-08-2026',
        receivedDate: '07-10-2026',
        notes: 'Performance and payment bond.',
      }),
    ],
    complianceCodes: [
      createComplianceCodeRow({
        id: 'comp-2001-COI',
        seq: 1,
        compCode: 'COI',
        type: 'date',
        triggerAtPayment: false,
        supplier: 'Travelers',
        notes: 'Certificate of Insurance',
        recurring: false,
      }),
      createComplianceCodeRow({
        id: 'comp-2001-WC',
        seq: 2,
        compCode: 'WC',
        type: 'date',
        triggerAtPayment: false,
        supplier: 'The Hartford',
        notes: 'Workers Compensation',
        recurring: false,
      }),
      createComplianceCodeRow({
        id: 'comp-2001-CERTPAY',
        seq: 3,
        compCode: 'CERTPAY',
        type: 'yesNo',
        triggerAtPayment: true,
        notes: 'Weekly certified payroll received.',
        recurring: true,
        recurrenceStartDate: '07-18-2026',
        frequency: 'weekly',
      }),
      createComplianceCodeRow({
        id: 'comp-2001-LIEN',
        seq: 4,
        compCode: 'LIEN',
        type: 'yesNo',
        triggerAtPayment: true,
        notes: 'Conditional waiver due with the next pay application.',
        recurring: false,
      }),
      createComplianceCodeRow({
        id: 'comp-2001-MBE',
        seq: 5,
        compCode: 'MBE',
        type: 'date',
        triggerAtPayment: false,
        notes: 'Matches Comp Group MINOR.',
        recurring: false,
      }),
    ],
  },
  {
    ...createEmptySubcontract('0-2002'),
    id: 'sl-2002',
    slDescription: 'General Conditions',
    documentType: 'SC - Cost Plus',
    vendor: '2205',
    vendorName: 'General Conditions Services LLC',
    holdCode: 'P',
    holdCodeDesc: 'Permit Pending',
    payTerms: '7',
    payTermsDesc: 'Net 7 Days',
    compGroup: 'SAFE',
    compGroupDesc: 'Safety Compliance Program',
    percentOfContract: 4,
    percentOfContAmt: 4,
    totalOrigSubct: 386200,
    totalCurrSubct: 401950,
    startDate: '15-07-26',
    approved: true,
    approvedBy: 'K. Nguyen',
    slStatus: '3 - Pending',
    workflowStatus: 'Partial Approval',
    slJob: PROJECT_NUMBER,
    slJobDesc: PROJECT_DESCRIPTION,
    maxRetDistStyle: 'C-Composite Percentage same on all Items',
    exhibitAJobsiteRules: true,
    exhibitBLeedRequirements: true,
    exhibitCInsurance: true,
    exhibitDBillingProcedures: true,
    exhibitESchedule: true,
    exhibitFPlansAndSpecs: true,
    inclusionsExclusions: buildSeedInclusions('sl-2002', '01-500', 'Temporary Facilities'),
    changeOrders: buildSeedChangeOrders(
      'sl-2002',
      '0-2002',
      '2205',
      'General Conditions Services LLC',
      386200,
    ),
    certificates: buildSeedCertificates('sl-2002'),
    complianceCodes: buildSeedCompliance('sl-2002', 'SAFE'),
  },
  seedRecord('sl-2003', '0-2003', {
    slDescription: 'Sitework & Mass Excavation',
    documentType: 'SC - Unit Price',
    vendor: '1042',
    vendorName: 'Granite Earthworks Inc',
    holdCode: 'E',
    holdCodeDesc: 'Environmental Review',
    payTerms: '10',
    payTermsDesc: '1% 10 Net 30',
    compGroup: 'ENV',
    compGroupDesc: 'Environmental Compliance',
    percentOfContract: 5,
    percentOfContAmt: 5,
    totalOrigSubct: 1284500,
    totalCurrSubct: 1342750,
    startDate: '03-08-26',
    approved: true,
    approvedBy: 'D. Whitfield',
    slStatus: '0 - Open',
    bondRequired: true,
    jhasRequired: true,
    jhasReqByDate: '27-07-26',
    notes: 'Phase 1 cut and fill complete; import fill priced by ACO 001.',
    distribution: [
      createDistributionRow({
        id: 'dist-2003-1',
        responsiblePerson: '401',
        respPersonName: 'Dana Whitfield',
        sendToFirm: '1042',
        sendToFirmName: 'Granite Earthworks Inc',
        sendToContact: '318',
        contactName: 'Marcus Reed',
        send: true,
        sendType: 'To',
        dateSent: '2026-08-04',
      }),
    ],
  }),
  seedRecord('sl-2004', '0-2004', {
    slDescription: 'Cast-in-Place Concrete',
    documentType: 'SC - Lump Sum',
    vendor: '1187',
    vendorName: 'Cornerstone Concrete LLC',
    holdCode: 'Q',
    holdCodeDesc: 'Quality Hold - Mix Design',
    payTerms: '14',
    payTermsDesc: 'Net 14 Days',
    compGroup: 'QC',
    compGroupDesc: 'Quality Control Program',
    percentOfContract: 7,
    percentOfContAmt: 7,
    totalOrigSubct: 2415000,
    totalCurrSubct: 2489300,
    startDate: '10-08-26',
    approved: true,
    approvedBy: 'D. Whitfield',
    slStatus: '0 - Open',
    bondRequired: true,
    jhasRequired: true,
    jhasReqByDate: '03-08-26',
    exhibitBLeedRequirements: true,
    notes: 'Slab-on-grade pours sequenced with steel delivery.',
  }),
  seedRecord('sl-2005', '0-2005', {
    slDescription: 'Structural Steel & Metal Decking',
    documentType: 'SC - Unit Price',
    vendor: '1250',
    vendorName: 'Ironclad Steel Erectors',
    holdCode: 'F',
    holdCodeDesc: 'Fabrication Drawings Pending',
    payTerms: '15',
    payTermsDesc: 'Net 15 Days',
    compGroup: 'AISC',
    compGroupDesc: 'AISC Certified Fabricator',
    percentOfContract: 8,
    percentOfContAmt: 8,
    totalOrigSubct: 3150000,
    totalCurrSubct: 3150000,
    startDate: '24-08-26',
    approved: true,
    approvedBy: 'M. Alvarez',
    slStatus: '0 - Open',
    bondRequired: true,
    jhasRequired: true,
    jhasReqByDate: '17-08-26',
    distribution: [
      createDistributionRow({
        id: 'dist-2005-1',
        responsiblePerson: '404',
        respPersonName: 'Miguel Alvarez',
        sendToFirm: '1250',
        sendToFirmName: 'Ironclad Steel Erectors',
        sendToContact: '522',
        contactName: 'Priya Raman',
        send: true,
        sendType: 'To',
        dateSent: '08-25-2026',
        dateSigned: '08-28-2026',
      }),
      createDistributionRow({
        id: 'dist-2005-2',
        sendToFirm: '9001',
        sendToFirmName: 'Halvorsen Design Group',
        sendToContact: '77',
        contactName: 'Ellen Park',
        send: true,
        sendType: 'Cc',
        dateSent: '08-18-2026',
        dateSigned: '08-21-2026',
      }),
      createDistributionRow({
        id: 'dist-2005-3',
        sendToFirm: '7342',
        sendToFirmName: 'D&M Concrete',
        sendToContact: '1',
        contactName: 'Mark Gosselin',
        send: true,
        preferredMethod: 'Email',
        sendType: 'To',
        dateSent: '08-20-2026',
        dateSigned: '08-23-2026',
      }),
      createDistributionRow({
        id: 'dist-2005-4',
        sendToFirm: '4358',
        sendToFirmName: "Dean's Landscaping",
        sendToContact: '2',
        contactName: 'Bob Smith',
        send: true,
        preferredMethod: 'Email',
        sendType: 'Cc',
        dateSent: '08-11-2026',
        dateSigned: '08-14-2026',
      }),
      createDistributionRow({
        id: 'dist-2005-5',
        sendToFirm: '4562',
        sendToFirmName: 'Carlson Gravel & Sand Co.',
        sendToContact: '1',
        contactName: 'Alex Molden',
        send: false,
        preferredMethod: 'Print',
        sendType: 'To',
        dateSent: '08-06-2026',
        dateSigned: '08-08-2026',
      }),
      createDistributionRow({
        id: 'dist-2005-6',
        sendToFirm: '1235',
        sendToFirmName: 'Culver Development LLC',
        sendToContact: '1',
        contactName: 'Thulsi Priya',
        send: true,
        preferredMethod: 'Fax',
        sendType: 'Bcc',
        dateSent: '08-03-2026',
        dateSigned: '08-05-2026',
      }),
    ],
    items: [
      createSubcontractItem({
        id: 'item-2005-1',
        seq: 1,
        item: '1',
        description: 'Structural steel fabrication',
        itemType: '1',
        phase: '05-120',
        phaseDesc: 'Structural Steel',
        costType: 'L',
        um: 'TN',
        units: 185,
        unitCost: 4200,
        amount: 777000,
        send: true,
        wcRetPercent: 8,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2005-2',
        seq: 2,
        item: '2',
        description: 'Steel erection',
        itemType: '1',
        phase: '05-120',
        phaseDesc: 'Structural Steel',
        costType: 'L',
        um: 'LS',
        amount: 412500,
        send: true,
        wcRetPercent: 8,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2005-3',
        seq: 3,
        item: '3',
        description: 'Metal decking',
        itemType: '1',
        phase: '05-300',
        phaseDesc: 'Metal Decking',
        costType: 'M',
        um: 'SF',
        units: 48000,
        unitCost: 6.15,
        amount: 295200,
        send: true,
        wcRetPercent: 8,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2005-4',
        seq: 4,
        item: '4',
        description: 'Misc metals and stairs',
        itemType: '1',
        phase: '05-500',
        phaseDesc: 'Metal Fabrications',
        costType: 'L',
        um: 'LS',
        amount: 86400,
        send: false,
        wcRetPercent: 8,
        taxCode: 'TX01',
      }),
      createSubcontractItem({
        id: 'item-2005-5',
        seq: 5,
        item: '5',
        description: 'Embeds and anchor bolts',
        itemType: '1',
        phase: '05-120',
        phaseDesc: 'Structural Steel',
        costType: 'M',
        um: 'LS',
        amount: 31800,
        send: true,
        wcRetPercent: 8,
        taxCode: 'TX01',
        interfaced: true,
        interfaceDate: '08-01-2026',
        interfaceMonth: 'June, 2026',
      }),
      createSubcontractItem({
        id: 'item-2005-6',
        seq: 6,
        item: '6',
        description: 'Add-on — mill certification',
        itemType: '4',
        addOn: 'CERT',
        addOnDesc: 'Mill Certifications',
        addOnPercent: 1.5,
        phase: '05-120',
        phaseDesc: 'Structural Steel',
        costType: 'L',
        um: 'LS',
        amount: 17850,
        send: true,
        wcRetPercent: 0,
        taxType: '',
        interfaced: true,
        interfaceDate: '08-01-2026',
        interfaceMonth: 'June, 2026',
      }),
    ],
  }),
  seedRecord('sl-2006', '0-2006', {
    slDescription: 'Unit Masonry',
    documentType: 'SC - Cost Plus',
    vendor: '1311',
    vendorName: 'Heritage Masonry Co',
    holdCode: 'I',
    holdCodeDesc: 'Insurance Certificate Expired',
    payTerms: '20',
    payTermsDesc: 'Net 20 Days',
    compGroup: 'MASN',
    compGroupDesc: 'Masonry Trade Compliance',
    percentOfContract: 9,
    percentOfContAmt: 9,
    totalOrigSubct: 865400,
    totalCurrSubct: 865400,
    startDate: '07-09-26',
    slStatus: '3 - Pending',
    workflowStatus: 'Rejected',
    claimApprovalRequired: true,
    notes: 'Release hold once updated COI is on file.',
  }),
  seedRecord('sl-2007', '0-2007', {
    slDescription: 'Roofing & Waterproofing',
    documentType: 'SC - T&M',
    vendor: '1398',
    vendorName: 'Summit Roofing Systems',
    holdCode: 'W',
    holdCodeDesc: 'Warranty Documentation Pending',
    payTerms: '21',
    payTermsDesc: 'Net 21 Days',
    compGroup: 'ROOF',
    compGroupDesc: 'Roofing Manufacturer Certification',
    percentOfContract: 6,
    percentOfContAmt: 6,
    totalOrigSubct: 742800,
    totalCurrSubct: 768150,
    startDate: '21-09-26',
    approved: true,
    approvedBy: 'M. Alvarez',
    slStatus: '0 - Open',
    exhibitBLeedRequirements: true,
    bondRequired: true,
    notes: 'Cool-roof membrane required for LEED credit SS-7.',
  }),
  seedRecord('sl-2008', '0-2008', {
    slDescription: 'Glass, Glazing & Curtain Wall',
    documentType: 'SC - Design-Build',
    vendor: '1425',
    vendorName: 'ClearView Glazing',
    holdCode: 'D',
    holdCodeDesc: 'Design Submittal Review',
    payTerms: '25',
    payTermsDesc: 'Net 25 Days',
    compGroup: 'GLZ',
    compGroupDesc: 'Glazing LEED Compliance',
    percentOfContract: 11,
    percentOfContAmt: 11,
    totalOrigSubct: 1676200,
    totalCurrSubct: 1676200,
    startDate: '05-10-26',
    approved: true,
    approvedBy: 'M. Alvarez',
    slStatus: '0 - Open',
    exhibitBLeedRequirements: true,
  }),
  seedRecord('sl-2009', '0-2009', {
    slDescription: 'Metal Framing & Drywall',
    documentType: 'SC - Lump Sum',
    vendor: '1502',
    vendorName: 'Precision Interiors',
    holdCode: 'C',
    holdCodeDesc: 'Coordination Drawings Pending',
    payTerms: '30',
    payTermsDesc: 'Net 30 Days',
    compGroup: 'ACOUS',
    compGroupDesc: 'Acoustic Rating Compliance',
    percentOfContract: 12,
    percentOfContAmt: 12,
    totalOrigSubct: 1102000,
    totalCurrSubct: 1102000,
    startDate: '19-10-26',
    slStatus: '3 - Pending',
    claimApprovalRequired: true,
    jhasRequired: true,
    jhasReqByDate: '12-10-26',
  }),
  seedRecord('sl-2010', '0-2010', {
    slDescription: 'Painting & Wall Coverings',
    documentType: 'SC - Unit Price',
    vendor: '1566',
    vendorName: 'Spectrum Painting',
    holdCode: 'V',
    holdCodeDesc: 'VOC Compliance Review',
    payTerms: '35',
    payTermsDesc: '2% 10 Net 35',
    compGroup: 'VOC',
    compGroupDesc: 'Low-VOC Materials Program',
    percentOfContract: 5.5,
    percentOfContAmt: 5.5,
    totalOrigSubct: 318600,
    totalCurrSubct: 318600,
    startDate: '02-11-26',
    slStatus: '3 - Pending',
    exhibitBLeedRequirements: true,
    notes: 'Low-VOC coatings per spec section 09 91 00.',
  }),
  seedRecord('sl-2011', '0-2011', {
    slDescription: 'Flooring & Ceramic Tile',
    documentType: 'SC - Cost Plus',
    vendor: '1604',
    vendorName: 'Meridian Flooring Group',
    holdCode: 'M',
    holdCodeDesc: 'Material Samples Pending',
    payTerms: '40',
    payTermsDesc: 'Net 40 Days',
    compGroup: 'FLR',
    compGroupDesc: 'Flooring Warranty Program',
    percentOfContract: 13,
    percentOfContAmt: 13,
    totalOrigSubct: 486900,
    totalCurrSubct: 486900,
    startDate: '16-11-26',
    slStatus: '3 - Pending',
  }),
  seedRecord('sl-2012', '0-2012', {
    slDescription: 'Fire Protection Sprinklers',
    documentType: 'SC - T&M',
    vendor: '1688',
    vendorName: 'Guardian Fire Systems',
    holdCode: 'N',
    holdCodeDesc: 'NFPA Inspection Pending',
    payTerms: '45',
    payTermsDesc: 'Net 45 Days',
    compGroup: 'NFPA',
    compGroupDesc: 'Fire Code Compliance',
    percentOfContract: 6.5,
    percentOfContAmt: 6.5,
    totalOrigSubct: 624300,
    totalCurrSubct: 641700,
    startDate: '30-11-26',
    approved: true,
    approvedBy: 'D. Whitfield',
    slStatus: '0 - Open',
    bondRequired: true,
    jhasRequired: true,
    jhasReqByDate: '23-11-26',
  }),
  seedRecord('sl-2013', '0-2013', {
    slDescription: 'Plumbing & Site Utilities',
    documentType: 'SC - Lump Sum',
    vendor: '1725',
    vendorName: 'BlueLine Plumbing',
    holdCode: 'T',
    holdCodeDesc: 'Tax Certificate Pending',
    payTerms: '50',
    payTermsDesc: 'Net 50 Days',
    compGroup: 'PLMB',
    compGroupDesc: 'Plumbing Code Compliance',
    percentOfContract: 10.5,
    percentOfContAmt: 10.5,
    totalOrigSubct: 1058400,
    totalCurrSubct: 1058400,
    startDate: '14-12-26',
    approved: true,
    approvedBy: 'D. Whitfield',
    slStatus: '0 - Open',
    jhasRequired: true,
    jhasReqByDate: '07-12-26',
  }),
  seedRecord('sl-2014', '0-2014', {
    slDescription: 'HVAC & Building Controls',
    documentType: 'SC - Design-Build',
    vendor: '1790',
    vendorName: 'Apex Mechanical',
    holdCode: 'B',
    holdCodeDesc: 'Balancing Report Pending',
    payTerms: '55',
    payTermsDesc: 'Net 55 Days',
    compGroup: 'MECH',
    compGroupDesc: 'Mechanical Trade Compliance',
    percentOfContract: 9.5,
    percentOfContAmt: 9.5,
    totalOrigSubct: 2730500,
    totalCurrSubct: 2812400,
    startDate: '04-01-27',
    approved: true,
    approvedBy: 'M. Alvarez',
    slStatus: '0 - Open',
    exhibitBLeedRequirements: true,
    bondRequired: true,
    notes: 'Commissioning scope carried by ACO 004.',
    distribution: [
      createDistributionRow({
        id: 'dist-2014-1',
        responsiblePerson: '404',
        respPersonName: 'Miguel Alvarez',
        sendToFirm: '1790',
        sendToFirmName: 'Apex Mechanical',
        sendToContact: '640',
        contactName: 'Grace Okafor',
        send: true,
        sendType: 'To',
        dateSent: '2027-01-05',
      }),
    ],
  }),
  seedRecord('sl-2015', '0-2015', {
    slDescription: 'Electrical & Low Voltage',
    documentType: 'SC - Unit Price',
    vendor: '1834',
    vendorName: 'Voltix Electrical',
    holdCode: 'G',
    holdCodeDesc: 'Grounding Inspection Pending',
    payTerms: '60',
    payTermsDesc: 'Net 60 Days',
    compGroup: 'ELEC',
    compGroupDesc: 'Electrical Trade Compliance',
    percentOfContract: 8.5,
    percentOfContAmt: 8.5,
    totalOrigSubct: 2984750,
    totalCurrSubct: 2984750,
    startDate: '18-01-27',
    approved: true,
    approvedBy: 'M. Alvarez',
    slStatus: '0 - Open',
    bondRequired: true,
    jhasRequired: true,
    jhasReqByDate: '11-01-27',
  }),
  seedRecord('sl-2016', '0-2016', {
    slDescription: 'Elevators & Conveying Systems',
    documentType: 'SC - Guaranteed Max',
    vendor: '1901',
    vendorName: 'Vertex Elevator Co',
    holdCode: 'A',
    holdCodeDesc: 'Acceptance Testing Pending',
    payTerms: '65',
    payTermsDesc: 'Net 65 Days',
    compGroup: 'ELEV',
    compGroupDesc: 'Elevator Safety Compliance',
    percentOfContract: 4,
    percentOfContAmt: 4,
    totalOrigSubct: 915000,
    totalCurrSubct: 915000,
    startDate: '01-02-27',
    approved: true,
    approvedBy: 'D. Whitfield',
    slStatus: '1 - Complete',
    bondRequired: true,
    notes: 'Final inspection signed off; closeout docs pending.',
  }),
  seedRecord('sl-2017', '0-2017', {
    slDescription: 'Landscaping & Irrigation',
    documentType: 'SC - Lump Sum',
    vendor: '1955',
    vendorName: 'GreenScape Contractors',
    holdCode: 'L',
    holdCodeDesc: 'Lien Waiver Outstanding',
    payTerms: '70',
    payTermsDesc: 'Net 70 Days',
    compGroup: 'LEED',
    compGroupDesc: 'LEED Landscape Compliance',
    percentOfContract: 7.5,
    percentOfContAmt: 7.5,
    totalOrigSubct: 274300,
    totalCurrSubct: 274300,
    startDate: '15-02-27',
    slStatus: '3 - Pending',
    exhibitBLeedRequirements: true,
  }),
  seedRecord('sl-2018', '0-2018', {
    slDescription: 'Asphalt Paving & Striping',
    documentType: 'SC - Unit Price',
    vendor: '2011',
    vendorName: 'Blackline Paving',
    holdCode: 'R',
    holdCodeDesc: 'Retainage Release Pending',
    payTerms: '75',
    payTermsDesc: 'Net 75 Days',
    compGroup: 'DOT',
    compGroupDesc: 'DOT Paving Compliance',
    percentOfContract: 14,
    percentOfContAmt: 14,
    totalOrigSubct: 538900,
    totalCurrSubct: 551200,
    startDate: '01-03-27',
    approved: true,
    approvedBy: 'D. Whitfield',
    slStatus: '2 - Closed',
    jhasRequired: true,
    jhasReqByDate: '22-02-27',
    notes: 'Closed 12-03-27 after final retainage release.',
  }),
]

function parseSubcontractSequence(value: string): number | null {
  const match = value.match(/(\d+)\s*$/)
  return match ? Number(match[1]) : null
}

export function getNextSubcontractNumber(records: SubcontractRecord[]): string {
  const sequences = records
    .map((record) => parseSubcontractSequence(record.subcontract))
    .filter((value): value is number => value !== null)

  const next = sequences.length > 0 ? Math.max(...sequences) + 1 : 2001
  return `0-${next}`
}

function normalizeRecord(record: SubcontractRecord): SubcontractRecord {
  return {
    ...record,
    workflowStatus: record.workflowStatus ?? seedWorkflowStatus(record.approved, record.slStatus),
  }
}

function readStorage(): SubcontractRecord[] {
  if (typeof window === 'undefined') return [...SEED_RECORDS]

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECORDS))
    return [...SEED_RECORDS]
  }

  try {
    const parsed = JSON.parse(raw) as SubcontractRecord[]
    return Array.isArray(parsed) ? parsed.map(normalizeRecord) : [...SEED_RECORDS]
  } catch {
    return [...SEED_RECORDS]
  }
}

function writeStorage(records: SubcontractRecord[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function loadSubcontractRecords(): SubcontractRecord[] {
  return readStorage()
}

export function getSubcontractById(id: string): SubcontractRecord | undefined {
  return readStorage().find((record) => record.id === id)
}

export function saveSubcontractRecord(record: SubcontractRecord): SubcontractRecord {
  const records = readStorage()
  const index = records.findIndex((item) => item.id === record.id)
  const next = [...records]

  if (index >= 0) {
    next[index] = record
  } else {
    next.push(record)
  }

  writeStorage(next)
  return record
}

export function deleteSubcontractRecord(id: string): void {
  const next = readStorage().filter((record) => record.id !== id)
  writeStorage(next)
}

export function resetSubcontractSeedData(): void {
  writeStorage(SEED_RECORDS)
}

export function createNewSubcontractRecord(): SubcontractRecord {
  const records = readStorage()
  const subcontractNumber = getNextSubcontractNumber(records)
  return createEmptySubcontract(subcontractNumber)
}

function itemToInterfaceRecord(
  record: SubcontractRecord,
  item: SubcontractItem,
): InterfaceRecord {
  return {
    id: `sl-item-${record.id}-${item.id}`,
    recordType: 'Subcontract',
    status: 'Yet to validate',
    recordId: `${record.subcontract}-${item.seq}`,
    description: item.description || record.slDescription,
    coNumber: item.subCO || '--',
    aco: Number(item.aco) || 0,
    amountToInterface: item.amount,
    currentAmount: item.amount,
    transactionType: item.correcting ? 'Correction' : 'New',
    sourceSubcontractId: record.id,
    sourceItemId: item.id,
  }
}

export function getInterfaceableSubcontractItems(): InterfaceRecord[] {
  return readStorage().flatMap((record) => {
    if (!record.approved) return []
    return (record.items ?? [])
      .filter((item) => item.send && (!item.interfaced || item.correcting))
      .map((item) => itemToInterfaceRecord(record, item))
  })
}

export function markSubcontractItemsInterfaced(
  refs: { subcontractId: string; itemId: string }[],
  month: string,
): void {
  if (refs.length === 0) return

  const date = new Date()
  const interfaceDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`
  const bySubcontract = new Map<string, Set<string>>()

  for (const ref of refs) {
    const ids = bySubcontract.get(ref.subcontractId) ?? new Set<string>()
    ids.add(ref.itemId)
    bySubcontract.set(ref.subcontractId, ids)
  }

  const records = readStorage().map((record) => {
    const itemIds = bySubcontract.get(record.id)
    if (!itemIds) return record
    return {
      ...record,
      items: (record.items ?? []).map((item) =>
        itemIds.has(item.id)
          ? {
              ...item,
              interfaced: true,
              correcting: false,
              interfaceDate: item.interfaceDate || interfaceDate,
              interfaceMonth: item.interfaceMonth || month,
            }
          : item,
      ),
    }
  })

  writeStorage(records)
}

export function formatSubcontractCellValue(
  record: SubcontractRecord,
  key: keyof SubcontractRecord,
): string {
  const value = record[key]

  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (Array.isArray(value)) return ''
  return String(value ?? '')
}
