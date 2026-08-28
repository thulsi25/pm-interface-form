import { useCallback, useMemo } from 'react'
import {
  ModusWcCheckbox,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import {
  CHANGE_ORDER_COLUMNS,
  formatChangeOrderColumnValue,
  isChangeOrderCellEditable,
  type ChangeOrderColumn,
} from '../../data/subcontractChangeOrderColumns'
import type { SubcontractChangeOrder, SubcontractRecord } from '../../data/subcontractTypes'
import { readInputChecked } from '../../utils/modusFormEvents'
import { DistributionFilterCell } from './DistributionFilterCell'
import { IconButton, LabeledButton, ToolbarDivider } from './SubcontractToolbarControls'

function changeOrderColumnClass(column: ChangeOrderColumn): string | undefined {
  const sticky = column.key === 'subcontractCO' ? 'sl-sticky-col sl-change-order-co-col' : undefined
  const numeric = column.kind === 'text' && column.numeric ? 'sl-table-col-numeric' : undefined
  const booleanCol = column.kind === 'checkbox' ? 'sl-table-col-boolean' : undefined
  return [sticky, numeric, booleanCol].filter(Boolean).join(' ') || undefined
}

function ChangeOrdersGridToolbar() {
  return (
    <div
      className="sl-grid-toolbar sl-distribution-toolbar"
      role="toolbar"
      aria-label="Change order grid actions"
    >
      <div className="sl-grid-toolbar-group">
        <LabeledButton
          iconName="tune"
          label="Field Properties"
          variant="pill"
          onClick={() => {
            /* Field properties */
          }}
        />
        <ToolbarDivider />
        <IconButton
          ariaLabel="Customize columns"
          iconName="column_properties"
          onClick={() => {
            /* Customize columns */
          }}
        />
        <IconButton
          ariaLabel="Filter"
          iconName="filter"
          onClick={() => {
            /* Filter */
          }}
        />
      </div>
    </div>
  )
}

/**
 * Change orders are created from the change order workflow, so every column is
 * read-only except the Ready for Accounting flag.
 */
export function SubcontractChangeOrdersTab({
  record,
  onChange,
}: {
  record: SubcontractRecord
  onChange: (rows: SubcontractChangeOrder[]) => void
}) {
  const rows = useMemo(() => record.changeOrders ?? [], [record.changeOrders])

  const handleToggleReady = useCallback(
    (id: string, checked: boolean) => {
      onChange(rows.map((row) => (row.id === id ? { ...row, readyForAccounting: checked } : row)))
    },
    [onChange, rows],
  )

  return (
    <div className="sl-distribution-tab">
      <ChangeOrdersGridToolbar />

      <div className="sl-table-scroll sl-distribution-scroll">
        <table className="sl-subcontracts-table sl-distribution-table sl-items-grid-readonly">
          <thead>
            <tr className="sl-column-header-row">
              {CHANGE_ORDER_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={changeOrderColumnClass(column)}
                  scope="col"
                  style={{ minWidth: column.width }}
                >
                  <span className="sl-col-header-label">{column.header}</span>
                </th>
              ))}
            </tr>

            <tr className="sl-column-filter-row">
              {CHANGE_ORDER_COLUMNS.map((column) => (
                <th
                  key={`filter-${column.key}`}
                  className={changeOrderColumnClass(column)}
                  scope="col"
                >
                  {column.kind === 'checkbox' ? null : (
                    <DistributionFilterCell label={column.header} />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="sl-empty-row" colSpan={CHANGE_ORDER_COLUMNS.length}>
                  No change orders yet. Change orders appear here once they are created against
                  this subcontract.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {CHANGE_ORDER_COLUMNS.map((column) => (
                    <td key={`${row.id}-${column.key}`} className={changeOrderColumnClass(column)}>
                      {column.kind === 'checkbox' ? (
                        <ModusWcCheckbox
                          aria-label={`${column.header} for change order ${row.subcontractCO}`}
                          disabled={!isChangeOrderCellEditable(column.key)}
                          size="sm"
                          value={row.readyForAccounting}
                          onInputChange={(e: CustomEvent) =>
                            handleToggleReady(row.id, readInputChecked(e))
                          }
                        />
                      ) : (
                        <ModusWcTypography
                          customClass="sl-table-readonly-cell"
                          hierarchy="p"
                          size="sm"
                        >
                          {formatChangeOrderColumnValue(row, column)}
                        </ModusWcTypography>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
