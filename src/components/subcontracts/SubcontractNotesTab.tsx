import { ModusWcTextarea, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react'
import type { SubcontractRecord } from '../../data/subcontractTypes'
import { readInputString } from '../../utils/modusFormEvents'

const NOTES_MAX_LENGTH = 150

export function SubcontractNotesTab({
  record,
  onChange,
}: {
  record: SubcontractRecord
  onChange: (patch: Partial<SubcontractRecord>) => void
}) {
  const value = record.notes ?? ''

  return (
    <div className="sl-notes-tab">
      <div className="sl-notes-field">
        <div className="sl-notes-field-header">
          <label className="sl-notes-field-label" htmlFor="sl-notes-input">
            Add Note
          </label>
          <ModusWcTypography
            customClass="sl-notes-field-counter"
            hierarchy="p"
            size="sm"
          >
            {value.length}/{NOTES_MAX_LENGTH}
          </ModusWcTypography>
        </div>
        <ModusWcTextarea
          aria-label="Add Note"
          bordered
          customClass="sl-form-control"
          inputId="sl-notes-input"
          maxLength={NOTES_MAX_LENGTH}
          rows={4}
          size="sm"
          value={value}
          onInputChange={(e: CustomEvent) => {
            onChange({ notes: readInputString(e).slice(0, NOTES_MAX_LENGTH) })
          }}
        />
      </div>
    </div>
  )
}
