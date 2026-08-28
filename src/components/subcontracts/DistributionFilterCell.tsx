import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react'

/**
 * The reference screens show a search affordance under every column header.
 * Filtering itself is not wired yet, so these render read-only for now.
 */
export function DistributionFilterCell({ label }: { label: string }) {
  return (
    <ModusWcTextInput
      aria-label={`Search ${label}`}
      bordered={false}
      customClass="sl-column-filter-input"
      includeSearch
      readOnly
      size="sm"
      value=""
    />
  )
}
