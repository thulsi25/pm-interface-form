export function parseGridNumber(value: string): number {
  const parsed = Number(value.replace(/,/g, '').trim())
  if (!Number.isFinite(parsed)) return 0
  return Math.round(parsed * 100) / 100
}

export function formatGridNumber(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
