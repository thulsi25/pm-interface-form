import type { SubcontractColumnDef } from './subcontractTypes'

/** Scrollable middle columns (between sticky Subcontract and sticky Actions). */
export const SUBCONTRACT_SCROLL_COLUMNS: SubcontractColumnDef[] = [
  { key: 'slDescription', header: 'SL Description', width: '10rem' },
  { key: 'documentType', header: 'Document Type', width: '8rem' },
  { key: 'vendor', header: 'Vendor', width: '5rem', required: true },
  { key: 'vendorName', header: 'Vendor Name', width: '9rem' },
  { key: 'holdCode', header: 'Hold Code', width: '6rem' },
  { key: 'holdCodeDesc', header: 'Hold Code Desc', width: '9rem' },
  { key: 'payTerms', header: 'Pay Terms', width: '6rem' },
  { key: 'payTermsDesc', header: 'Pay Terms Desc', width: '9rem' },
  { key: 'compGroup', header: 'Comp Group', width: '6.5rem' },
  { key: 'compGroupDesc', header: 'Comp Group Desc', width: '9rem' },
  { key: 'totalOrigSubct', header: 'Total Orig Subct', width: '8rem', numeric: true },
  { key: 'totalCurrSubct', header: 'Total Curr Subct', width: '8rem', numeric: true },
  { key: 'startDate', header: 'Start Date', width: '7rem' },
  { key: 'approved', header: 'Approved', width: '5rem', boolean: true, required: true },
  { key: 'approvedBy', header: 'Approved By', width: '7rem' },
  { key: 'claimApprovalRequired', header: 'Claim Approval Required', width: '9rem', boolean: true, required: true },
  { key: 'slStatus', header: 'SL Status', width: '8rem', required: true },
  { key: 'slJob', header: 'SL Job', width: '5rem' },
  { key: 'slJobDesc', header: 'SL Job Desc', width: '9rem' },
  { key: 'percentOfContract', header: '% of Contract', width: '7rem', numeric: true, required: true },
  { key: 'maxRetgAmt', header: 'Max Retg Amt', width: '7rem', numeric: true, required: true },
  { key: 'percentOfContAmt', header: '% of Cont Amt', width: '7rem', numeric: true },
  { key: 'inclAcoInMaxRetg', header: 'Incl ACO in Max Retg', width: '9rem', boolean: true, required: true },
  { key: 'maxRetDistStyle', header: 'Max Ret Dist Style', width: '14rem', required: true },
  { key: 'notes', header: 'Notes', width: '10rem' },
  { key: 'exhibitAJobsiteRules', header: 'Exhibit A - Jobsite Rules', width: '10rem', boolean: true, required: true },
  { key: 'exhibitBLeedRequirements', header: 'Exhibit B - LEED Requirements', width: '11rem', boolean: true, required: true },
  { key: 'exhibitCInsurance', header: 'Exhibit C - Insurance', width: '9rem', boolean: true, required: true },
  { key: 'exhibitDBillingProcedures', header: 'Exhibit D - Billing Procedures', width: '11rem', boolean: true, required: true },
  { key: 'exhibitESchedule', header: 'Exhibit E - Schedule', width: '9rem', boolean: true, required: true },
  { key: 'bondRequired', header: 'Bond Required?', width: '7rem', boolean: true, required: true },
  { key: 'jhasRequired', header: 'JHAs Required?', width: '7rem', boolean: true },
  { key: 'jhasReqByDate', header: "JHAs Req'd By Date", width: '8rem' },
  { key: 'exhibitFPlansAndSpecs', header: 'Exhibit F - Plans and Specs', width: '11rem', boolean: true, required: true },
  { key: 'plansAndSpecsIndexFilepath', header: 'Plans and Specs Index Filepath', width: '14rem' },
]

export const SUBCONTRACT_STICKY_LEFT_COLUMN: SubcontractColumnDef = {
  key: 'subcontract',
  header: 'Subcontract',
  width: '7.5rem',
}

export const SUBCONTRACT_STICKY_ACTIONS_COLUMN: SubcontractColumnDef = {
  key: 'actions',
  header: 'Actions',
  width: '4.5rem',
}

/** Full column order for reference / exports. */
export const SUBCONTRACT_LIST_COLUMNS: SubcontractColumnDef[] = [
  SUBCONTRACT_STICKY_LEFT_COLUMN,
  ...SUBCONTRACT_SCROLL_COLUMNS,
  SUBCONTRACT_STICKY_ACTIONS_COLUMN,
]

export const MAX_RET_DIST_STYLE_OPTIONS = [
  { label: 'C-Composite Percentage same on all Items', value: 'C-Composite Percentage same on all Items' },
  { label: 'I-Item Percentage from Invoice', value: 'I-Item Percentage from Invoice' },
]

export const ADJUST_MAX_INVOICE_OPTIONS = MAX_RET_DIST_STYLE_OPTIONS

export const SL_STATUS_OPTIONS = [
  { label: '3 - Pending', value: '3 - Pending' },
  { label: '0 - Open', value: '0 - Open' },
  { label: '1 - Complete', value: '1 - Complete' },
  { label: '2 - Closed', value: '2 - Closed' },
]

export const PREFERRED_METHOD_OPTIONS = [
  { label: 'Email', value: 'Email' },
  { label: 'Fax', value: 'Fax' },
  { label: 'Print', value: 'Print' },
]

export const SEND_TYPE_OPTIONS = [
  { label: 'To', value: 'To' },
  { label: 'Cc', value: 'Cc' },
  { label: 'Bcc', value: 'Bcc' },
]

export const SL_ITEM_TYPE_OPTIONS = [
  { label: '1 - Regular', value: '1' },
  { label: '2 - Change Order', value: '2' },
  { label: '3 - Backcharge', value: '3' },
  { label: '4 - Add-on', value: '4' },
]

export const INCLUSION_TYPE_OPTIONS = [
  { label: 'I - Inclusion', value: 'I' },
  { label: 'E - Exclusion', value: 'E' },
]

export const TAX_TYPE_OPTIONS = [
  { label: '1 - Sales', value: '1' },
  { label: '2 - Use', value: '2' },
  { label: '3 - VAT', value: '3' },
]
