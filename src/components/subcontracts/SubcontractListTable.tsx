import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ModusWcBadge,
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcTextInput,
} from '@trimble-oss/moduswebcomponents-react'
import {
  SUBCONTRACT_SCROLL_COLUMNS,
  SUBCONTRACT_STICKY_ACTIONS_COLUMN,
  SUBCONTRACT_STICKY_LEFT_COLUMN,
} from '../../data/subcontractColumns'
import type { SubcontractColumnDef, SubcontractRecord } from '../../data/subcontractTypes'
import { formatSubcontractCellValue } from '../../data/subcontractStore'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import {
  slStatusBadgeClass,
  slStatusBadgeColor,
  slStatusLabel,
} from '../../utils/subcontractStatusBadge'

type RecordKey = keyof SubcontractRecord

function renderCellValue(
  record: SubcontractRecord,
  column: SubcontractColumnDef,
  onBooleanFieldChange: (id: string, key: keyof SubcontractRecord, value: boolean) => void,
) {
  if (column.key === 'slStatus') {
    return (
      <ModusWcBadge
        color={slStatusBadgeColor(record.slStatus)}
        customClass={`sl-status-badge ${slStatusBadgeClass(record.slStatus)}`}
        size="sm"
        variant="outlined"
      >
        {slStatusLabel(record.slStatus)}
      </ModusWcBadge>
    )
  }

  if (column.boolean) {
    const checked = Boolean(record[column.key as RecordKey])
    // Approved is a workflow gate set elsewhere (e.g. an approval action), so
    // it stays read-only here; every other flag is editable inline.
    const isApproved = column.key === 'approved'
    return (
      <ModusWcCheckbox
        aria-label={`${column.header} ${checked ? 'yes' : 'no'}`}
        disabled={isApproved}
        size="sm"
        value={checked}
        onInputChange={
          isApproved
            ? undefined
            : (e: CustomEvent) =>
                onBooleanFieldChange(record.id, column.key as RecordKey, readInputChecked(e))
        }
      />
    )
  }

  return formatSubcontractCellValue(record, column.key as RecordKey)
}

function ColumnFilterInput({
  column,
  value,
  onChange,
}: {
  column: SubcontractColumnDef
  value: string
  onChange: (key: string, next: string) => void
}) {
  return (
    <ModusWcTextInput
      aria-label={`Search ${column.header}`}
      bordered={false}
      customClass="sl-column-filter-input"
      includeSearch
      size="sm"
      value={value}
      onInputChange={(e: CustomEvent) => onChange(column.key, readInputString(e))}
    />
  )
}

