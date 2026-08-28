import type { ReactNode } from 'react'
import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react'

export function FormSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="sl-form-section">
      <ModusWcTypography
        hierarchy="p"
        size="md"
        weight="semibold"
        customClass="sl-form-section-title"
        label={title}
      />
      <div className="sl-form-section-body">{children}</div>
    </section>
  )
}

export function FormFieldGrid({ children }: { children: ReactNode }) {
  return <div className="sl-form-field-grid">{children}</div>
}

export function FormField({
  label,
  required,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`sl-form-field ${className}`.trim()}>
      <label className="sl-form-field-label">
        {label}
        {required ? <span className="pm-required-indicator"> *</span> : null}
      </label>
      {children}
    </div>
  )
}
