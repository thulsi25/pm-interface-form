import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import {
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTextInput,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  CERTIFICATE_COLUMNS,
  CERTIFICATE_TYPE_OPTIONS,
  certificateTypeLabel,
  type CertificateColumn,
} from '../../data/subcontractCertificateColumns'
import { createCertificateRow } from '../../data/subcontractStore'
import type { CertificateType, SubcontractCertificate, SubcontractRecord } from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { DistributionFilterCell } from './DistributionFilterCell'
import { IconButton, LabeledButton, ToolbarDivider } from './SubcontractToolbarControls'

function toSelectOptions(options: { label: string; value: string }[]): ISelectOption[] {
  return options.map((option) => ({ label: option.label, value: option.value }))
}

function certificateColumnClass(column: CertificateColumn): string | undefined {
  const sticky = column.key === 'certificateType' ? 'sl-sticky-col sl-cert-type-col' : undefined
  const booleanCol = column.kind === 'checkbox' ? 'sl-table-col-boolean' : undefined
  return [sticky, booleanCol].filter(Boolean).join(' ') || undefined
}

function certificateColumnStyle(
  column: CertificateColumn,
): { minWidth: string; width: string; maxWidth: string } | undefined {
  if (column.key === 'certificateType') return undefined
  return { minWidth: column.width, width: column.width, maxWidth: column.width }
}

function CertificatesGridToolbar({
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
      aria-label="Certificate grid actions"
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
  row: SubcontractCertificate,
  column: CertificateColumn,
  onChangeRow: (id: string, patch: Partial<SubcontractCertificate>) => void,
) {
  const rowLabel = certificateTypeLabel(row.certificateType)

  if (column.kind === 'checkbox') {
    return (
      <ModusWcCheckbox
        aria-label={`${column.header} for ${rowLabel}`}
        size="sm"
        value={row.certified}
        onInputChange={(e: CustomEvent) =>
          onChangeRow(row.id, { certified: readInputChecked(e) })
        }
      />
    )
  }

  if (column.kind === 'select') {
    return (
      <ModusWcSelect
        aria-label={`${column.header} for ${rowLabel}`}
        bordered={false}
        customClass="sl-table-inline-control"
        options={toSelectOptions(CERTIFICATE_TYPE_OPTIONS)}
        size="sm"
        value={row.certificateType}
        onInputChange={(e: CustomEvent) =>
          onChangeRow(row.id, { certificateType: readInputString(e) as CertificateType })
        }
      />
    )
  }

  const display = String(row[column.key] ?? '')

  return (
    <ModusWcTextInput
      aria-label={`${column.header} for ${rowLabel}`}
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

export function SubcontractCertificatesTab({
  record,
  onChange,
  addRowRef,
  visible = true,
}: {
  record: SubcontractRecord
  onChange: (rows: SubcontractCertificate[]) => void
  addRowRef?: MutableRefObject<(() => void) | null>
  visible?: boolean
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<SubcontractCertificate[][]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => record.certificates ?? [], [record.certificates])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedVisibleCount = rows.filter((row) => selectedSet.has(row.id)).length
  const allVisibleSelected = rows.length > 0 && selectedVisibleCount === rows.length

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((previous) => [...previous, rows])
  }, [rows])

  const handleChangeRow = useCallback(
    (id: string, patch: Partial<SubcontractCertificate>) => {
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
    onChange([
      ...rows,
      createCertificateRow({
        id: crypto.randomUUID(),
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

  useLayoutEffect(() => {
    if (!visible) return
    scrollRef.current?.scrollTo({ left: 0 })
  }, [visible])

  return (
    <div className="sl-distribution-tab">
      <CertificatesGridToolbar
        canDelete={selectedIds.length > 0}
        canUndo={undoStack.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onUndo={handleUndo}
      />

      <div ref={scrollRef} className="sl-table-scroll sl-distribution-scroll">
        <table className="sl-subcontracts-table sl-distribution-table sl-certificates-table">
          <thead>
            <tr className="sl-column-header-row">
              <th className="sl-sticky-col sl-select-col" scope="col">
                <ModusWcCheckbox
                  aria-label="Select all certificates"
                  indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                  size="sm"
                  value={allVisibleSelected}
                  onInputChange={(e: CustomEvent) => handleSelectAll(readInputChecked(e))}
                />
              </th>
              {CERTIFICATE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={certificateColumnClass(column)}
                  scope="col"
                  style={certificateColumnStyle(column)}
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
              {CERTIFICATE_COLUMNS.map((column) => (
                <th
                  key={`filter-${column.key}`}
                  className={certificateColumnClass(column)}
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
                <td className="sl-empty-row" colSpan={CERTIFICATE_COLUMNS.length + 2}>
                  No certificates yet. Use Add Certificate to create one.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowLabel = certificateTypeLabel(row.certificateType)
                return (
                  <tr key={row.id} className={selectedSet.has(row.id) ? 'sl-row-selected' : undefined}>
                    <td className="sl-sticky-col sl-select-col">
                      <ModusWcCheckbox
                        aria-label={`Select ${rowLabel}`}
                        size="sm"
                        value={selectedSet.has(row.id)}
                        onInputChange={(e: CustomEvent) =>
                          handleRowSelect(row.id, readInputChecked(e))
                        }
                      />
                    </td>

                    {CERTIFICATE_COLUMNS.map((column) => (
                      <td
                        key={`${row.id}-${column.key}`}
                        className={certificateColumnClass(column)}
                        style={certificateColumnStyle(column)}
                      >
                        {renderCell(row, column, handleChangeRow)}
                      </td>
                    ))}

                    <td className="sl-sticky-col sl-actions-col">
                      <ModusWcButton
                        aria-label={`Edit ${rowLabel}`}
                        color="tertiary"
                        shape="square"
                        size="sm"
                        variant="borderless"
                      >
                        <ModusWcIcon decorative name="pencil" size="xs" variant="outlined" />
                      </ModusWcButton>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
