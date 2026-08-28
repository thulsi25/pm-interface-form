import { useCallback, useMemo, useState } from 'react'
import { getItemEstimates } from '../../data/subcontractItemColumns'
import { applySubcontractItemPatch } from '../../data/subcontractStore'
import type { SubcontractItem, SubcontractRecord } from '../../data/subcontractTypes'
import { formatAmount } from '../../utils/modusFormEvents'
import {
  IconButton,
  LabeledButton,
  ToolbarDivider,
} from './SubcontractToolbarControls'
import {
  EstimateField,
  SubcontractItemEstimatesCollapse,
} from './SubcontractItemEstimatesCollapse'
import { SubcontractItemsGrid } from './SubcontractItemsGrid'

function InterfacedGridToolbar() {
  return (
    <div className="sl-grid-toolbar sl-distribution-toolbar" role="toolbar" aria-label="Interfaced item grid actions">
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

export function SubcontractInterfacedTab({
  record,
  onChange,
}: {
  record: SubcontractRecord
  onChange: (items: SubcontractItem[]) => void
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const rows = useMemo(
    () => (record.items ?? []).filter((item) => item.interfaced),
    [record.items],
  )

  const handleChangeRow = useCallback(
    (id: string, patch: Partial<SubcontractItem>) => {
      const current = record.items ?? []
      const regularTotal = current
        .filter((item) => item.interfaced && item.id !== id && item.itemType === '1')
        .reduce((sum, item) => sum + item.amount, 0)
      onChange(
        current.map((item) =>
          item.id === id ? applySubcontractItemPatch(item, patch, regularTotal) : item,
        ),
      )
    },
    [onChange, record.items],
  )

  const selectedRow = rows.find((row) => selectedIds.includes(row.id)) ?? rows[0]
  const estimates = getItemEstimates(selectedRow)

  return (
    <div className="sl-distribution-tab">
      <InterfacedGridToolbar />

      <SubcontractItemEstimatesCollapse
        collapseId="sl-interfaced-item-estimates-collapse"
        fieldCount={4}
        firstRowCount={2}
        hidden={rows.length === 0}
      >
        <EstimateField label="Original Estimate" value={formatAmount(estimates.originalEstimate)} />
        <EstimateField label="Units" value={formatAmount(estimates.units)} />
        <EstimateField label="Unit Cost" value={formatAmount(estimates.unitCost)} />
        <EstimateField label="Costs" value={formatAmount(estimates.costs)} />
      </SubcontractItemEstimatesCollapse>

      <SubcontractItemsGrid
        emptyMessage="No interfaced items yet. Items move here after they are sent through PM Interface."
        items={rows}
        mode="interfaced"
        selectedIds={selectedIds}
        onChangeRow={handleChangeRow}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  )
}
