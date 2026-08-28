import type {
  ComplianceCodeType,
  ComplianceFrequency,
  SubcontractComplianceCode,
} from './subcontractTypes'

export const COMPLIANCE_TYPE_OPTIONS: { label: string; value: ComplianceCodeType }[] = [
  { label: 'Date', value: 'date' },
  { label: 'Yes/No', value: 'yesNo' },
]

export const COMPLIANCE_FREQUENCY_OPTIONS: { label: string; value: ComplianceFrequency }[] = [
  { label: '', value: '' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Semi-Annual', value: 'semiAnnual' },
  { label: 'Annual', value: 'annual' },
]

export type ComplianceColumnKey = Exclude<keyof SubcontractComplianceCode, 'id'>

export type ComplianceColumn =
  | {
      kind: 'text'
      key: Exclude<ComplianceColumnKey, 'type' | 'triggerAtPayment' | 'recurring' | 'frequency'>
      header: string
      width: string
    }
  | { kind: 'checkbox'; key: 'triggerAtPayment' | 'recurring'; header: string; width: string }
  | {
      kind: 'select'
      key: 'type'
      header: string
      width: string
      options: { label: string; value: ComplianceCodeType }[]
    }
  | {
      kind: 'select'
      key: 'frequency'
      header: string
      width: string
      options: { label: string; value: ComplianceFrequency }[]
    }

export const COMPLIANCE_STICKY_COLUMN: ComplianceColumn = {
  kind: 'text',
  key: 'seq',
  header: 'Sequence',
  width: '6.5rem',
}

export const COMPLIANCE_SCROLL_COLUMNS: ComplianceColumn[] = [
  { kind: 'text', key: 'compCode', header: 'Compliance code', width: '9rem' },
  {
    kind: 'select',
    key: 'type',
    header: 'Compliance type',
    width: '9rem',
    options: COMPLIANCE_TYPE_OPTIONS,
  },
  { kind: 'checkbox', key: 'triggerAtPayment', header: 'Trigger at payment', width: '8.5rem' },
  { kind: 'text', key: 'supplier', header: 'Supplier', width: '10rem' },
  { kind: 'text', key: 'notes', header: 'Comments', width: '14rem' },
  { kind: 'checkbox', key: 'recurring', header: 'Recurring', width: '6.5rem' },
  { kind: 'text', key: 'recurrenceStartDate', header: 'Recurrence start date', width: '10rem' },
  {
    kind: 'select',
    key: 'frequency',
    header: 'Frequency',
    width: '8.5rem',
    options: COMPLIANCE_FREQUENCY_OPTIONS,
  },
]

export const COMPLIANCE_COLUMNS: ComplianceColumn[] = [
  COMPLIANCE_STICKY_COLUMN,
  ...COMPLIANCE_SCROLL_COLUMNS,
]

const READONLY_KEYS: ReadonlySet<ComplianceColumnKey> = new Set(['seq', 'compCode'])

export function isComplianceCellEditable(key: ComplianceColumnKey): boolean {
  return !READONLY_KEYS.has(key)
}

export function complianceTypeLabel(type: ComplianceCodeType): string {
  return COMPLIANCE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}
