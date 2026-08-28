import type { CertificateType, SubcontractCertificate } from './subcontractTypes'

export const CERTIFICATE_TYPE_OPTIONS: { label: string; value: CertificateType }[] = [
  { label: 'Certificate of Insurance', value: 'coi' },
  { label: 'Workers Compensation', value: 'workersComp' },
  { label: 'Automobile', value: 'automobile' },
  { label: 'Umbrella', value: 'umbrella' },
  { label: 'Bond', value: 'bond' },
  { label: 'Business License', value: 'license' },
  { label: 'W-9', value: 'w9' },
  { label: 'Other', value: 'other' },
]

export type CertificateColumnKey = Exclude<keyof SubcontractCertificate, 'id'>

export type CertificateColumn =
  | {
      kind: 'select'
      key: 'certificateType'
      header: string
      width: string
      options: { label: string; value: CertificateType }[]
    }
  | { kind: 'checkbox'; key: 'certified'; header: string; width: string }
  | {
      kind: 'text'
      key: Exclude<CertificateColumnKey, 'certificateType' | 'certified'>
      header: string
      width: string
    }

export const CERTIFICATE_STICKY_COLUMN: CertificateColumn = {
  kind: 'select',
  key: 'certificateType',
  header: 'Certificates',
  width: '14rem',
  options: CERTIFICATE_TYPE_OPTIONS,
}

export const CERTIFICATE_SCROLL_COLUMNS: CertificateColumn[] = [
  { kind: 'checkbox', key: 'certified', header: 'Certified', width: '6.5rem' },
  { kind: 'text', key: 'certificateDate', header: 'Certificate Date', width: '9rem' },
  { kind: 'text', key: 'receivedDate', header: 'Received Date', width: '9rem' },
  { kind: 'text', key: 'notes', header: 'User Notes', width: '14rem' },
]

export const CERTIFICATE_COLUMNS: CertificateColumn[] = [
  CERTIFICATE_STICKY_COLUMN,
  ...CERTIFICATE_SCROLL_COLUMNS,
]

export function certificateTypeLabel(value: CertificateType): string {
  return CERTIFICATE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
}
