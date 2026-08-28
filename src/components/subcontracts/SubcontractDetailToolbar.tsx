import { useEffect, useRef } from 'react'
import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react'
import {
  CaretButton,
  IconButton,
  LabeledButton,
  SplitButton,
  ToolbarDivider,
} from './SubcontractToolbarControls'

export function SubcontractDetailToolbar({
  currentIndex,
  totalCount,
  canDelete,
  disabled = false,
  onPrevious,
  onNext,
  onFieldProperties,
  onDelete,
  onDistribution,
  onEmail,
  onCreate,
}: {
  currentIndex: number
  totalCount: number
  canDelete: boolean
  disabled?: boolean
  onPrevious: () => void
  onNext: () => void
  onFieldProperties: () => void
  onDelete: () => void
  onDistribution: () => void
  onEmail: () => void
  onCreate: () => void
}) {
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < totalCount - 1
  const positionLabel = totalCount === 0 ? '0 of 0' : `${currentIndex + 1} of ${totalCount}`
  const rootRef = useRef<HTMLDivElement>(null)

  // inert rather than aria-hidden: the toolbar holds focusable controls, and
  // aria-hidden over a focused descendant is an accessibility violation.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (disabled) {
      root.setAttribute('inert', '')
    } else {
      root.removeAttribute('inert')
    }
  }, [disabled])

  return (
    <div
      ref={rootRef}
      className={`sl-grid-toolbar sl-detail-toolbar${disabled ? ' sl-toolbar-inert' : ''}`}
      role="toolbar"
      aria-label="Subcontract record actions"
    >
      <div className="sl-grid-toolbar-group sl-detail-toolbar-left">
        <div className="sl-detail-toolbar-pager">
          <IconButton
            ariaLabel="Previous subcontract"
            disabled={!hasPrevious}
            iconName="chevron_left"
            onClick={onPrevious}
          />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="semibold"
            customClass="sl-detail-toolbar-page"
            label={positionLabel}
          />
          <IconButton
            ariaLabel="Next subcontract"
            disabled={!hasNext}
            iconName="chevron_right"
            onClick={onNext}
          />
        </div>
        <LabeledButton
          iconName="tune"
          label="Field Properties"
          variant="pill"
          onClick={onFieldProperties}
        />
      </div>

      <div className="sl-grid-toolbar-group">
        <IconButton
          ariaLabel="Delete subcontract"
          disabled={!canDelete}
          iconName="delete"
          tone="danger"
          onClick={onDelete}
        />
        <ToolbarDivider />
        <SplitButton>
          <IconButton ariaLabel="Distribution" iconName="people_group" onClick={onDistribution} />
          <CaretButton ariaLabel="Distribution options" onClick={onDistribution} />
        </SplitButton>
        <SplitButton>
          <IconButton ariaLabel="Send email" iconName="envelope" onClick={onEmail} />
          <CaretButton ariaLabel="Send email options" onClick={onEmail} />
        </SplitButton>
        <ToolbarDivider />
        <LabeledButton
          iconName="paperclip"
          label="Related Items"
          onClick={() => {
            /* Related items */
          }}
        />
        <SplitButton>
          <LabeledButton iconName="file_new" label="Create" onClick={onCreate} />
          <CaretButton ariaLabel="Create options" onClick={onCreate} />
        </SplitButton>
      </div>
    </div>
  )
}
