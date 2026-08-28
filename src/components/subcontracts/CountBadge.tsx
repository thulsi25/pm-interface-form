import type { ReactNode } from 'react'
import { ModusWcBadge } from '@trimble-oss/moduswebcomponents-react'

/** Outlined count pill — same treatment as Information “1 / 1”. Use whenever a tab shows a count. */
export function CountBadge({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  return (
    <ModusWcBadge
      aria-label={ariaLabel}
      color="tertiary"
      customClass={['sl-detail-nav-badge', className].filter(Boolean).join(' ')}
      size="sm"
      variant="outlined"
    >
      {/* Stable element child: a lone string/number child makes React set textContent
          on the host, which wipes the markup Modus rendered inside it. */}
      <span className="sl-count-badge-value">{children}</span>
    </ModusWcBadge>
  )
}
