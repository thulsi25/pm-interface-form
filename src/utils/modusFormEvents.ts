export function readInputString(e: globalThis.CustomEvent): string {
  const target = e.detail?.target as HTMLInputElement | HTMLSelectElement | undefined
  return target?.value ?? ''
}

export function readInputChecked(e: globalThis.CustomEvent): boolean {
  const target = e.detail?.target as HTMLInputElement | undefined
  return Boolean(target?.checked)
}

export function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })
}
