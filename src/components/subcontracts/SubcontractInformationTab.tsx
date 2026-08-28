import {
  ModusWcCheckbox,
  ModusWcRadio,
  ModusWcSelect,
  ModusWcSwitch,
  ModusWcTextInput,
  ModusWcTextarea,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  ADJUST_MAX_INVOICE_OPTIONS,
  SL_STATUS_OPTIONS,
} from '../../data/subcontractColumns'
import type { MaxRetentionMode, SubcontractRecord } from '../../data/subcontractTypes'
import { readInputChecked, readInputString } from '../../utils/modusFormEvents'
import { FormField, FormFieldGrid, FormSection } from './FormFieldGrid'
import { LookupBinocularIcon } from './LookupBinocularIcon'

type RecordUpdater = (patch: Partial<SubcontractRecord>) => void

function toSelectOptions(
  options: { label: string; value: string }[],
): ISelectOption[] {
  return options.map((option) => ({
    label: option.label,
    value: option.value,
  }))
}

export function SubcontractInformationTab({
  record,
  onChange,
}: {
  record: SubcontractRecord
  onChange: RecordUpdater
}) {
  const setRetentionMode = (mode: MaxRetentionMode) => {
    onChange({ maxRetentionMode: mode })
  }

  return (
    <div className="sl-information-tab">
      <FormSection title="General Information">
        <FormFieldGrid>
          <FormField label="Document Type">
            <ModusWcTextInput
              aria-label="Document Type"
              customClass="sl-form-control"
              size="sm"
              value={record.documentType}
              onInputChange={(e: CustomEvent) =>
                onChange({ documentType: readInputString(e) })
              }
            >
              <LookupBinocularIcon />
            </ModusWcTextInput>
          </FormField>
          <FormField label="Vendor" required>
            <ModusWcTextInput
              aria-label="Vendor"
              customClass="sl-form-control"
              required
              size="sm"
              value={record.vendor}
              onInputChange={(e: CustomEvent) =>
                onChange({ vendor: readInputString(e) })
              }
            >
              <LookupBinocularIcon />
            </ModusWcTextInput>
          </FormField>
          <FormField label="Vendor Name">
            <ModusWcTextInput
              aria-label="Vendor Name"
              customClass="sl-form-control"
              readOnly
              size="sm"
              value={record.vendorName}
            />
          </FormField>
          <FormField label="Hold Code">
            <ModusWcTextInput
              aria-label="Hold Code"
              customClass="sl-form-control"
              size="sm"
              value={record.holdCode}
              onInputChange={(e: CustomEvent) =>
                onChange({ holdCode: readInputString(e) })
              }
            >
              <LookupBinocularIcon />
            </ModusWcTextInput>
          </FormField>
          <FormField label="Pay Terms">
            <ModusWcTextInput
              aria-label="Pay Terms"
              customClass="sl-form-control"
              size="sm"
              value={record.payTerms}
              onInputChange={(e: CustomEvent) =>
                onChange({ payTerms: readInputString(e) })
              }
            >
              <LookupBinocularIcon />
            </ModusWcTextInput>
          </FormField>
          <FormField label="Comp Group">
            <ModusWcTextInput
              aria-label="Comp Group"
              customClass="sl-form-control"
              size="sm"
              value={record.compGroup}
              onInputChange={(e: CustomEvent) =>
                onChange({ compGroup: readInputString(e) })
              }
            >
              <LookupBinocularIcon />
            </ModusWcTextInput>
          </FormField>
          <FormField label="Total Orig Subct">
            <ModusWcTextInput
              aria-label="Total Orig Subct"
              customClass="sl-form-control"
              size="sm"
              value={String(record.totalOrigSubct)}
              onInputChange={(e: CustomEvent) =>
                onChange({ totalOrigSubct: Number(readInputString(e)) || 0 })
              }
            />
          </FormField>
          <FormField label="Start Date">
            <ModusWcTextInput
              aria-label="Start Date"
              customClass="sl-form-control"
              size="sm"
              value={record.startDate}
              onInputChange={(e: CustomEvent) =>
                onChange({ startDate: readInputString(e) })
              }
            />
          </FormField>
          <FormField label="Approved">
            <ModusWcSwitch
              aria-label="Approved"
              size="sm"
              value={record.approved}
              onInputChange={(e: CustomEvent) =>
                onChange({ approved: readInputChecked(e) })
              }
            />
          </FormField>
          <FormField label="Approved By">
            <ModusWcTextInput
              aria-label="Approved By"
              customClass="sl-form-control"
              size="sm"
              value={record.approvedBy}
              onInputChange={(e: CustomEvent) =>
                onChange({ approvedBy: readInputString(e) })
              }
            />
          </FormField>
          <FormField label="Claim Approval Required">
            <ModusWcSwitch
              aria-label="Claim Approval Required"
              size="sm"
              value={record.claimApprovalRequired}
              onInputChange={(e: CustomEvent) =>
                onChange({ claimApprovalRequired: readInputChecked(e) })
              }
            />
          </FormField>
          <FormField label="SL Status">
            <ModusWcSelect
              aria-label="SL Status"
              customClass="sl-form-control"
              disabled
              options={toSelectOptions(SL_STATUS_OPTIONS)}
              size="sm"
              value={record.slStatus}
            />
          </FormField>
          <FormField label="Description" className="sl-form-field-description">
            <ModusWcTextarea
              aria-label="Description"
              customClass="sl-form-control"
              size="sm"
              value={record.slDescription}
              onInputChange={(e: CustomEvent) =>
                onChange({ slDescription: readInputString(e) })
              }
            />
          </FormField>
        </FormFieldGrid>
      </FormSection>

      <FormSection title="Maximum Retention (Work Complete)">
        <div className="sl-retention-radios">
          <ModusWcRadio
            value={record.maxRetentionMode === 'none'}
            label="None"
            name="maxRetentionMode"
            size="sm"
            onInputChange={() => setRetentionMode('none')}
          />
          <ModusWcRadio
            value={record.maxRetentionMode === 'percent'}
            label="Percent of Subcontract"
            name="maxRetentionMode"
            size="sm"
            onInputChange={() => setRetentionMode('percent')}
          />
          <ModusWcRadio
            value={record.maxRetentionMode === 'maximum'}
            label="Maximum Amount"
            name="maxRetentionMode"
            size="sm"
            onInputChange={() => setRetentionMode('maximum')}
          />
        </div>

        <FormFieldGrid>
          <FormField label="% of Subcontract">
            <ModusWcTextInput
              aria-label="% of Subcontract"
              customClass="sl-form-control"
              disabled={record.maxRetentionMode !== 'percent'}
              size="sm"
              value={String(record.percentOfSubcontract)}
              onInputChange={(e: CustomEvent) =>
                onChange({ percentOfSubcontract: Number(readInputString(e)) || 0 })
              }
            />
          </FormField>
          <FormField label="Retention Amount">
            <ModusWcTextInput
              aria-label="Retention Amount"
              customClass="sl-form-control"
              disabled={record.maxRetentionMode !== 'maximum'}
              size="sm"
              value={String(record.retentionAmount)}
              onInputChange={(e: CustomEvent) =>
                onChange({ retentionAmount: Number(readInputString(e)) || 0 })
              }
            />
          </FormField>
          <FormField label="Max Amt by %">
            <ModusWcTextInput
              aria-label="Max Amt by %"
              customClass="sl-form-control"
              disabled={record.maxRetentionMode !== 'percent'}
              size="sm"
              value={String(record.maxAmtByPercent)}
              onInputChange={(e: CustomEvent) =>
                onChange({ maxAmtByPercent: Number(readInputString(e)) || 0 })
              }
            />
          </FormField>
          <FormField label="Include Chg Orders in Max Retention %">
            <ModusWcCheckbox
              aria-label="Include Chg Orders in Max Retention %"
              value={record.includeChgOrdersInMaxRetention}
              disabled={record.maxRetentionMode !== 'percent'}
              onInputChange={(e: CustomEvent) =>
                onChange({ includeChgOrdersInMaxRetention: readInputChecked(e) })
              }
            />
          </FormField>
          <FormField label="Adjust Maximum Invoice" className="sl-form-field-span-2">
            <ModusWcSelect
              aria-label="Adjust Maximum Invoice"
              customClass="sl-form-control"
              disabled={record.maxRetentionMode === 'none'}
              options={toSelectOptions(ADJUST_MAX_INVOICE_OPTIONS)}
              size="sm"
              value={record.adjustMaximumInvoice}
              onInputChange={(e: CustomEvent) =>
                onChange({ adjustMaximumInvoice: readInputString(e) })
              }
            />
          </FormField>
        </FormFieldGrid>
      </FormSection>
    </div>
  )
}
