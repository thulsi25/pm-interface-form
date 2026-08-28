import { useCallback, useState } from 'react'
import {
  ModusWcButton,
  ModusWcDate,
  ModusWcRadio,
  ModusWcSwitch,
} from '@trimble-oss/moduswebcomponents-react'
import {
  DISTRIBUTION_FIRM_COLUMNS,
  DISTRIBUTION_FIRMS,
  type DistributionFirm,
} from '../../data/distributionFirms'
import {
  PREFERRED_METHOD_OPTIONS,
  SEND_TYPE_OPTIONS,
} from '../../data/subcontractColumns'
import type { DistributionContact } from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { DistributionFilterCell } from './DistributionFilterCell'

interface DistributionDraft {
  send: boolean
  preferredMethod: string
  sendType: string
  dateSent: string
  dateSigned: string
}

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Selecting a firm pre-arms the panel the way the reference screens show it. */
function createDefaultDraft(): DistributionDraft {
  return {
    send: true,
    preferredMethod: 'Email',
    sendType: 'To',
    dateSent: todayIso(),
    dateSigned: '',
  }
}

function buildContact(firm: DistributionFirm, draft: DistributionDraft): DistributionContact {
  return {
    id: crypto.randomUUID(),
    responsiblePerson: '',
    respPersonName: '',
    sendToFirm: firm.firmCode,
    sendToFirmName: firm.firmName,
    sendToContact: firm.contact,
    contactName: firm.contactName,
    send: draft.send,
    preferredMethod: draft.preferredMethod,
    sendType: draft.sendType,
    dateSent: draft.dateSent,
    dateSigned: draft.dateSigned,
    notes: '',
  }
}

export function DistributionAddPanel({
  onCommit,
}: {
  onCommit: (rows: DistributionContact[]) => void
}) {
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DistributionDraft | null>(null)
  const [staged, setStaged] = useState<DistributionContact[]>([])

  const selectedFirm = DISTRIBUTION_FIRMS.find((firm) => firm.id === selectedFirmId) ?? null
  const panelDisabled = !selectedFirm || !draft

  const selectFirm = useCallback((firmId: string) => {
    setSelectedFirmId(firmId)
    setDraft(createDefaultDraft())
  }, [])

  const patchDraft = useCallback((patch: Partial<DistributionDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const handleAddAnother = useCallback(() => {
    if (!selectedFirm || !draft) return
    setStaged((prev) => [...prev, buildContact(selectedFirm, draft)])
    setSelectedFirmId(null)
    setDraft(null)
  }, [draft, selectedFirm])

  const handleAdd = useCallback(() => {
    const rows = [...staged]
    if (selectedFirm && draft) {
      rows.push(buildContact(selectedFirm, draft))
    }
    if (rows.length === 0) return
    onCommit(rows)
  }, [draft, onCommit, selectedFirm, staged])

  const savedLabel =
    staged.length > 0
      ? `${staged.length} distribution${staged.length === 1 ? '' : 's'} saved.`
      : ''

  return (
    <div className="sl-distribution-add">
      <div className="sl-table-scroll sl-distribution-firm-scroll">
        <table className="sl-subcontracts-table sl-distribution-firm-table" role="grid">
          <thead>
            <tr className="sl-column-header-row">
              {DISTRIBUTION_FIRM_COLUMNS.map((column) => (
                <th key={column.key} scope="col" style={{ minWidth: column.width }}>
                  <span className="sl-col-header-label">{column.header}</span>
                </th>
              ))}
            </tr>
            <tr className="sl-column-filter-row">
              {DISTRIBUTION_FIRM_COLUMNS.map((column) => (
                <th key={`filter-${column.key}`} scope="col">
                  <DistributionFilterCell label={column.header} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISTRIBUTION_FIRMS.map((firm) => {
              const isSelected = firm.id === selectedFirmId
              return (
                <tr
                  key={firm.id}
                  aria-selected={isSelected}
                  className={`sl-distribution-firm-row${isSelected ? ' sl-row-selected' : ''}`}
                  tabIndex={0}
                  onClick={() => selectFirm(firm.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectFirm(firm.id)
                    }
                  }}
                >
                  {DISTRIBUTION_FIRM_COLUMNS.map((column) => (
                    <td key={`${firm.id}-${column.key}`}>{firm[column.key]}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <section
        aria-label="Distribution settings"
        className={`sl-distribution-settings${panelDisabled ? ' sl-distribution-settings-disabled' : ''}`}
      >
        <div className="sl-distribution-settings-field">
          <span className="sl-distribution-settings-label">Send</span>
          <ModusWcSwitch
            aria-label="Send"
            disabled={panelDisabled}
            size="sm"
            value={draft?.send ?? false}
            onInputChange={(e: CustomEvent) => patchDraft({ send: readInputChecked(e) })}
          />
        </div>

        <div className="sl-distribution-settings-row">
          <fieldset className="sl-distribution-radio-group">
            <legend className="sl-distribution-settings-label">Preferred method</legend>
            <div className="sl-distribution-radios">
              {PREFERRED_METHOD_OPTIONS.map((option) => (
                <ModusWcRadio
                  key={option.value}
                  disabled={panelDisabled}
                  label={option.label}
                  name="distributionPreferredMethod"
                  size="sm"
                  value={draft?.preferredMethod === option.value}
                  onInputChange={() => patchDraft({ preferredMethod: option.value })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="sl-distribution-radio-group">
            <legend className="sl-distribution-settings-label">Send type</legend>
            <div className="sl-distribution-radios">
              {SEND_TYPE_OPTIONS.map((option) => (
                <ModusWcRadio
                  key={option.value}
                  disabled={panelDisabled}
                  label={option.label}
                  name="distributionSendType"
                  size="sm"
                  value={draft?.sendType === option.value}
                  onInputChange={() => patchDraft({ sendType: option.value })}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="sl-distribution-settings-row">
          <div className="sl-distribution-settings-field">
            <span className="sl-distribution-settings-label">Date Sent</span>
            <ModusWcDate
              aria-label="Date Sent"
              customClass="sl-distribution-date"
              disabled={panelDisabled}
              format="mm-dd-yyyy"
              readOnly
              size="sm"
              value={draft?.dateSent ?? ''}
            />
          </div>
          <div className="sl-distribution-settings-field">
            <span className="sl-distribution-settings-label">Date Signed</span>
            <ModusWcDate
              aria-label="Date Signed"
              customClass="sl-distribution-date"
              disabled={panelDisabled}
              format="mm-dd-yyyy"
              size="sm"
              value={draft?.dateSigned ?? ''}
              onInputChange={(e: CustomEvent) => patchDraft({ dateSigned: readInputString(e) })}
            />
          </div>
        </div>
      </section>

      <div className="sl-distribution-add-footer">
        <span aria-live="polite" className="sl-distribution-saved-count">
          {savedLabel}
        </span>
        <ModusWcButton
          color="tertiary"
          disabled={panelDisabled}
          size="sm"
          variant="outlined"
          onButtonClick={handleAddAnother}
        >
          Add Another
        </ModusWcButton>
        <ModusWcButton
          color="primary"
          disabled={panelDisabled && staged.length === 0}
          size="sm"
          variant="filled"
          onButtonClick={handleAdd}
        >
          Add
        </ModusWcButton>
      </div>
    </div>
  )
}
