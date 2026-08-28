import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  COMPLIANCE_COLUMNS,
  COMPLIANCE_FREQUENCY_OPTIONS,
  COMPLIANCE_TYPE_OPTIONS,
  isComplianceCellEditable,
  type ComplianceColumn,
} from '../../data/subcontractComplianceColumns'
import type {
  ComplianceCodeType,
  ComplianceFrequency,
  SubcontractComplianceCode,
  SubcontractRecord,
} from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { DistributionFilterCell } from './DistributionFilterCell'
import { IconButton, LabeledButton, ToolbarDivider } from './SubcontractToolbarControls'

function toSelectOptions(options: { label: string; value: string }[]): ISelectOption[] {
  return options.map((option) => ({ label: option.label, value: option.value }))
}

function complianceColumnClass(column: ComplianceColumn): string | undefined {
  const sticky = column.key === 'seq' ? 'sl-sticky-col sl-seq-col' : undefined
  const booleanCol = column.kind === 'checkbox' ? 'sl-table-col-boolean' : undefined
  return [sticky, booleanCol].filter(Boolean).join(' ') || undefined
}

function complianceColumnStyle(
  column: ComplianceColumn,
): { minWidth: string; width: string; maxWidth: string } | undefined {
  if (column.key === 'seq') return undefined
  return { minWidth: column.width, width: column.width, maxWidth: column.width }
}

function ComplianceGridToolbar({
  canDelete,
  canUndo,
  onDeleteSelected,
  onUndo,
}: {
  canDelete: boolean
  canUndo: boolean
  onDeleteSelected: () => void
  onUndo: () => void
}) {
  return (
    <div
      className="sl-grid-toolbar sl-distribution-toolbar"
      role="toolbar"
      aria-label="Auto compliance grid actions"
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

      <div className="sl-grid-toolbar-group">
        <IconButton ariaLabel="Undo" disabled={!canUndo} iconName="undo" onClick={onUndo} />
        <ToolbarDivider />
        <IconButton
          ariaLabel="Delete selected"
          disabled={!canDelete}
          iconName="delete"
          tone="danger"
          onClick={onDeleteSelected}
        />
      </div>
    </div>
  )
}

function renderCell(
  row: SubcontractComplianceCode,
  column: ComplianceColumn,
  onChangeRow: (id: string, patch: Partial<SubcontractComplianceCode>) => void,
) {
  const recurrenceLocked = !row.recurring && (column.key === 'recurrenceStartDate' || column.key === 'frequency')

  if (column.kind === 'checkbox') {
    return (
      <ModusWcCheckbox
        aria-label={`${column.header} for ${row.compCode}`}
        size="sm"
        value={row[column.key]}
        onInputChange={(e: CustomEvent) =>
          onChangeRow(row.id, { [column.key]: readInputChecked(e) })
        }
      />
    )
  }

  if (column.kind === 'select') {
    const options =
      column.key === 'type' ? COMPLIANCE_TYPE_OPTIONS : COMPLIANCE_FREQUENCY_OPTIONS
    return (
      <ModusWcSelect
        aria-label={`${column.header} for ${row.compCode}`}
        bordered={false}
        customClass="sl-table-inline-control"
        disabled={recurrenceLocked}
        options={toSelectOptions(options)}
        size="sm"
        value={row[column.key]}
        onInputChange={(e: CustomEvent) => {
          const next = readInputString(e)
          if (column.key === 'type') {
            onChangeRow(row.id, { type: next as ComplianceCodeType })
            return
          }
          onChangeRow(row.id, { frequency: next as ComplianceFrequency })
        }}
      />
    )
  }

  const editable = isComplianceCellEditable(column.key) && !recurrenceLocked
  const display = String(row[column.key] ?? '')

  if (!editable) {
    return (
      <ModusWcTypography customClass="sl-table-readonly-cell" hierarchy="p" size="sm">
        {column.key === 'seq' ? String(row.seq) : display}
      </ModusWcTypography>
    )
  }

  return (
    <ModusWcTextInput
      aria-label={`${column.header} for ${row.compCode}`}
      bordered={false}
      customClass="sl-table-inline-control"
      size="sm"
      value={display}
      onInputChange={(e: CustomEvent) => {
        onChangeRow(row.id, { [column.key]: readInputString(e) })
      }}
    />
  )
}

