export function readInputString(e: globalThis.CustomEvent): string {
  const target = e.detail?.target as HTMLInputElement | HTMLSelectElement | undefined
  return target?.value ?? ''
}

export function readInputChecked(e: globalThis.CustomEvent): boolean {
  const target = e.detail?.target as HTMLInputElement | undefined
  return Boolean(target?.checked)
}

export function formatAmount(value: number): string {
  const decimalPart = String(value).split('.')[1] ?? ''
  const minimumFractionDigits =
    decimalPart.length >= 3
      ? 3
      : decimalPart.length === 0
        ? 2
        : value < 100
          ? 3
          : 2

  return value.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: 3,
  })
}
