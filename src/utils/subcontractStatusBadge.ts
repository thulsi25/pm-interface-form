export function slStatusBadgeColor(status: string): 'warning' | 'tertiary' {
  if (status.startsWith('3')) return 'warning'
  return 'tertiary'
}

export function slStatusBadgeClass(status: string): string {
  return status.startsWith('3') ? 'sl-status-badge-pending' : 'sl-status-badge-neutral'
}

export function slStatusLabel(status: string): string {
  const [, label] = status.split(' - ')
  return label ?? status
}
