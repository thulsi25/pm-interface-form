import { useMemo } from 'react'
import type { ITableColumn } from '@trimble-oss/moduswebcomponents'
import { ModusWcTable } from '@trimble-oss/moduswebcomponents-react'
import { SL_STATUS_OPTIONS } from '../../data/subcontractColumns'
import type { SubcontractRecord } from '../../data/subcontractTypes'

const TOTAL_ROW_ID = 'all'

const STATUS_BADGE_COLOR: Record<string, string> = {
  '0 - Open': 'primary',
  '1 - Complete': 'success',
  '2 - Closed': 'high-contrast',
  '3 - Pending': 'warning',
}

interface TotalsRow extends Record<string, unknown> {
  id: string
  status: string
  count: number
  totalOriginal: number
  totalCurrent: number
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** '3 - Pending' reads as a code in a badge; the label alone is enough here. */
function statusLabel(status: string): string {
  return status.replace(/^\d+\s*-\s*/, '')
}

function createStatusCell(row: TotalsRow): HTMLElement {
  if (row.id === TOTAL_ROW_ID) {
    const span = document.createElement('span')
    span.className = 'sl-totals-grand-label'
    span.textContent = row.status
    return span
  }

  const badge = document.createElement('modus-wc-badge')
  badge.setAttribute('color', STATUS_BADGE_COLOR[row.status] ?? 'tertiary')
  badge.setAttribute('size', 'sm')
  badge.setAttribute('variant', 'filled')
  badge.textContent = statusLabel(row.status)
  return badge
}

function createNumberCell(value: unknown, row: TotalsRow, currency: boolean): HTMLElement {
  const span = document.createElement('span')
  span.className =
    row.id === TOTAL_ROW_ID ? 'sl-totals-number sl-totals-grand-label' : 'sl-totals-number'
  const numeric = Number(value ?? 0)
  span.textContent = currency ? formatCurrency(numeric) : String(numeric)
  return span
}

const COLUMNS: ITableColumn[] = [
  {
    id: 'status',
    accessor: 'status',
    header: 'SL Status',
    width: '12rem',
    cellRenderer: (_value, row) => createStatusCell(row as TotalsRow),
  },
  {
    id: 'count',
    accessor: 'count',
    header: 'Subcontracts',
    className: 'sl-totals-col-numeric',
    width: '8rem',
    cellRenderer: (value, row) => createNumberCell(value, row as TotalsRow, false),
  },
  {
    id: 'totalOriginal',
    accessor: 'totalOriginal',
    header: 'Total Original',
    className: 'sl-totals-col-numeric',
    width: '12rem',
    cellRenderer: (value, row) => createNumberCell(value, row as TotalsRow, true),
  },
  {
    id: 'totalCurrent',
    accessor: 'totalCurrent',
    header: 'Total Current',
    className: 'sl-totals-col-numeric',
    width: '12rem',
    cellRenderer: (value, row) => createNumberCell(value, row as TotalsRow, true),
  },
]

export function SubcontractTotalsPanel({ records }: { records: SubcontractRecord[] }) {
  const rows = useMemo<TotalsRow[]>(() => {
    const byStatus = new Map<string, TotalsRow>()

    for (const record of records) {
      const status = record.slStatus || 'Unassigned'
      const row = byStatus.get(status) ?? {
        id: status,
        status,
        count: 0,
        totalOriginal: 0,
        totalCurrent: 0,
      }

      row.count += 1
      row.totalOriginal += record.totalOrigSubct
      row.totalCurrent += record.totalCurrSubct
      byStatus.set(status, row)
    }

    const statusOrder = SL_STATUS_OPTIONS.map((option) => option.value)
    const statusRows = [...byStatus.values()].sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
    )

    const grandTotal = statusRows.reduce<TotalsRow>(
      (acc, row) => ({
        ...acc,
        count: acc.count + row.count,
        totalOriginal: acc.totalOriginal + row.totalOriginal,
        totalCurrent: acc.totalCurrent + row.totalCurrent,
      }),
      {
        id: TOTAL_ROW_ID,
        status: 'All subcontracts',
        count: 0,
        totalOriginal: 0,
        totalCurrent: 0,
      },
    )

    return [...statusRows, grandTotal]
  }, [records])

  return (
    <div className="sl-totals-panel">
      <ModusWcTable
        caption="Subcontract totals by status"
        columns={COLUMNS}
        customClass="sl-totals-table"
        data={rows}
        density="compact"
      />
    </div>
  )
}
