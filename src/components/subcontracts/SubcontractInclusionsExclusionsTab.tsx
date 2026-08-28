import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react'
import {
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTextInput,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  INCLUSION_SCROLL_COLUMNS,
  INCLUSION_STICKY_COLUMN,
  isInclusionCellEditable,
  type InclusionColumn,
} from '../../data/subcontractInclusionColumns'
import { createInclusionExclusionRow } from '../../data/subcontractStore'
import type {
  InclusionExclusionType,
  SubcontractInclusionExclusion,
  SubcontractRecord,
} from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { DistributionFilterCell } from './DistributionFilterCell'
import { IconButton, LabeledButton, ToolbarDivider } from './SubcontractToolbarControls'

const COLUMNS: InclusionColumn[] = [INCLUSION_STICKY_COLUMN, ...INCLUSION_SCROLL_COLUMNS]

/** Entered By is stamped from the signed-in user in Vista. */
const CURRENT_USER = 'T. Priya'

function toSelectOptions(options: { label: string; value: string }[]): ISelectOption[] {
  return options.map((option) => ({ label: option.label, value: option.value }))
}

function todayStamp(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${month}-${day}-${now.getFullYear()}`
}

function inclusionColumnClass(column: InclusionColumn): string | undefined {
  return column.key === 'seq' ? 'sl-sticky-col sl-inclusion-seq-col' : undefined
}

function InclusionsGridToolbar({
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
      aria-label="Inclusion and exclusion grid actions"
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
  row: SubcontractInclusionExclusion,
  column: InclusionColumn,
  onChangeRow: (id: string, patch: Partial<SubcontractInclusionExclusion>) => void,
) {
  const editable = isInclusionCellEditable(column.key)
  const label = `${column.header} for row ${row.seq}`

  if (column.kind === 'select') {
    return (
      <ModusWcSelect
        aria-label={label}
        bordered={false}
        customClass="sl-table-inline-control"
        disabled={!editable}
        options={toSelectOptions(column.options)}
        size="sm"
        value={String(row[column.key] ?? '')}
        onInputChange={(e: CustomEvent) =>
          onChangeRow(row.id, { type: readInputString(e) as InclusionExclusionType })
        }
      />
    )
  }

  return (
    <ModusWcTextInput
      aria-label={label}
      bordered={false}
      customClass="sl-table-inline-control"
      readOnly={!editable}
      size="sm"
      value={String(row[column.key] ?? '')}
      onInputChange={(e: CustomEvent) => {
        if (!editable) return
        onChangeRow(row.id, { [column.key]: readInputString(e) })
      }}
    />
  )
}

export function SubcontractInclusionsExclusionsTab({
  record,
  onChange,
  addRowRef,
}: {
  record: SubcontractRecord
  onChange: (rows: SubcontractInclusionExclusion[]) => void
  addRowRef?: MutableRefObject<(() => void) | null>
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<SubcontractInclusionExclusion[][]>([])

  const rows = useMemo(() => record.inclusionsExclusions ?? [], [record.inclusionsExclusions])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedVisibleCount = rows.filter((row) => selectedSet.has(row.id)).length
  const allVisibleSelected = rows.length > 0 && selectedVisibleCount === rows.length

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((previous) => [...previous, rows])
  }, [rows])

  const handleChangeRow = useCallback(
    (id: string, patch: Partial<SubcontractInclusionExclusion>) => {
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

  const addRow = useCallback(() => {
    pushUndoSnapshot()
    const nextSeq = rows.reduce((max, row) => Math.max(max, row.seq), 0) + 1
    onChange([
      ...rows,
      createInclusionExclusionRow({
        id: crypto.randomUUID(),
        seq: nextSeq,
        dateEntered: todayStamp(),
        enteredBy: CURRENT_USER,
      }),
    ])
  }, [onChange, pushUndoSnapshot, rows])

  useEffect(() => {
    if (!addRowRef) return
    addRowRef.current = addRow
    return () => {
      addRowRef.current = null
    }
  }, [addRow, addRowRef])

  return (
    <div className="sl-distribution-tab">
      <InclusionsGridToolbar
        canDelete={selectedIds.length > 0}
        canUndo={undoStack.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onUndo={handleUndo}
      />

      <div className="sl-table-scroll sl-distribution-scroll">
        <table className="sl-subcontracts-table sl-distribution-table">
          <thead>
            <tr className="sl-column-header-row">
              <th className="sl-sticky-col sl-select-col" scope="col">
                <ModusWcCheckbox
                  aria-label="Select all inclusions and exclusions"
                  indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                  size="sm"
                  value={allVisibleSelected}
                  onInputChange={(e: CustomEvent) => handleSelectAll(readInputChecked(e))}
                />
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={inclusionColumnClass(column)}
                  scope="col"
                  style={{ minWidth: column.width }}
                >
                  <span className="sl-col-header-label">
                    {column.header}
                    {column.required ? <span className="pm-required-indicator"> *</span> : null}
                  </span>
                </th>
              ))}
              <th className="sl-sticky-col sl-actions-col" scope="col">
                Actions
              </th>
            </tr>

            <tr className="sl-column-filter-row">
              <th className="sl-sticky-col sl-select-col" scope="col" />
              {COLUMNS.map((column) => (
                <th
                  key={`filter-${column.key}`}
                  className={inclusionColumnClass(column)}
                  scope="col"
                >
                  <DistributionFilterCell label={column.header} />
                </th>
              ))}
              <th className="sl-sticky-col sl-actions-col" scope="col" />
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="sl-empty-row" colSpan={COLUMNS.length + 2}>
                  No inclusions or exclusions yet. Use Add Inclusion / Exclusion to create one.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={selectedSet.has(row.id) ? 'sl-row-selected' : undefined}>
                  <td className="sl-sticky-col sl-select-col">
                    <ModusWcCheckbox
                      aria-label={`Select row ${row.seq} ${row.detail}`}
                      size="sm"
                      value={selectedSet.has(row.id)}
                      onInputChange={(e: CustomEvent) =>
                        handleRowSelect(row.id, readInputChecked(e))
                      }
                    />
                  </td>

                  {COLUMNS.map((column) => (
                    <td key={`${row.id}-${column.key}`} className={inclusionColumnClass(column)}>
                      {renderCell(row, column, handleChangeRow)}
                    </td>
                  ))}

                  <td className="sl-sticky-col sl-actions-col">
                    <ModusWcButton
                      aria-label={`Edit row ${row.seq}`}
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
