import type { SubcontractRecord, WorkflowStatus } from '../data/subcontractTypes'

const WORKFLOW_RESET_STATUSES: ReadonlySet<WorkflowStatus> = new Set([
  'Submitted for Approval',
  'Partial Approval',
  'Approved',
])

export function seedWorkflowStatus(approved: boolean, slStatus: string): WorkflowStatus {
  if (slStatus.startsWith('3')) {
    return approved ? 'Submitted for Approval' : 'Approval Required'
  }
  if (approved) return 'Approved'
  return 'Approval Not Required'
}

/** Only 'Approval Not Required' never entered a workflow, so there is nothing to view. */
export function isWorkflowButtonVisible(status: WorkflowStatus): boolean {
  return status !== 'Approval Not Required'
}

export function workflowViewLabel(status: WorkflowStatus): string {
  if (status === 'Approval Required') return 'View Reviewers'
  if (status === 'Rejected') return 'View Rejection Details'
  return 'View Approval Progress'
}

/** A rejected subcontract goes back to the originator to fix and resubmit. */
export function isSubmitForApprovalVisible(status: WorkflowStatus): boolean {
  return status === 'Approval Required' || status === 'Rejected'
}

export function submitForApprovalLabel(status: WorkflowStatus): string {
  return status === 'Rejected' ? 'Resubmit for Approval' : 'Submit for Approval'
}

/** Adding a non-interfaced item resets workflow once it is in flight, approved, or interfaced. */
export function addingItemResetsWorkflow(record: SubcontractRecord): boolean {
  if (WORKFLOW_RESET_STATUSES.has(record.workflowStatus)) return true
  return (record.items ?? []).some((item) => item.interfaced)
}

export function workflowStatusBadgeColor(
  status: WorkflowStatus,
): 'danger' | 'primary' | 'success' | 'tertiary' | 'warning' {
  switch (status) {
    case 'Rejected':
      return 'danger'
    case 'Approved':
      return 'success'
    case 'Submitted for Approval':
    case 'Partial Approval':
      return 'primary'
    case 'Approval Required':
      return 'warning'
    default:
      return 'tertiary'
  }
}

export function workflowReviewersModalTitle(status: WorkflowStatus): string {
  return status === 'Approval Required' ? 'Pending Reviewers' : 'Workflow Item Reviewers'
}

export interface WorkflowReviewer {
  step: number
  user: string
  limit: string
  optional: boolean
  status: 'Pending' | 'Approved' | 'Rejected'
}

export function workflowReviewersForStatus(status: WorkflowStatus): WorkflowReviewer[] {
  if (status === 'Rejected') {
    return [
      { step: 1, user: 'D. Whitfield', limit: 'Unlimited', optional: false, status: 'Approved' },
      { step: 2, user: 'M. Alvarez', limit: '$1,000,000', optional: false, status: 'Rejected' },
    ]
  }

  if (status === 'Approved') {
    return [
      { step: 1, user: 'D. Whitfield', limit: 'Unlimited', optional: false, status: 'Approved' },
      { step: 2, user: 'M. Alvarez', limit: '$1,000,000', optional: false, status: 'Approved' },
    ]
  }

  if (status === 'Partial Approval' || status === 'Submitted for Approval') {
    return [
      { step: 1, user: 'D. Whitfield', limit: 'Unlimited', optional: false, status: 'Approved' },
      { step: 2, user: 'M. Alvarez', limit: '$1,000,000', optional: false, status: 'Pending' },
    ]
  }

  return [
    { step: 1, user: 'D. Whitfield', limit: 'Unlimited', optional: false, status: 'Pending' },
    { step: 2, user: 'M. Alvarez', limit: '$1,000,000', optional: false, status: 'Pending' },
  ]
}
