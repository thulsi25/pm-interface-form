import { useCallback, useMemo, useState } from 'react'
import {
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcSwitch,
  ModusWcTextInput,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  PREFERRED_METHOD_OPTIONS,
  SEND_TYPE_OPTIONS,
} from '../../data/subcontractColumns'
import type { DistributionContact, SubcontractRecord } from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { DistributionAddPanel } from './DistributionAddPanel'
import { DistributionFilterCell } from './DistributionFilterCell'
import {
  IconButton,
  LabeledButton,
  ToolbarDivider,
} from './SubcontractToolbarControls'

export type DistributionView = 'grid' | 'add'

type TextColumnKey = Extract<
  keyof DistributionContact,
  'sendToFirm' | 'sendToFirmName' | 'sendToContact' | 'contactName' | 'dateSent' | 'dateSigned'
>

type SelectColumnKey = Extract<keyof DistributionContact, 'preferredMethod' | 'sendType'>

type DistributionColumn =
  | { kind: 'text'; key: TextColumnKey; header: string; width: string }
  | { kind: 'switch'; key: 'send'; header: string; width: string }
  | {
      kind: 'select'
      key: SelectColumnKey
      header: string
      width: string
      options: { label: string; value: string }[]
    }

const DISTRIBUTION_COLUMNS: DistributionColumn[] = [
  { kind: 'text', key: 'sendToFirm', header: 'Sent to Firm', width: '116px' },
  { kind: 'text', key: 'sendToFirmName', header: 'Firm Name', width: '200px' },
  { kind: 'text', key: 'sendToContact', header: 'Sent to Contact', width: '8rem' },
  { kind: 'text', key: 'contactName', header: 'Contact Name', width: '10rem' },
  {
    kind: 'select',
    key: 'preferredMethod',
    header: 'Preferred Method',
    width: '9rem',
    options: PREFERRED_METHOD_OPTIONS,
  },
  { kind: 'switch', key: 'send', header: 'Send', width: '5rem' },
  {
    kind: 'select',
    key: 'sendType',
    header: 'Send Type',
    width: '7rem',
    options: SEND_TYPE_OPTIONS,
  },
  { kind: 'text', key: 'dateSent', header: 'Date Sent', width: '10rem' },
  { kind: 'text', key: 'dateSigned', header: 'Date Signed', width: '10rem' },
]

function toSelectOptions(options: { label: string; value: string }[]): ISelectOption[] {
  return options.map((option) => ({ label: option.label, value: option.value }))
}

function distributionColumnClass(key: DistributionColumn['key']): string | undefined {
  if (key === 'sendToFirm') return 'sl-sticky-col sl-dist-firm-col'
  if (key === 'sendToFirmName') return 'sl-sticky-col sl-dist-firm-name-col'
  return undefined
}

/**
 * Field Properties, column picker, and filter are placeholders; row selection,
 * delete, and undo for inline grid edits are wired.
 */