export function SubcontractAutoComplianceTab({
  record,
  onChange,
  visible = true,
}: {
  record: SubcontractRecord
  onChange: (rows: SubcontractComplianceCode[]) => void
  visible?: boolean
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<SubcontractComplianceCode[][]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => record.complianceCodes ?? [], [record.complianceCodes])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedVisibleCount = rows.filter((row) => selectedSet.has(row.id)).length
  const allVisibleSelected = rows.length > 0 && selectedVisibleCount === rows.length

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((previous) => [...previous, rows])
  }, [rows])

  const handleChangeRow = useCallback(
    (id: string, patch: Partial<SubcontractComplianceCode>) => {
      pushUndoSnapshot()
      onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    },
    [onChange, pushUndoSnapshot, rows],
  )

  const handleUndo = useCallback(() => {
    setUndoStack((previous) => {
      if (previous.length === 0) return previous
      onChange(previous[previous.length - 1])
      return previous.slice(0, -1)
    })
  }, [onChange])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    pushUndoSnapshot()
    const remove = new Set(selectedIds)
    onChange(rows.filter((row) => !remove.has(row.id)))
    setSelectedIds([])
  }, [onChange, pushUndoSnapshot, rows, selectedIds])

  const handleRowSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (checked) next.add(id)
      else next.delete(id)
      return [...next]
    })
  }, [])

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? rows.map((row) => row.id) : [])
    },
    [rows],
  )

  useLayoutEffect(() => {
    if (!visible) return
    scrollRef.current?.scrollTo({ left: 0 })
  }, [visible])

  const emptyMessage = record.compGroup.trim()
    ? 'No compliance codes on this subcontract. Codes can be deleted individually after they are initialized from Comp Group.'
    : 'No compliance codes yet. Assign a Comp Group on the Information tab to initialize Auto Compliance.'

  return (
    <div className="sl-distribution-tab">
      <ComplianceGridToolbar
        canDelete={selectedIds.length > 0}
        canUndo={undoStack.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onUndo={handleUndo}
      />

      <div ref={scrollRef} className="sl-table-scroll sl-distribution-scroll">
        <table className="sl-subcontracts-table sl-distribution-table sl-compliance-table">
          <thead>
            <tr className="sl-column-header-row">
              <th className="sl-sticky-col sl-select-col" scope="col">
                <ModusWcCheckbox
                  aria-label="Select all compliance codes"
                  indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                  size="sm"
                  value={allVisibleSelected}
                  onInputChange={(e: CustomEvent) => handleSelectAll(readInputChecked(e))}
                />
              </th>
              {COMPLIANCE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={complianceColumnClass(column)}
                  scope="col"
                  style={complianceColumnStyle(column)}
                >
                  <span className="sl-col-header-label">{column.header}</span>
                </th>
              ))}
              <th className="sl-sticky-col sl-actions-col" scope="col">
                Actions
              </th>
            </tr>

            <tr className="sl-column-filter-row">
              <th className="sl-sticky-col sl-select-col" scope="col" />
              {COMPLIANCE_COLUMNS.map((column) => (
                <th
                  key={`filter-${column.key}`}
                  className={complianceColumnClass(column)}
                  scope="col"
                >
                  {column.kind === 'checkbox' ? null : (
                    <DistributionFilterCell label={column.header} />
                  )}
                </th>
              ))}
              <th className="sl-sticky-col sl-actions-col" scope="col" />
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="sl-empty-row" colSpan={COMPLIANCE_COLUMNS.length + 2}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={selectedSet.has(row.id) ? 'sl-row-selected' : undefined}>
                  <td className="sl-sticky-col sl-select-col">
                    <ModusWcCheckbox
                      aria-label={`Select compliance code ${row.compCode}`}
                      size="sm"
                      value={selectedSet.has(row.id)}
                      onInputChange={(e: CustomEvent) =>
                        handleRowSelect(row.id, readInputChecked(e))
                      }
                    />
                  </td>

                  {COMPLIANCE_COLUMNS.map((column) => (
                    <td
                      key={`${row.id}-${column.key}`}
                      className={complianceColumnClass(column)}
                      style={complianceColumnStyle(column)}
                    >
                      {renderCell(row, column, handleChangeRow)}
                    </td>
                  ))}

                  <td className="sl-sticky-col sl-actions-col">
                    <ModusWcButton
                      aria-label={`Edit ${row.compCode}`}
                      color="tertiary"
                      shape="square"
                      size="sm"
                      variant="borderless"
                    >
                      <ModusWcIcon decorative name="pencil" size="xs" variant="outlined" />
                    </ModusWcButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
