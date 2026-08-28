import { useState } from 'react'
import {
  ModusWcBadge,
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcModal,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { PROJECT_DESCRIPTION, PROJECT_NUMBER } from '../../data/subcontractTypes'
import type { SubcontractRecord } from '../../data/subcontractTypes'
import {
  slStatusBadgeClass,
  slStatusBadgeColor,
  slStatusLabel,
} from '../../utils/subcontractStatusBadge'
import {
  isSubmitForApprovalVisible,
  isWorkflowButtonVisible,
  submitForApprovalLabel,
  workflowReviewersForStatus,
  workflowReviewersModalTitle,
  workflowStatusBadgeColor,
  workflowViewLabel,
} from '../../utils/subcontractWorkflow'

const WORKFLOW_REVIEWERS_MODAL_ID = 'sl-workflow-reviewers-modal'

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function SubcontractDetailSummary({
  record,
  isDirty,
  onBack,
  onSubmitForApproval,
}: {
  record: SubcontractRecord
  isDirty: boolean
  onBack: () => void
  onSubmitForApproval: () => void
}) {
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const showWorkflowButton = isWorkflowButtonVisible(record.workflowStatus)
  const showSubmitButton = isSubmitForApprovalVisible(record.workflowStatus)
  const submitLabel = submitForApprovalLabel(record.workflowStatus)

  const closeWorkflowReviewers = () => {
    const dialog = document.getElementById(WORKFLOW_REVIEWERS_MODAL_ID) as HTMLDialogElement | null
    dialog?.close()
  }

  const submitFromModal = () => {
    closeWorkflowReviewers()
    onSubmitForApproval()
  }

  return (
    <div className="sl-detail-summary">
      <div className="sl-detail-summary-top">
        <ModusWcButton
          aria-label="Back to subcontracts list"
          color="tertiary"
          shape="square"
          size="sm"
          variant="borderless"
          onButtonClick={onBack}
        >
          <ModusWcIcon decorative name="arrow_back" size="sm" variant="outlined" />
        </ModusWcButton>
        <ModusWcTypography
          hierarchy="h1"
          size="2xl"
          weight="bold"
          customClass="sl-detail-title"
          label="PM Subcontract Data"
        />
      </div>

      <ModusWcCard bordered={false} customClass="sl-detail-summary-card" padding="compact">
        <div
          className="sl-detail-summary-collapse-host"
          data-expanded={summaryExpanded ? 'true' : 'false'}
        >
          <modus-wc-collapse
            bordered={false}
            chevron-position="right"
            custom-class="sl-detail-summary-collapse"
            expanded={summaryExpanded}
            onExpandedChange={(event: CustomEvent<{ expanded: boolean }>) => {
              setSummaryExpanded(event.detail.expanded)
            }}
          >
            <div slot="header" className="sl-detail-summary-strip">
              <div className="sl-detail-summary-fields">
                <div className="sl-detail-summary-item sl-detail-summary-item-project">
                  <span className="sl-detail-summary-label">Project</span>
                  <span className="sl-detail-summary-value">{PROJECT_NUMBER}</span>
                </div>
                <div className="sl-detail-summary-item sl-detail-summary-item-project-desc">
                  <span className="sl-detail-summary-label">Project Description</span>
                  <span className="sl-detail-summary-value">{PROJECT_DESCRIPTION}</span>
                </div>
                <div className="sl-detail-summary-item sl-detail-summary-item-subcontract">
                  <span className="sl-detail-summary-label">Subcontract</span>
                  <span className="sl-detail-summary-value">{record.subcontract}</span>
                </div>
                <div className="sl-detail-summary-item sl-detail-summary-item-subcontract-desc">
                  <span className="sl-detail-summary-label">Subcontract Description</span>
                  <span className="sl-detail-summary-value">{record.slDescription || '—'}</span>
                </div>
                <div className="sl-detail-summary-item sl-detail-summary-item-status">
                  <span className="sl-detail-summary-label">SL status</span>
                  <ModusWcBadge
                    color={slStatusBadgeColor(record.slStatus)}
                    customClass={`sl-status-badge ${slStatusBadgeClass(record.slStatus)}`}
                    size="sm"
                    variant="outlined"
                  >
                    {slStatusLabel(record.slStatus)}
                  </ModusWcBadge>
                </div>
                <div className="sl-detail-summary-item sl-detail-summary-item-workflow">
                  <span className="sl-detail-summary-label">Approval Status</span>
                  {/* Remount on status change; the badge drops its chrome when color updates in place. */}
                  <ModusWcBadge
                    key={record.workflowStatus}
                    color={workflowStatusBadgeColor(record.workflowStatus)}
                    customClass="sl-status-badge sl-workflow-status-badge"
                    size="sm"
                    variant="outlined"
                  >
                    {record.workflowStatus}
                  </ModusWcBadge>
                </div>
              </div>
              <div
                className="sl-detail-summary-trailing"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <div className="sl-detail-summary-actions">
                  <div
                    className="sl-detail-summary-workflow-action"
                    hidden={!showWorkflowButton}
                    aria-hidden={!showWorkflowButton}
                  >
                    <ModusWcButton
                      color="tertiary"
                      customClass="sl-detail-summary-action-btn"
                      disabled
                      size="sm"
                      variant="filled"
                    >
                      {workflowViewLabel(record.workflowStatus)}
                    </ModusWcButton>
                  </div>
                  <div
                    className="sl-detail-summary-submit-action"
                    hidden={!showSubmitButton}
                    aria-hidden={!showSubmitButton}
                  >
                    <ModusWcButton
                      color="primary"
                      customClass="sl-detail-summary-action-btn"
                      disabled={isDirty}
                      size="sm"
                      title={
                        isDirty ? 'Save your changes before submitting for approval.' : undefined
                      }
                      variant="filled"
                      onButtonClick={onSubmitForApproval}
                    >
                      <ModusWcIcon decorative name="paper_plane" size="xs" variant="outlined" />
                      {submitLabel}
                    </ModusWcButton>
                  </div>
                  <ModusWcButton
                    aria-expanded={summaryExpanded}
                    aria-label={summaryExpanded ? 'Collapse summary' : 'Expand summary'}
                    color="tertiary"
                    customClass="sl-detail-summary-toggle"
                    shape="square"
                    size="sm"
                    variant="borderless"
                    onButtonClick={() => setSummaryExpanded((expanded) => !expanded)}
                  >
                    <ModusWcIcon
                      decorative
                      customClass="sl-detail-summary-chevron"
                      name={summaryExpanded ? 'expand_less' : 'expand_more'}
                      size="sm"
                      variant="outlined"
                    />
                  </ModusWcButton>
                </div>
              </div>
            </div>

          <div
            slot="content"
            className="sl-detail-summary-expanded"
            hidden={!summaryExpanded}
            aria-hidden={!summaryExpanded}
          >
            <div className="sl-detail-summary-totals">
              <div className="sl-detail-summary-total-item sl-detail-summary-total-item-original">
                <span className="sl-detail-summary-label">Total Original</span>
                <span className="sl-detail-summary-value sl-detail-summary-value-numeric">
                  {formatCurrency(record.totalOrigSubct)}
                </span>
              </div>
              <div className="sl-detail-summary-total-item sl-detail-summary-total-item-current">
                <span className="sl-detail-summary-label">Total Current</span>
                <span className="sl-detail-summary-value sl-detail-summary-value-numeric">
                  {formatCurrency(record.totalCurrSubct)}
                </span>
              </div>
            </div>
          </div>
        </modus-wc-collapse>
        </div>
      </ModusWcCard>

      <ModusWcModal
        aria-label={workflowReviewersModalTitle(record.workflowStatus)}
        backdrop="default"
        modalId={WORKFLOW_REVIEWERS_MODAL_ID}
        position="center"
        showClose
      >
        <span slot="header">{workflowReviewersModalTitle(record.workflowStatus)}</span>
        <div slot="content" className="sl-workflow-reviewers">
          <ModusWcTypography hierarchy="p" size="sm">
            {record.workflowStatus === 'Approval Required'
              ? 'Reviewers assigned to this subcontract before it is submitted for approval.'
              : 'Workflow steps, approvers, and the current approval status for this subcontract.'}
          </ModusWcTypography>
          <ul className="sl-workflow-reviewer-list">
            {workflowReviewersForStatus(record.workflowStatus).map((reviewer) => (
              <li key={`${reviewer.step}-${reviewer.user}`} className="sl-workflow-reviewer">
                <span className="sl-workflow-reviewer-step">Step {reviewer.step}</span>
                <span className="sl-workflow-reviewer-user">{reviewer.user}</span>
                <span className="sl-workflow-reviewer-limit">{reviewer.limit}</span>
                <span className="sl-workflow-reviewer-optional">
                  {reviewer.optional ? 'Optional' : 'Required'}
                </span>
                <ModusWcBadge
                  color={
                    reviewer.status === 'Rejected'
                      ? 'danger'
                      : reviewer.status === 'Approved'
                        ? 'success'
                        : 'warning'
                  }
                  size="sm"
                  variant="outlined"
                >
                  {reviewer.status}
                </ModusWcBadge>
              </li>
            ))}
          </ul>
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            color="tertiary"
            size="sm"
            variant="outlined"
            onButtonClick={closeWorkflowReviewers}
          >
            Close
          </ModusWcButton>
          <div
            className="sl-detail-summary-submit-action"
            hidden={!showSubmitButton}
            aria-hidden={!showSubmitButton}
          >
            <ModusWcButton
              color="primary"
              disabled={isDirty}
              size="sm"
              title={isDirty ? 'Save your changes before submitting for approval.' : undefined}
              variant="filled"
              onButtonClick={submitFromModal}
            >
              <ModusWcIcon decorative name="paper_plane" size="xs" variant="outlined" />
              {submitLabel}
            </ModusWcButton>
          </div>
        </div>
      </ModusWcModal>
    </div>
  )
}
