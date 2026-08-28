import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
} from 'react'
import { getItemEstimates } from '../../data/subcontractItemColumns'
import {
  applySubcontractItemPatch,
  createSubcontractItem,
} from '../../data/subcontractStore'
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

function ItemsGridToolbar({
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
    <div className="sl-grid-toolbar sl-distribution-toolbar" role="toolbar" aria-label="Item grid actions">
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

export function SubcontractNonInterfacedTab({
  record,
  onChange,
  addItemRef,
}: {
  record: SubcontractRecord
  onChange: (items: SubcontractItem[]) => void
  addItemRef?: MutableRefObject<(() => void) | null>
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<SubcontractItem[][]>([])

  const rows = useMemo(
    () => (record.items ?? []).filter((item) => !item.interfaced),
    [record.items],
  )

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((previous) => [...previous, record.items ?? []])
  }, [record.items])

  const updateAllItems = useCallback(
    (next: SubcontractItem[]) => {
      onChange(next)
    },
    [onChange],
  )

  const handleChangeRow = useCallback(
    (id: string, patch: Partial<SubcontractItem>) => {
      pushUndoSnapshot()
      const current = record.items ?? []
      const regularTotal = current
        .filter((item) => !item.interfaced && item.id !== id && item.itemType === '1')
        .reduce((sum, item) => sum + item.amount, 0)
      updateAllItems(
        current.map((item) =>
          item.id === id ? applySubcontractItemPatch(item, patch, regularTotal) : item,
        ),
      )
    },
    [pushUndoSnapshot, record.items, updateAllItems],
  )

  const handleUndo = useCallback(() => {
    setUndoStack((previous) => {
      if (previous.length === 0) return previous
      const snapshot = previous[previous.length - 1]
      updateAllItems(snapshot)
      return previous.slice(0, -1)
    })
  }, [updateAllItems])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    pushUndoSnapshot()
    const remove = new Set(selectedIds)
    updateAllItems((record.items ?? []).filter((row) => !remove.has(row.id)))
    setSelectedIds([])
  }, [pushUndoSnapshot, record.items, selectedIds, updateAllItems])

  const addItem = useCallback(() => {
    pushUndoSnapshot()
    const current = record.items ?? []
    const nextSeq = current.reduce((max, item) => Math.max(max, item.seq), 0) + 1
    updateAllItems([
      ...current,
      createSubcontractItem({
        id: crypto.randomUUID(),
        seq: nextSeq,
        item: String(nextSeq),
        project: record.slJob,
      }),
    ])
  }, [pushUndoSnapshot, record.items, record.slJob, updateAllItems])

  useEffect(() => {
    if (!addItemRef) return
    addItemRef.current = addItem
    return () => {
      addItemRef.current = null
    }
  }, [addItem, addItemRef])

  const selectedRow = rows.find((row) => selectedIds.includes(row.id)) ?? rows[0]
  const estimates = getItemEstimates(selectedRow)

  return (
    <div className="sl-distribution-tab">
      <ItemsGridToolbar
        canDelete={selectedIds.length > 0}
        canUndo={undoStack.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onUndo={handleUndo}
      />

      <SubcontractItemEstimatesCollapse
        collapseId="sl-item-estimates-collapse"
        fieldCount={8}
        firstRowCount={4}
        hidden={rows.length === 0}
      >
        <EstimateField label="Original Estimate" value={formatAmount(estimates.originalEstimate)} />
        <EstimateField
          label="Available Estimate"
          value={formatAmount(estimates.availableEstimate)}
        />
        <EstimateField
          label="Remaining Estimate"
          value={formatAmount(estimates.remainingEstimate)}
        />
        <EstimateField label="Non-Interfaced" value={formatAmount(estimates.nonInterfaced)} />
        <EstimateField label="Units" value={formatAmount(estimates.units)} />
        <EstimateField label="UM" value={estimates.um || '—'} />
        <EstimateField label="Unit Cost" value={formatAmount(estimates.unitCost)} />
        <EstimateField label="Costs" value={formatAmount(estimates.costs)} />
      </SubcontractItemEstimatesCollapse>

      <SubcontractItemsGrid
        emptyMessage="No non-interfaced items yet. Use Add Item to create one."
        items={rows}
        mode="non-interfaced"
        selectedIds={selectedIds}
        onChangeRow={handleChangeRow}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  )
}
