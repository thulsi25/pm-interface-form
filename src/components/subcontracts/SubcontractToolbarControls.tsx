import type { ReactNode } from 'react'
import {
  ModusWcButton,
  ModusWcDivider,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'

export function ToolbarDivider() {
  return (
    <ModusWcDivider
      color="tertiary"
      customClass="sl-tb-divider"
      orientation="horizontal"
      responsive={false}
    />
  )
}

export function IconButton({
  ariaLabel,
  disabled,
  iconName,
  tone,
  onClick,
}: {
  ariaLabel: string
  disabled?: boolean
  iconName: string
  tone?: 'danger'
  onClick?: () => void
}) {
  return (
    <ModusWcButton
      aria-label={ariaLabel}
      color="tertiary"
      customClass={`sl-tb-btn sl-tb-btn-icon${tone === 'danger' ? ' sl-tb-btn-danger' : ''}`}
      disabled={disabled}
      shape="square"
      size="xs"
      variant="borderless"
      onButtonClick={() => onClick?.()}
    >
      <ModusWcIcon decorative name={iconName} size="xs" variant="outlined" />
    </ModusWcButton>
  )
}

export function CaretButton({
  ariaLabel,
  disabled,
  onClick,
}: {
  ariaLabel: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <ModusWcButton
      aria-label={ariaLabel}
      color="tertiary"
      customClass="sl-tb-btn sl-tb-btn-caret"
      disabled={disabled}
      shape="square"
      size="xs"
      variant="borderless"
      onButtonClick={() => onClick?.()}
    >
      <ModusWcIcon decorative name="caret_down" size="xs" variant="outlined" />
    </ModusWcButton>
  )
}

export function LabeledButton({
  disabled,
  iconName,
  label,
  trailingCaret,
  variant,
  onClick,
}: {
  disabled?: boolean
  iconName?: string
  label: string
  trailingCaret?: boolean
  variant?: 'pill'
  onClick?: () => void
}) {
  const isPill = variant === 'pill'

  return (
    <ModusWcButton
      color="tertiary"
      customClass={`sl-tb-btn sl-tb-btn-labeled${isPill ? ' sl-tb-btn-pill' : ''}`}
      disabled={disabled}
      shape={isPill ? 'ellipse' : 'rectangle'}
      size="xs"
      variant="borderless"
      onButtonClick={() => onClick?.()}
    >
      {iconName ? (
        <ModusWcIcon decorative name={iconName} size="xs" variant="outlined" />
      ) : null}
      <span className="sl-tb-btn-text">{label}</span>
      {trailingCaret ? (
        <ModusWcIcon decorative name="caret_down" size="xs" variant="outlined" />
      ) : null}
    </ModusWcButton>
  )
}

export function SplitButton({ children }: { children: ReactNode }) {
  return <span className="sl-tb-split">{children}</span>
}