export function SubcontractListTable({
  records,
  selectedIds,
  onSelectedIdsChange,
  onBooleanFieldChange,
}: {
  records: SubcontractRecord[]
  selectedIds: string[]
  onSelectedIdsChange: (next: string[]) => void
  onBooleanFieldChange: (id: string, key: keyof SubcontractRecord, value: boolean) => void
}) {
  const navigate = useNavigate()
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const handleColumnFilterChange = useCallback((key: string, next: string) => {
    setColumnFilters((previous) => ({ ...previous, [key]: next }))
  }, [])

  const filteredRecords = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, filterValue]) =>
      filterValue.trim(),
    )

    return records.filter((record) =>
      activeFilters.every(([key, filterValue]) =>
        formatSubcontractCellValue(record, key as RecordKey)
          .toLowerCase()
          .includes(filterValue.trim().toLowerCase()),
      ),
    )
  }, [records, columnFilters])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  // Select-all only covers what the filters left on screen, so a hidden row is
  // never quietly swept into a bulk action
  const visibleIds = useMemo(
    () => filteredRecords.map((record) => record.id),
    [filteredRecords],
  )
  const selectedVisibleCount = visibleIds.filter((id) => selectedSet.has(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length

  const handleRowSelect = useCallback(
    (id: string, checked: boolean) => {
      const next = new Set(selectedIds)
      if (checked) next.add(id)
      else next.delete(id)
      onSelectedIdsChange([...next])
    },
    [onSelectedIdsChange, selectedIds],
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const next = new Set(selectedIds)
      for (const id of visibleIds) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      onSelectedIdsChange([...next])
    },
    [onSelectedIdsChange, selectedIds, visibleIds],
  )

  const totalColumnCount = SUBCONTRACT_SCROLL_COLUMNS.length + 3

  return (
    <div className="sl-table-scroll pm-table-scroll">
      <table className="sl-subcontracts-table">
        <thead>
          <tr className="sl-column-header-row">
            <th className="sl-sticky-col sl-select-col" scope="col">
              <ModusWcCheckbox
                aria-label="Select all subcontracts"
                indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                size="sm"
                value={allVisibleSelected}
                onInputChange={(e: CustomEvent) => handleSelectAll(readInputChecked(e))}
              />
            </th>

            <th
              className="sl-sticky-col sl-subcontract-col"
              scope="col"
              style={{ minWidth: SUBCONTRACT_STICKY_LEFT_COLUMN.width }}
            >
              <span className="sl-col-header-label">
                Subcontract <span className="pm-required-indicator">*</span>
              </span>
            </th>

            {SUBCONTRACT_SCROLL_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={column.numeric ? 'sl-table-col-numeric' : undefined}
                  scope="col"
                  style={{ minWidth: column.width }}
                >
                  <span className="sl-col-header-label">
                    {column.header}
                    {column.required ? <span className="pm-required-indicator"> *</span> : null}
                  </span>
                </th>
              ))}

            <th
              className="sl-sticky-col sl-actions-col"
              scope="col"
              style={{ minWidth: SUBCONTRACT_STICKY_ACTIONS_COLUMN.width }}
            >
              {SUBCONTRACT_STICKY_ACTIONS_COLUMN.header}
            </th>
          </tr>

          <tr className="sl-column-filter-row">
            <th className="sl-sticky-col sl-select-col" scope="col" />

            <th className="sl-sticky-col sl-subcontract-col" scope="col">
              <ColumnFilterInput
                column={SUBCONTRACT_STICKY_LEFT_COLUMN}
                value={columnFilters[SUBCONTRACT_STICKY_LEFT_COLUMN.key] ?? ''}
                onChange={handleColumnFilterChange}
              />
            </th>

            {SUBCONTRACT_SCROLL_COLUMNS.map((column) => (
              <th
                key={`filter-${column.key}`}
                className={column.numeric ? 'sl-table-col-numeric' : undefined}
                scope="col"
              >
                {column.boolean ? null : (
                  <ColumnFilterInput
                    column={column}
                    value={columnFilters[column.key] ?? ''}
                    onChange={handleColumnFilterChange}
                  />
                )}
              </th>
            ))}

            <th className="sl-sticky-col sl-actions-col" scope="col" />
          </tr>
        </thead>
        <tbody>
          {filteredRecords.length === 0 ? (
            <tr>
              <td className="sl-empty-row" colSpan={totalColumnCount}>
                No subcontracts match your column filters.
              </td>
            </tr>
          ) : (
            filteredRecords.map((record) => (
              <tr key={record.id} className={selectedSet.has(record.id) ? 'sl-row-selected' : undefined}>
                <td className="sl-sticky-col sl-select-col">
                  <ModusWcCheckbox
                    aria-label={`Select subcontract ${record.subcontract}`}
                    size="sm"
                    value={selectedSet.has(record.id)}
                    onInputChange={(e: CustomEvent) =>
                      handleRowSelect(record.id, readInputChecked(e))
                    }
                  />
                </td>

                <td className="sl-sticky-col sl-subcontract-col">
                  {record.subcontract}
                </td>

                {SUBCONTRACT_SCROLL_COLUMNS.map((column) => (
                  <td
                    key={`${record.id}-${column.key}`}
                    className={
                      column.numeric
                        ? 'sl-table-col-numeric'
                        : column.boolean
                          ? 'sl-table-col-boolean'
                          : undefined
                    }
                  >
                    {renderCellValue(record, column, onBooleanFieldChange)}
                  </td>
                ))}

                <td className="sl-sticky-col sl-actions-col">
                  <ModusWcButton
                    aria-label={`Edit subcontract ${record.subcontract}`}
                    color="tertiary"
                    shape="square"
                    size="sm"
                    variant="borderless"
                    onButtonClick={() => navigate(`/pm-subcontracts/${record.id}`)}
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
  )
}
