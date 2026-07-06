import type { InterfaceRecordStatus } from '../data/interfaceRecords'
import { formatAmount } from './modusFormEvents'

export function createStatusBadge(status: InterfaceRecordStatus): HTMLElement {
  const badge = document.createElement('modus-wc-badge')
  badge.setAttribute('size', 'sm')
  badge.setAttribute('variant', 'outlined')

  if (status === 'In unposted batch') {
    badge.setAttribute('color', 'warning')
  } else {
    badge.setAttribute('color', 'primary')
  }

  badge.textContent = status
  return badge
}

export function createAmountCell(value: number): HTMLElement {
  const span = document.createElement('span')
  span.className = 'tabular-nums'
  span.textContent = formatAmount(value)
  return span
}

export function createTextCell(value: string): HTMLElement {
  const span = document.createElement('span')
  span.textContent = value
  return span
}

export function createNumericTextCell(value: string | number): HTMLElement {
  const span = document.createElement('span')
  span.className = 'tabular-nums'
  span.textContent = String(value ?? '')
  return span
}
