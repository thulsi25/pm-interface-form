import { useCallback, useMemo } from 'react'
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
  formatItemColumnValue,
  getItemColumns,
  getItemFrozenColumns,
  isItemCellEditable,
  type ItemColumn,
  type ItemGridMode,
} from '../../data/subcontractItemColumns'
import type { SlItemType, SubcontractItem, TaxType } from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { DistributionFilterCell } from './DistributionFilterCell'

function toSelectOptions(options: { label: string; value: string }[]): ISelectOption[] {
  return options.map((option) => ({ label: option.label, value: option.value }))
}

function itemColumnClass(column: ItemColumn, frozenKeys: ReadonlySet<string>): string | undefined {
  const sticky = frozenKeys.has(column.key)
    ? column.key === 'seq'
      ? 'sl-sticky-col sl-item-seq-col'
      : column.key === 'project'
        ? 'sl-sticky-col sl-item-project-col'
        : column.key === 'item'
          ? 'sl-sticky-col sl-item-sl-item-col'
          : undefined
    : undefined
  const numeric = column.kind === 'text' && column.numeric ? 'sl-table-col-numeric' : undefined
  const booleanCol = column.kind === 'checkbox' ? 'sl-table-col-boolean' : undefined
  return [sticky, numeric, booleanCol].filter(Boolean).join(' ') || undefined
}

function displayValue(item: SubcontractItem, column: ItemColumn): string {
  const value = item[column.key]
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value ?? '')
}

function parseNumber(value: string): number {
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function renderReadOnlyCell(item: SubcontractItem, column: ItemColumn) {
  return (
    <ModusWcTypography customClass="sl-table-readonly-cell" hierarchy="p" size="sm">
      {formatItemColumnValue(item, column)}
    </ModusWcTypography>
  )
}

function renderCell(
  item: SubcontractItem,
  column: ItemColumn,
  editable: boolean,
  onChangeRow: (id: string, patch: Partial<SubcontractItem>) => void,
) {
  const label = `${column.header} for item ${item.seq}`

  if (column.kind === 'checkbox') {
    return (
      <ModusWcCheckbox
        aria-label={label}
        disabled={!editable}
        size="sm"
        value={item[column.key]}
        onInputChange={(e: CustomEvent) =>
          onChangeRow(item.id, { [column.key]: readInputChecked(e) })
        }
      />
    )
  }

  if (column.kind === 'select') {
    return (
      <ModusWcSelect
        aria-label={label}
        bordered={false}
        customClass="sl-table-inline-control"
        disabled={!editable}
        options={toSelectOptions(column.options)}
        size="sm"
        value={String(item[column.key] ?? '')}
        onInputChange={(e: CustomEvent) => {
          const value = readInputString(e)
          if (column.key === 'itemType') {
            onChangeRow(item.id, { itemType: value as SlItemType })
            return
          }
          if (column.key === 'taxType') {
            onChangeRow(item.id, { taxType: value as TaxType })
            return
          }
          onChangeRow(item.id, { [column.key]: value })
        }}
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
      value={displayValue(item, column)}
      onInputChange={(e: CustomEvent) => {
        if (!editable) return
        const value = readInputString(e)
        if (column.numeric || column.key === 'seq') {
          onChangeRow(item.id, { [column.key]: parseNumber(value) })
          return
        }
        onChangeRow(item.id, { [column.key]: value })
      }}
    />
  )
}

export function SubcontractItemsGrid({
  items,
  mode,
  selectedIds,
  emptyMessage,
  onSelectedIdsChange,
  onChangeRow,
}: {
  items: SubcontractItem[]
  mode: ItemGridMode
  selectedIds: string[]
  emptyMessage: string
  onSelectedIdsChange: (ids: string[]) => void
  onChangeRow: (id: string, patch: Partial<SubcontractItem>) => void
}) {
  const isReadOnlyGrid = mode === 'interfaced'
  const showSelectColumn = !isReadOnlyGrid
  const showActionsColumn = !isReadOnlyGrid
  const extraColumnCount = (showSelectColumn ? 1 : 0) + (showActionsColumn ? 1 : 0)
  const frozenColumns = getItemFrozenColumns(mode)
  const scrollColumns = getItemColumns(mode)
  const columns = [...frozenColumns, ...scrollColumns]
  const frozenKeys = useMemo(
    () => new Set(frozenColumns.map((column) => column.key)),
    [frozenColumns],
  )
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const visibleIds = useMemo(() => items.map((row) => row.id), [items])
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

  return (
    <div className="sl-table-scroll sl-distribution-scroll">
      <table
        className={`sl-subcontracts-table sl-distribution-table${isReadOnlyGrid ? ' sl-items-grid-readonly' : ''}`}
      >
        <thead>
          <tr className="sl-column-header-row">
            {showSelectColumn ? (
              <th className="sl-sticky-col sl-select-col" scope="col">
                <ModusWcCheckbox
                  aria-label="Select all items"
                  indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                  size="sm"
                  value={allVisibleSelected}
                  onInputChange={(e: CustomEvent) => handleSelectAll(readInputChecked(e))}
                />
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.key}
                className={itemColumnClass(column, frozenKeys)}
                scope="col"
                style={{ minWidth: column.width }}
              >
                <span className="sl-col-header-label">
                  {column.header}
                  {mode !== 'interfaced' && column.required ? (
                    <span className="pm-required-indicator"> *</span>
                  ) : null}
                </span>
              </th>
            ))}
            {showActionsColumn ? (
              <th className="sl-sticky-col sl-actions-col" scope="col">
                Actions
              </th>
            ) : null}
          </tr>

          <tr className="sl-column-filter-row">
            {showSelectColumn ? <th className="sl-sticky-col sl-select-col" scope="col" /> : null}
            {columns.map((column) => (
              <th key={`filter-${column.key}`} className={itemColumnClass(column, frozenKeys)} scope="col">
                {column.kind === 'checkbox' ? null : (
                  <DistributionFilterCell label={column.header} />
                )}
              </th>
            ))}
            {showActionsColumn ? <th className="sl-sticky-col sl-actions-col" scope="col" /> : null}
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="sl-empty-row" colSpan={columns.length + extraColumnCount}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((row) => (
              <tr
                key={row.id}
                className={[
                  selectedSet.has(row.id) ? 'sl-row-selected' : undefined,
                  isReadOnlyGrid ? 'sl-row-selectable' : undefined,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined}
                onClick={isReadOnlyGrid ? () => onSelectedIdsChange([row.id]) : undefined}
              >
                {showSelectColumn ? (
                  <td className="sl-sticky-col sl-select-col">
                    <ModusWcCheckbox
                      aria-label={`Select item ${row.seq} ${row.description}`}
                      size="sm"
                      value={selectedSet.has(row.id)}
                      onInputChange={(e: CustomEvent) =>
                        handleRowSelect(row.id, readInputChecked(e))
                      }
                    />
                  </td>
                ) : null}

                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`} className={itemColumnClass(column, frozenKeys)}>
                    {isReadOnlyGrid
                      ? renderReadOnlyCell(row, column)
                      : renderCell(
                          row,
                          column,
                          isItemCellEditable(row, column.key, mode),
                          onChangeRow,
                        )}
                  </td>
                ))}

                {showActionsColumn ? (
                  <td className="sl-sticky-col sl-actions-col">
                    <ModusWcButton
                      aria-label={`Edit item ${row.seq}`}
                      color="tertiary"
                      shape="square"
                      size="sm"
                      variant="borderless"
                    >
                      <ModusWcIcon decorative name="pencil" size="xs" variant="outlined" />
                    </ModusWcButton>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
