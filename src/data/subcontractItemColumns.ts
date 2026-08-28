import { SL_ITEM_TYPE_OPTIONS, TAX_TYPE_OPTIONS } from './subcontractColumns'
import type { SubcontractItem } from './subcontractTypes'

export type ItemGridMode = 'non-interfaced' | 'interfaced'

export type ItemColumnKey = Exclude<
  keyof SubcontractItem,
  'id' | 'interfaced' | 'correcting'
>

export type ItemColumn =
  | { kind: 'text'; key: ItemColumnKey; header: string; width: string; required?: boolean; numeric?: boolean }
  | { kind: 'select'; key: ItemColumnKey; header: string; width: string; required?: boolean; options: { label: string; value: string }[] }
  | { kind: 'checkbox'; key: 'send' | 'approved'; header: string; width: string; required?: boolean }

export const ITEM_FROZEN_COLUMNS: ItemColumn[] = [
  { kind: 'text', key: 'seq', header: 'Seq', width: '4.5rem', required: true },
  { kind: 'text', key: 'project', header: 'Project', width: '6rem', required: true },
]

export const ITEM_INTERFACED_FROZEN_COLUMNS: ItemColumn[] = [
  { kind: 'text', key: 'item', header: 'SL Item', width: '5rem' },
]

export const ITEM_SCROLL_COLUMNS: ItemColumn[] = [
  { kind: 'text', key: 'item', header: 'Item', width: '5rem' },
  { kind: 'text', key: 'description', header: 'Description', width: '12rem' },
  {
    kind: 'select',
    key: 'itemType',
    header: 'Item Type',
    width: '10rem',
    required: true,
    options: SL_ITEM_TYPE_OPTIONS,
  },
  { kind: 'text', key: 'addOn', header: 'Add-On', width: '6rem' },
  { kind: 'text', key: 'addOnDesc', header: 'Add-On Desc', width: '9rem' },
  { kind: 'text', key: 'phase', header: 'Phase', width: '6rem' },
  { kind: 'text', key: 'phaseDesc', header: 'Phase Desc', width: '10rem' },
  { kind: 'text', key: 'costType', header: 'CT', width: '4rem', required: true },
  { kind: 'text', key: 'addOnPercent', header: 'Add-On %', width: '6.5rem', numeric: true },
  { kind: 'text', key: 'um', header: 'UM', width: '4.5rem', required: true },
  { kind: 'text', key: 'units', header: 'Units', width: '6rem', numeric: true, required: true },
  { kind: 'text', key: 'unitCost', header: 'Unit Cost', width: '7rem', numeric: true, required: true },
  { kind: 'text', key: 'amount', header: 'Amount', width: '8rem', numeric: true, required: true },
  { kind: 'text', key: 'subCO', header: 'SubCO', width: '6rem' },
  { kind: 'checkbox', key: 'send', header: 'Send', width: '5rem', required: true },
  { kind: 'text', key: 'wcRetPercent', header: 'WC Ret %', width: '6.5rem', numeric: true, required: true },
  { kind: 'text', key: 'smRetPercent', header: 'SM Ret %', width: '6.5rem', numeric: true, required: true },
  {
    kind: 'select',
    key: 'taxType',
    header: 'Tax Type',
    width: '8rem',
    options: TAX_TYPE_OPTIONS,
  },
  { kind: 'text', key: 'taxCode', header: 'Tax Code', width: '6.5rem' },
  { kind: 'text', key: 'supplier', header: 'Supplier', width: '6.5rem' },
  { kind: 'text', key: 'supplierName', header: 'Supplier Name', width: '10rem' },
  { kind: 'text', key: 'notes', header: 'Notes', width: '10rem' },
  { kind: 'text', key: 'aco', header: 'ACO', width: '5rem' },
  { kind: 'text', key: 'acoItem', header: 'ACO Item', width: '6rem' },
  { kind: 'text', key: 'pcoType', header: 'PCO Type', width: '6.5rem' },
  { kind: 'text', key: 'pco', header: 'PCO', width: '5rem' },
  { kind: 'text', key: 'pcoDesc', header: 'PCO Desc', width: '9rem' },
  { kind: 'text', key: 'pcoItem', header: 'PCO Item', width: '6rem' },
  { kind: 'checkbox', key: 'approved', header: 'Approved', width: '6rem' },
]

