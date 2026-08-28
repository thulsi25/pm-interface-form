import { INCLUSION_TYPE_OPTIONS } from './subcontractColumns'
import type { SubcontractInclusionExclusion } from './subcontractTypes'

export type InclusionColumnKey = Exclude<keyof SubcontractInclusionExclusion, 'id'>

export type InclusionColumn =
  | { kind: 'text'; key: InclusionColumnKey; header: string; width: string; required?: boolean }
  | {
      kind: 'select'
      key: InclusionColumnKey
      header: string
      width: string
      required?: boolean
      options: { label: string; value: string }[]
    }

export const INCLUSION_STICKY_COLUMN: InclusionColumn = {
  kind: 'text',
  key: 'seq',
  header: 'Seq',
  width: '4.5rem',
  required: true,
}

export const INCLUSION_SCROLL_COLUMNS: InclusionColumn[] = [
  {
    kind: 'select',
    key: 'type',
    header: 'Type',
    width: '9rem',
    required: true,
    options: INCLUSION_TYPE_OPTIONS,
  },
  { kind: 'text', key: 'phase', header: 'Phase', width: '7rem' },
  { kind: 'text', key: 'phaseDesc', header: 'Phase Description', width: '11rem' },
  { kind: 'text', key: 'detail', header: 'Detail', width: '18rem' },
  { kind: 'text', key: 'dateEntered', header: 'Date Entered', width: '8rem' },
  { kind: 'text', key: 'enteredBy', header: 'Entered By', width: '12rem' },
  { kind: 'text', key: 'notes', header: 'Notes', width: '14rem' },
]

/** Sequence is system assigned; the rest are stamped or derived on create. */
const READONLY_KEYS: ReadonlySet<InclusionColumnKey> = new Set([
  'seq',
  'phaseDesc',
  'dateEntered',
  'enteredBy',
])

export function isInclusionCellEditable(key: InclusionColumnKey): boolean {
  return !READONLY_KEYS.has(key)
}

export function formatInclusionColumnValue(
  row: SubcontractInclusionExclusion,
  column: InclusionColumn,
): string {
  const value = row[column.key]
  if (column.kind === 'select') {
    const current = String(value ?? '')
    return column.options.find((option) => option.value === current)?.label ?? current
  }
  return String(value ?? '')
}
