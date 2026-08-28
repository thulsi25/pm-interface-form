import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react'

export function EstimateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="sl-item-estimate">
      <ModusWcTypography
        customClass="sl-item-estimate-label"
        hierarchy="p"
        label={label}
        size="sm"
        weight="semibold"
      />
      <ModusWcTypography
        customClass="sl-item-estimate-value"
        hierarchy="p"
        label={value}
        size="sm"
      />
    </div>
  )
}

function readCssPx(styles: CSSStyleDeclaration, property: string, fallback: number): number {
  const raw = styles.getPropertyValue(property).trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function SubcontractItemEstimatesCollapse({
  collapseId,
  fieldCount,
  firstRowCount,
  hidden,
  children,
}: {
  collapseId: string
  fieldCount: number
  firstRowCount: number
  hidden?: boolean
  children: ReactNode
}) {
  const [estimatesExpanded, setEstimatesExpanded] = useState(false)
  const [needsAccordion, setNeedsAccordion] = useState(false)
  const [layoutMeasured, setLayoutMeasured] = useState(false)
  const estimatesHostRef = useRef<HTMLDivElement>(null)
  const estimatesStripRef = useRef<HTMLDivElement>(null)
  const prevNeedsAccordionRef = useRef(false)

  const collapseExpanded = !layoutMeasured
    ? false
    : needsAccordion
      ? estimatesExpanded
      : true

  useLayoutEffect(() => {
    const host = estimatesHostRef.current
    const strip = estimatesStripRef.current
    if (!host || !strip || hidden) return

    const onToggle = (event: Event) => {
      const target = event.currentTarget
      if (!(target instanceof HTMLDetailsElement)) return
      setEstimatesExpanded(target.open)
    }

    let detailsEl: HTMLDetailsElement | null = null
    const bindToggle = () => {
      const details = host.querySelector('details.sl-item-estimates-collapse')
      if (!(details instanceof HTMLDetailsElement) || details === detailsEl) return
      if (detailsEl) detailsEl.removeEventListener('toggle', onToggle)
      detailsEl = details
      detailsEl.addEventListener('toggle', onToggle)
    }

    const measure = () => {
      bindToggle()
      const details = host.querySelector('details.sl-item-estimates-collapse')
      const title = details?.querySelector(':scope > summary')
      if (!(details instanceof HTMLElement) || !(title instanceof HTMLElement)) return

      const stripStyles = getComputedStyle(strip)
      const titleStyles = getComputedStyle(title)
      const col = readCssPx(stripStyles, '--sl-item-estimate-col-width', 168)
      const chevronGap = readCssPx(stripStyles, '--sl-item-estimates-chevron-gap', 40)
      const chevronSize = readCssPx(stripStyles, '--sl-item-estimates-chevron-size', 24)
      const gap = Number.parseFloat(stripStyles.columnGap) || 0
      const padX =
        (Number.parseFloat(titleStyles.paddingLeft) || 0) +
        (Number.parseFloat(titleStyles.paddingRight) || 0)
      const inner = details.clientWidth - padX
      if (inner <= 0) return

      const oneRowWidth = fieldCount * col + (fieldCount - 1) * gap
      const firstRowWithChevron =
        firstRowCount * col + (firstRowCount - 1) * gap + chevronGap + chevronSize

      const nextNeedsAccordion = inner < oneRowWidth && inner >= firstRowWithChevron

      setNeedsAccordion(nextNeedsAccordion)
      if (!nextNeedsAccordion) {
        setEstimatesExpanded(true)
      } else if (!prevNeedsAccordionRef.current) {
        setEstimatesExpanded(false)
      }
      prevNeedsAccordionRef.current = nextNeedsAccordion
      setLayoutMeasured(true)

      const firstField = strip.querySelector('.sl-item-estimate')
      if (firstField instanceof HTMLElement && firstField.offsetHeight > 0) {
        host.style.setProperty('--sl-item-estimates-row-height', `${firstField.offsetHeight}px`)
      }
    }

    measure()
    const frame = requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    const tabPanel = host.closest('[role="tabpanel"]')
    if (tabPanel) observer.observe(tabPanel)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      if (detailsEl) detailsEl.removeEventListener('toggle', onToggle)
    }
  }, [fieldCount, firstRowCount, hidden])

  return (
    <div
      ref={estimatesHostRef}
      className="sl-item-estimates-collapse-host"
      data-accordion={needsAccordion ? 'true' : 'false'}
      data-expanded={collapseExpanded ? 'true' : 'false'}
      hidden={hidden}
      aria-hidden={hidden}
    >
      <modus-wc-collapse
        bordered={false}
        chevron-position="right"
        collapse-id={collapseId}
        custom-class="sl-item-estimates-collapse"
        expanded={collapseExpanded}
        onExpandedChange={(event: CustomEvent<{ expanded: boolean }>) => {
          if (!needsAccordion) return
          setEstimatesExpanded(event.detail.expanded)
        }}
      >
        <div ref={estimatesStripRef} slot="header" className="sl-item-estimates-strip">
          {children}
        </div>
        <div slot="content" hidden aria-hidden="true" />
      </modus-wc-collapse>
    </div>
  )
}
