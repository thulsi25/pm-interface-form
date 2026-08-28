import type { SubcontractChangeOrder } from './subcontractTypes'

export type ChangeOrderColumnKey = Exclude<keyof SubcontractChangeOrder, 'id'>

export type ChangeOrderColumn =
  | {
      kind: 'text'
      key: ChangeOrderColumnKey
      header: string
      width: string
      numeric?: boolean
    }
  | { kind: 'checkbox'; key: 'readyForAccounting'; header: string; width: string }

export const CHANGE_ORDER_STICKY_COLUMN: ChangeOrderColumn = {
  kind: 'text',
  key: 'subcontractCO',
  header: 'Subcontract CO',
  width: '9rem',
}

export const CHANGE_ORDER_SCROLL_COLUMNS: ChangeOrderColumn[] = [
  { kind: 'text', key: 'vendor', header: 'Vendor', width: '6rem', numeric: true },
  { kind: 'text', key: 'vendorName', header: 'Vendor Name', width: '12rem' },
  { kind: 'text', key: 'description', header: 'Description', width: '16rem' },
  { kind: 'text', key: 'details', header: 'Details', width: '18rem' },
  { kind: 'text', key: 'date', header: 'Date', width: '8rem' },
  { kind: 'text', key: 'status', header: 'Status', width: '9rem' },
  { kind: 'text', key: 'reference', header: 'Reference', width: '12rem' },
  {
    kind: 'checkbox',
    key: 'readyForAccounting',
    header: 'Ready for Accounting',
    width: '10rem',
  },
  { kind: 'text', key: 'readyForAccountingBy', header: 'Ready for Accounting By', width: '12rem' },
  { kind: 'text', key: 'dateSent', header: 'Date Sent', width: '8rem' },
  { kind: 'text', key: 'dateDueBack', header: 'Date Due Back', width: '8.5rem' },
  { kind: 'text', key: 'dateReceived', header: 'Date Received', width: '8.5rem' },
  { kind: 'text', key: 'dateApproved', header: 'Date Approved', width: '8.5rem' },
  { kind: 'text', key: 'notes', header: 'Notes', width: '14rem' },
  { kind: 'text', key: 'interfacedDate', header: 'Interfaced Date', width: '9rem' },
  {
    kind: 'text',
    key: 'originalSubcontract',
    header: 'Original Subcontract',
    width: '10rem',
    numeric: true,
  },
  {
    kind: 'text',
    key: 'priorApprovedSubCOs',
    header: 'Prior Approved Sub COs',
    width: '11rem',
    numeric: true,
  },
  {
    kind: 'text',
    key: 'currentSubcontract',
    header: 'Current Subcontract',
    width: '10rem',
    numeric: true,
  },
  { kind: 'text', key: 'pendingSubCO', header: 'Pending Sub CO', width: '9rem', numeric: true },
  {
    kind: 'text',
    key: 'pendingSubcontract',
    header: 'Pending Subcontract',
    width: '10rem',
    numeric: true,
  },
  {
    kind: 'text',
    key: 'otherPendingSubCOs',
    header: 'Other Pending Sub COs',
    width: '11rem',
    numeric: true,
  },
]

export const CHANGE_ORDER_COLUMNS: ChangeOrderColumn[] = [
  CHANGE_ORDER_STICKY_COLUMN,
  ...CHANGE_ORDER_SCROLL_COLUMNS,
]

/**
 * Change orders are created from the change order workflow, so this grid only
 * lets the user flag a row as ready for accounting.
 */
export function isChangeOrderCellEditable(key: ChangeOrderColumnKey): boolean {
  return key === 'readyForAccounting'
}

export function formatChangeOrderColumnValue(
  row: SubcontractChangeOrder,
  column: ChangeOrderColumn,
): string {
  const value = row[column.key]
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return String(value ?? '')
}