function DistributionGridToolbar({
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
    <div className="sl-grid-toolbar sl-distribution-toolbar" role="toolbar" aria-label="Distribution grid actions">
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
        <IconButton
          ariaLabel="Undo"
          disabled={!canUndo}
          iconName="undo"
          onClick={onUndo}
        />
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

export function SubcontractDistributionTab({
  record,
  view,
  onChange,
  onCommitted,
}: {
  record: SubcontractRecord
  view: DistributionView
  onChange: (distribution: DistributionContact[]) => void
  onCommitted: () => void
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<DistributionContact[][]>([])

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((previous) => [...previous, record.distribution])
  }, [record.distribution])

  const updateRow = useCallback(
    (id: string, patch: Partial<DistributionContact>) => {
      pushUndoSnapshot()
      onChange(record.distribution.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    },
    [onChange, pushUndoSnapshot, record.distribution],
  )

  const handleUndo = useCallback(() => {
    setUndoStack((previous) => {
      if (previous.length === 0) return previous
      const nextStack = previous.slice(0, -1)
      const snapshot = previous[previous.length - 1]
      onChange(snapshot)
      return nextStack
    })
  }, [onChange])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const visibleIds = useMemo(() => record.distribution.map((row) => row.id), [record.distribution])
  const selectedVisibleCount = visibleIds.filter((id) => selectedSet.has(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length

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
      setSelectedIds((previous) => {
        const next = new Set(previous)
        for (const id of visibleIds) {
          if (checked) next.add(id)
          else next.delete(id)
        }
        return [...next]
      })
    },
    [visibleIds],
  )

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    pushUndoSnapshot()
    const remove = new Set(selectedIds)
    onChange(record.distribution.filter((row) => !remove.has(row.id)))
    setSelectedIds([])
  }, [onChange, pushUndoSnapshot, record.distribution, selectedIds])

  if (view === 'add') {
    return (
      <DistributionAddPanel
        onCommit={(rows) => {
          onChange([...record.distribution, ...rows])
          onCommitted()
        }}
      />
    )
  }

  return (
    <div className="sl-distribution-tab">
      <DistributionGridToolbar
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
                  aria-label="Select all distributions"
                  indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                  size="sm"
                  value={allVisibleSelected}
                  onInputChange={(e: CustomEvent) => handleSelectAll(readInputChecked(e))}
                />
              </th>
              {DISTRIBUTION_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={distributionColumnClass(column.key)}
                  scope="col"
                  style={{ minWidth: column.width }}
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
              {DISTRIBUTION_COLUMNS.map((column) => (
                <th
                  key={`filter-${column.key}`}
                  className={distributionColumnClass(column.key)}
                  scope="col"
                >
                  {column.kind === 'switch' ? null : (
                    <DistributionFilterCell label={column.header} />
                  )}
                </th>
              ))}
              <th className="sl-sticky-col sl-actions-col" scope="col" />
            </tr>
          </thead>

          <tbody>
            {record.distribution.length === 0 ? (
              <tr>
                <td className="sl-empty-row" colSpan={DISTRIBUTION_COLUMNS.length + 2}>
                  No distributions yet. Use Add New Distribution to create one.
                </td>
              </tr>
            ) : (
              record.distribution.map((row) => (
                <tr
                  key={row.id}
                  className={selectedSet.has(row.id) ? 'sl-row-selected' : undefined}
                >
                  <td className="sl-sticky-col sl-select-col">
                    <ModusWcCheckbox
                      aria-label={`Select distribution ${row.sendToFirmName || row.sendToFirm}`}
                      size="sm"
                      value={selectedSet.has(row.id)}
                      onInputChange={(e: CustomEvent) =>
                        handleRowSelect(row.id, readInputChecked(e))
                      }
                    />
                  </td>

                  {DISTRIBUTION_COLUMNS.map((column) => (
                    <td key={`${row.id}-${column.key}`} className={distributionColumnClass(column.key)}>
                      {column.kind === 'switch' ? (
                        <ModusWcSwitch
                          aria-label={`Send to ${row.sendToFirmName || row.sendToFirm}`}
                          size="sm"
                          value={row.send}
                          onInputChange={(e: CustomEvent) =>
                            updateRow(row.id, { send: readInputChecked(e) })
                          }
                        />
                      ) : column.kind === 'select' ? (
                        <ModusWcSelect
                          aria-label={`${column.header} for ${row.sendToFirmName || row.sendToFirm}`}
                          bordered={false}
                          customClass="sl-table-inline-control"
                          options={toSelectOptions(column.options)}
                          size="sm"
                          value={row[column.key]}
                          onInputChange={(e: CustomEvent) =>
                            updateRow(row.id, { [column.key]: readInputString(e) })
                          }
                        />
                      ) : (
                        <ModusWcTextInput
                          aria-label={`${column.header} for ${row.sendToFirmName || row.sendToFirm}`}
                          bordered={false}
                          customClass="sl-table-inline-control"
                          size="sm"
                          value={row[column.key]}
                          onInputChange={(e: CustomEvent) =>
                            updateRow(row.id, { [column.key]: readInputString(e) })
                          }
                        />
                      )}
                    </td>
                  ))}

                  <td className="sl-sticky-col sl-actions-col">
                    <ModusWcButton
                      aria-label="Edit distribution"
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
