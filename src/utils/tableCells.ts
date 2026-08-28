import type { InterfaceRecordStatus } from '../data/interfaceRecords'
import { formatAmount } from './modusFormEvents'

export function createStatusBadge(status: InterfaceRecordStatus): HTMLElement {
  const badge = document.createElement('modus-wc-badge')
  badge.setAttribute('size', 'sm')
  badge.setAttribute('variant', 'outlined')

  if (status === 'Validated') {
    badge.setAttribute('custom-class', 'pm-status-badge pm-status-validated')
    badge.setAttribute('color', 'success')
  } else if (status === 'In unposted batch') {
    badge.setAttribute('custom-class', 'pm-status-badge pm-status-unposted')
    badge.setAttribute('color', 'warning')
  } else if (status === 'Error in validation') {
    return createValidationErrorStatusCell()
  } else {
    badge.setAttribute('custom-class', 'pm-status-badge pm-status-yet-to-validate')
    badge.setAttribute('color', 'tertiary')
  }

  badge.textContent = status
  return badge
}

export function createValidationErrorStatusCell(): HTMLElement {
  const wrap = document.createElement('span')
  wrap.className = 'pm-validation-error-status'

  const text = document.createElement('span')
  text.className = 'pm-validation-error-status-text'
  text.textContent = 'Error in validation'

  const icon = document.createElement('modus-wc-icon')
  icon.setAttribute('name', 'open_in_new')
  icon.setAttribute('size', 'xs')
  icon.setAttribute('variant', 'outlined')
  icon.setAttribute('decorative', '')
  icon.setAttribute('custom-class', 'pm-validation-error-status-icon')

  wrap.append(text, icon)
  return wrap
}

export function createStatusCell(status: InterfaceRecordStatus): HTMLElement {
  if (status === 'Error in validation') {
    return createValidationErrorStatusCell()
  }
  return createStatusBadge(status)
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