export const ITEM_INTERFACE_COLUMNS: ItemColumn[] = [
  { kind: 'text', key: 'interfaceDate', header: 'Interface Date', width: '8rem' },
  { kind: 'text', key: 'interfaceMonth', header: 'Interface Month', width: '9rem' },
]

function withoutRequired(columns: ItemColumn[]): ItemColumn[] {
  return columns.map(({ required: _required, ...column }) => column as ItemColumn)
}

export function getItemFrozenColumns(mode: ItemGridMode): ItemColumn[] {
  return mode === 'interfaced' ? ITEM_INTERFACED_FROZEN_COLUMNS : ITEM_FROZEN_COLUMNS
}

export function getItemColumns(mode: ItemGridMode): ItemColumn[] {
  if (mode === 'interfaced') {
    const scroll = ITEM_SCROLL_COLUMNS.filter((column) => column.key !== 'item')
    return [...withoutRequired(scroll), ...withoutRequired(ITEM_INTERFACE_COLUMNS)]
  }
  return ITEM_SCROLL_COLUMNS
}

const ALWAYS_READONLY: ReadonlySet<ItemColumnKey> = new Set([
  'seq',
  'addOnDesc',
  'phaseDesc',
  'supplierName',
  'pcoDesc',
  'interfaceDate',
  'interfaceMonth',
])

export function isItemCellEditable(
  item: SubcontractItem,
  key: ItemColumnKey,
  mode: ItemGridMode,
): boolean {
  if (ALWAYS_READONLY.has(key)) return false
  if (key === 'project' && mode === 'interfaced') return false

  if (mode === 'interfaced' && !item.correcting) {
    return key === 'notes'
  }

  if (key === 'addOn' || key === 'addOnPercent') {
    return item.itemType === '4'
  }

  if (key === 'um') {
    return item.itemType !== '4'
  }

  if (key === 'units') {
    return item.um !== 'LS' && item.itemType !== '4'
  }

  if (key === 'amount') {
    return item.um === 'LS' && item.itemType !== '4'
  }

  return true
}

export function formatItemCellValue(item: SubcontractItem, key: ItemColumnKey): string {
  const value = item[key]
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (key === 'seq') return String(value)
    return value.toLocaleString('en-US', {
      minimumFractionDigits: key === 'units' || key === 'addOnPercent' || key === 'wcRetPercent' || key === 'smRetPercent' ? 2 : 2,
      maximumFractionDigits: 2,
    })
  }
  return String(value ?? '')
}

export function formatItemColumnValue(item: SubcontractItem, column: ItemColumn): string {
  if (column.kind === 'select') {
    const value = String(item[column.key] ?? '')
    return column.options.find((option) => option.value === value)?.label ?? value
  }
  return formatItemCellValue(item, column.key)
}

export function getItemEstimates(item: SubcontractItem | undefined) {
  if (!item) {
    return {
      originalEstimate: 0,
      units: 0,
      um: '',
      unitCost: 0,
      costs: 0,
      availableEstimate: 0,
      nonInterfaced: 0,
      remainingEstimate: 0,
    }
  }

  const originalEstimate = item.um === 'LS' ? item.amount : item.units * item.unitCost
  const availableEstimate = originalEstimate
  const nonInterfaced = item.interfaced ? 0 : item.amount
  return {
    originalEstimate,
    units: item.units,
    um: item.um,
    unitCost: item.unitCost,
    costs: 0,
    availableEstimate,
    nonInterfaced,
    remainingEstimate: availableEstimate - nonInterfaced,
  }
}
