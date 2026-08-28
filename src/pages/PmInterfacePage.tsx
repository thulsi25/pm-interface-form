import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTableColumnFilterRow } from '../hooks/useTableColumnFilterRow'
import type { ITableColumn } from '@trimble-oss/moduswebcomponents'
import {
  ModusWcAlert,
  ModusWcButton,
  ModusWcCard,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  LOCKED_ROW_IDS,
  PM_INTERFACE_RECORDS,
  type InterfaceRecord,
} from '../data/interfaceRecords'
import {
  getInterfaceableSubcontractItems,
  markSubcontractItemsInterfaced,
} from '../data/subcontractStore'
import {
  createAmountCell,
  createNumericTextCell,
  createStatusCell,
  createTextCell,
} from '../utils/tableCells'
import { readInputString } from '../utils/modusFormEvents'

const RECORD_TYPE_OPTIONS: ISelectOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Approved Change Order', value: 'aco' },
  { label: 'Purchase Order Change Order', value: 'poco' },
  { label: 'Quotes', value: 'quotes' },
  { label: 'Subcontract', value: 'subcontract' },
]

const AUDIT_REPORT_OPTIONS = [
  { id: 'jobCost', label: 'Job Cost', defaultChecked: true, disabled: false },
  { id: 'contracts', label: 'Contracts', defaultChecked: true, disabled: false },
  {
    id: 'purchaseOrders',
    label: 'Purchase Orders',
    defaultChecked: false,
    disabled: true,
  },
  {
    id: 'subcontracts',
    label: 'Subcontracts',
    defaultChecked: false,
    disabled: true,
  },
  {
    id: 'materialOrders',
    label: 'Material Orders',
    defaultChecked: false,
    disabled: true,
  },
  {
    id: 'materialQuotes',
    label: 'Material Quotes',
    defaultChecked: false,
    disabled: true,
  },
] as const

const NUMERIC_COLUMN_CLASS = 'pm-table-col-numeric'

/** Demo: this record fails validation when selected */
const VALIDATION_FAIL_ROW_ID = '2'

type PagePhase = 'browse' | 'validating' | 'validated' | 'interfacing'

function buildColumns(
  includeStatus: boolean,
  includeErrorDescription: boolean,
): ITableColumn[] {
  const columns: ITableColumn[] = []

  columns.push({
    id: 'recordType',
    accessor: 'recordType',
    header: 'Record Type',
    sortable: true,
    cellRenderer: (value) => createTextCell(String(value ?? '')),
  })

  if (includeStatus) {
    columns.push({
      id: 'status',
      accessor: 'status',
      header: 'Status',
      width: '11rem',
      cellRenderer: (value) =>
        createStatusCell(value as InterfaceRecord['status']),
    })
  }

  if (includeErrorDescription) {
    columns.push({
      id: 'errorDescription',
      accessor: 'errorDescription',
      header: 'Error Description',
      cellRenderer: (value) => createTextCell(String(value ?? '')),
    })
  }

  columns.push(
    {
      id: 'recordId',
      accessor: 'recordId',
      header: 'ID',
      sortable: true,
      width: '7rem',
      cellRenderer: (value) => createTextCell(String(value ?? '')),
    },
    {
      id: 'description',
      accessor: 'description',
      header: 'Description',
      sortable: true,
      cellRenderer: (value) => createTextCell(String(value ?? '')),
    },
    {
      id: 'coNumber',
      accessor: 'coNumber',
      header: 'CO Number',
      className: NUMERIC_COLUMN_CLASS,
      width: '6rem',
      cellRenderer: (value) => createNumericTextCell(String(value ?? '')),
    },
    {
      id: 'aco',
      accessor: 'aco',
      header: 'ACO',
      width: '4rem',
      cellRenderer: (value) => createNumericTextCell(value as number),
    },
    {
      id: 'amountToInterface',
      accessor: 'amountToInterface',
      header: 'Amount to Interface',
      sortable: true,
      className: NUMERIC_COLUMN_CLASS,
      cellRenderer: (value) => createAmountCell(Number(value)),
    },
    {
      id: 'currentAmount',
      accessor: 'currentAmount',
      header: 'Current Amount',
      sortable: true,
      className: NUMERIC_COLUMN_CLASS,
      cellRenderer: (value) => createAmountCell(Number(value)),
    },
    {
      id: 'transactionType',
      accessor: 'transactionType',
      header: 'Tran',
      width: '5.5rem',
    },
  )

  return columns
}

function createInitialAuditReports(): Record<string, boolean> {
  return Object.fromEntries(
    AUDIT_REPORT_OPTIONS.map((option) => [option.id, option.defaultChecked]),
  )
}

const VALIDATION_SPINNER_RADIUS = 52
const VALIDATION_SPINNER_CIRCUMFERENCE = 2 * Math.PI * VALIDATION_SPINNER_RADIUS

function ProgressSpinner({ progress }: { progress: number }) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const offset =
    VALIDATION_SPINNER_CIRCUMFERENCE * (1 - clampedProgress / 100)

  const circleStyle = {
    fill: 'none',
    strokeWidth: 8,
  } as const

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clampedProgress}
      className="pm-validation-spinner"
      role="progressbar"
    >
      <svg
        aria-hidden="true"
        className="pm-validation-spinner-svg"
        viewBox="0 0 120 120"
      >
        <circle
          className="pm-validation-spinner-track"
          cx="60"
          cy="60"
          r={VALIDATION_SPINNER_RADIUS}
          style={{
            ...circleStyle,
            stroke: 'rgba(255, 255, 255, 0.28)',
          }}
        />
        <circle
          className="pm-validation-spinner-progress"
          cx="60"
          cy="60"
          r={VALIDATION_SPINNER_RADIUS}
          style={{
            ...circleStyle,
            stroke: '#ffffff',
            strokeLinecap: 'round',
            strokeDasharray: `${VALIDATION_SPINNER_CIRCUMFERENCE}`,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <span className="pm-validation-percent">{clampedProgress}%</span>
    </div>
  )
}

function cloneRecords(): InterfaceRecord[] {
  return [
    ...PM_INTERFACE_RECORDS.map((row) => ({ ...row })),
    ...getInterfaceableSubcontractItems(),
  ]
}

function applyValidationResults(
  records: InterfaceRecord[],
  selectedIds: string[],
): InterfaceRecord[] {
  return records.map((row) => {
    if (!selectedIds.includes(row.id)) return row

    if (row.id === VALIDATION_FAIL_ROW_ID) {
      return {
        ...row,
        status: 'Error in validation',
        errorDescription: 'Error Description brief goes here',
      }
    }

    return {
      ...row,
      status: 'Validated',
      errorDescription: undefined,
    }
  })
}

function formatValidationFailureMessage(record: InterfaceRecord): string {
  return `${record.recordId} ${record.recordType.toLowerCase()} validation failed`
}

export function PmInterfacePage() {
  const tableHostRef = useRef<HTMLDivElement>(null)
  const validatingSelectionRef = useRef<string[]>([])
  const interfacingSelectionRef = useRef<string[]>([])
  const pendingSubcontractInterfaceRef = useRef<
    { subcontractId: string; itemId: string }[]
  >([])
  const interfaceMonthRef = useRef('June, 2026')
  const [project] = useState('100')
  const [recordType, setRecordType] = useState('all')
  const [inventoryCompany, setInventoryCompany] = useState('1')
  const [accountingPeriod, setAccountingPeriod] = useState('June, 2026')
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [records, setRecords] = useState<InterfaceRecord[]>(cloneRecords)
  const [pagePhase, setPagePhase] = useState<PagePhase>('browse')
  const [validationProgress, setValidationProgress] = useState(0)
  const [validatedRowIds, setValidatedRowIds] = useState<string[]>([])
  const [auditReports, setAuditReports] = useState(createInitialAuditReports)
  const [showValidationErrorToast, setShowValidationErrorToast] = useState(true)
  const [showInterfaceSuccessToast, setShowInterfaceSuccessToast] = useState(false)

  const isInterfacing = pagePhase === 'interfacing'
  const isValidated = pagePhase === 'validated' || isInterfacing
  const hasValidationErrors = records.some(
    (row) => row.status === 'Error in validation',
  )
  const isValidationSuccessful = isValidated && !hasValidationErrors
  const failedRecord = records.find((row) => row.status === 'Error in validation')
  const columns = useMemo(
    () => buildColumns(isValidated, hasValidationErrors),
    [isValidated, hasValidationErrors],
  )
  const tableData = useMemo(() => {
    const rows = records.map((row) => ({ ...row }))
    if (!isValidated) return rows
    return rows.filter((row) => validatedRowIds.includes(row.id))
  }, [records, isValidated, validatedRowIds])
  const tableSelectedRowIds = isValidated ? validatedRowIds : selectedRowIds

  const isRowSelectable = useCallback(
    (row: Record<string, unknown>) => {
      if (isValidated) return false
      const rowId = String(row.id ?? '')
      return !LOCKED_ROW_IDS.includes(rowId)
    },
    [isValidated],
  )

  useTableColumnFilterRow(
    tableHostRef,
    `${tableData.length}-${isValidated ? 'validated' : 'browse'}-${hasValidationErrors ? 'errors' : 'ok'}`,
  )

  const canValidate = selectedRowIds.length > 0 && pagePhase === 'browse'

  const handleRowSelectionChange = useCallback(
    (e: CustomEvent<{ selectedRowIds: string[] }>) => {
      if (pagePhase !== 'browse') return
      setSelectedRowIds(e.detail.selectedRowIds)
    },
    [pagePhase],
  )

  const handleValidateContinue = useCallback(() => {
    if (selectedRowIds.length === 0) return
    validatingSelectionRef.current = [...selectedRowIds]
    setValidationProgress(0)
    setPagePhase('validating')
  }, [selectedRowIds])

  useEffect(() => {
    if (pagePhase !== 'validating') return

    let progress = 0
    const intervalId = window.setInterval(() => {
      progress = Math.min(100, progress + 5)
      setValidationProgress(progress)

      if (progress < 100) return

      window.clearInterval(intervalId)
      const selectedIds = validatingSelectionRef.current
      setRecords((prev) => {
        const next = applyValidationResults(prev, selectedIds)
        setShowValidationErrorToast(
          next.some((row) => row.status === 'Error in validation'),
        )
        return next
      })
      setValidatedRowIds(selectedIds)
      setSelectedRowIds(selectedIds)
      setPagePhase('validated')
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [pagePhase])

  const handleClearValidation = useCallback(() => {
    setRecords((prev) =>
      prev.map((row) =>
        validatedRowIds.includes(row.id)
          ? {
              ...row,
              status: 'Yet to validate',
              errorDescription: undefined,
            }
          : row,
      ),
    )
    setValidatedRowIds([])
    setSelectedRowIds([])
    setAuditReports(createInitialAuditReports())
    setShowValidationErrorToast(true)
    setPagePhase('browse')
  }, [validatedRowIds])

  const handleInterface = useCallback(() => {
    if (!isValidationSuccessful || validatedRowIds.length === 0) return
    interfacingSelectionRef.current = [...validatedRowIds]
    pendingSubcontractInterfaceRef.current = records
      .filter(
        (row) =>
          validatedRowIds.includes(row.id) && row.sourceSubcontractId && row.sourceItemId,
      )
      .map((row) => ({
        subcontractId: row.sourceSubcontractId as string,
        itemId: row.sourceItemId as string,
      }))
    interfaceMonthRef.current = accountingPeriod
    setValidationProgress(0)
    setPagePhase('interfacing')
  }, [accountingPeriod, isValidationSuccessful, records, validatedRowIds])

  useEffect(() => {
    if (pagePhase !== 'interfacing') return

    let progress = 0
    const intervalId = window.setInterval(() => {
      progress = Math.min(100, progress + 5)
      setValidationProgress(progress)

      if (progress < 100) return

      window.clearInterval(intervalId)
      const idsToRemove = interfacingSelectionRef.current
      markSubcontractItemsInterfaced(
        pendingSubcontractInterfaceRef.current,
        interfaceMonthRef.current,
      )
      pendingSubcontractInterfaceRef.current = []
      setRecords((prev) => prev.filter((row) => !idsToRemove.includes(row.id)))
      setValidatedRowIds([])
      setSelectedRowIds([])
      setAuditReports(createInitialAuditReports())
      setShowInterfaceSuccessToast(true)
      setPagePhase('browse')
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [pagePhase])

  const recordCountLabel = isValidated
    ? `${validatedRowIds.length} records validated`
    : selectedRowIds.length > 0
      ? `${selectedRowIds.length} of ${tableData.length} records selected`
      : `${tableData.length} records`

  return (
    <div className={`page-main${isValidated ? ' page-main-validated' : ''}`}>
      <ModusWcTypography
        hierarchy="h1"
        size="2xl"
        weight="bold"
        label="PM Interface"
      />

      <ModusWcCard bordered={false} customClass="pm-project-card" padding="compact">
        <div className="pm-project-grid">
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="semibold"
            customClass="pm-project-grid-label"
          >
            Project <span className="pm-required-indicator">*</span>
          </ModusWcTypography>
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="semibold"
            customClass="pm-project-grid-label"
            label="Project Description"
          />
          <ModusWcTextInput
            customClass="pm-project-input"
            includeSearch
            aria-label="Project"
            required
            size="sm"
            value={project}
            readOnly
          />
          <ModusWcTypography
            hierarchy="p"
            size="md"
            customClass="pm-project-grid-value"
            label="Olympic HQ Building"
          />
        </div>
      </ModusWcCard>

      <ModusWcAlert
        alertDescription="You have 2 unposted batches that need to be interfaced."
        customClass="pm-batch-alert"
        icon="alert"
        role="status"
        variant="warning"
      >
        <ModusWcButton
          slot="button"
          aria-label="View Batches"
          color="warning"
          customClass="pm-view-batches-btn"
          size="xs"
          variant="outlined"
          onButtonClick={() => {
            /* wired in workflow step */
          }}
        >
          View Batches
          <ModusWcIcon decorative name="chevron_right" size="xs" variant="outlined" />
        </ModusWcButton>
      </ModusWcAlert>

      <ModusWcCard
        bordered={false}
        customClass="pm-table-card"
        padding="compact"
      >
        <div className="flex w-full min-w-0 flex-col gap-3">
          <div className="pm-table-toolbar">
            <div className="pm-record-count">
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="!m-0"
                label={recordCountLabel}
              />
              <ModusWcButton
                aria-label="Refresh records"
                color="tertiary"
                shape="square"
                size="sm"
                variant="borderless"
                onButtonClick={() => {
                  /* refresh stub */
                }}
              >
                <ModusWcIcon decorative name="refresh" size="xs" variant="outlined" />
              </ModusWcButton>
            </div>
            <div className="pm-table-toolbar-filters">
              <div className="pm-filter-field pm-filter-field-select">
                <span className="pm-filter-inline-label">Record Type</span>
                <ModusWcSelect
                  aria-label="Record Type"
                  bordered={false}
                  customClass="pm-filter-control"
                  options={RECORD_TYPE_OPTIONS}
                  size="sm"
                  value={recordType}
                  onInputChange={(e: CustomEvent) =>
                    setRecordType(readInputString(e) || 'all')
                  }
                />
                <ModusWcIcon
                  decorative
                  customClass="pm-filter-field-chevron"
                  name="expand_more"
                  size="xs"
                  variant="outlined"
                />
              </div>
              <div className="pm-filter-field pm-inventory-company-field">
                <span className="pm-filter-inline-label">Inventory Company</span>
                <ModusWcTextInput
                  aria-label="Inventory Company"
                  bordered={false}
                  customClass="pm-filter-control"
                  size="sm"
                  value={inventoryCompany}
                  onInputChange={(e: CustomEvent) =>
                    setInventoryCompany(readInputString(e))
                  }
                />
              </div>
            </div>
            {isValidated ? (
              <div className="pm-validation-toolbar-actions">
                {hasValidationErrors ? (
                  <ModusWcButton
                    color="warning"
                    customClass="pm-view-error-report-btn"
                    size="sm"
                    variant="outlined"
                    onButtonClick={() => {
                      /* view error report stub */
                    }}
                  >
                    <ModusWcIcon decorative name="alert" size="xs" variant="outlined" />
                    View Error Report
                  </ModusWcButton>
                ) : null}
                <ModusWcButton
                  color="tertiary"
                  customClass="pm-clear-validation-btn"
                  size="sm"
                  variant="outlined"
                  onButtonClick={handleClearValidation}
                >
                  Clear Validation
                </ModusWcButton>
              </div>
            ) : null}
          </div>

          <div className="pm-table-actions">
            <ModusWcButton
              color="tertiary"
              customClass="pm-properties-btn"
              size="xs"
              variant="borderless"
            >
              <ModusWcIcon decorative name="settings" size="xs" variant="outlined" />
              Properties
              <ModusWcIcon decorative name="expand_more" size="xs" variant="outlined" />
            </ModusWcButton>
            <ModusWcButton
              aria-label="Column layout"
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
            >
              <ModusWcIcon decorative name="grid_view" size="xs" variant="outlined" />
            </ModusWcButton>
            <ModusWcButton
              aria-label="Filter"
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
            >
              <ModusWcIcon decorative name="filter" size="xs" variant="outlined" />
            </ModusWcButton>
            <ModusWcButton
              color="tertiary"
              customClass="pm-clear-search-btn"
              disabled
              size="sm"
              variant="borderless"
            >
              Clear Search
            </ModusWcButton>
          </div>

          <div className="pm-table-scroll" ref={tableHostRef}>
            <ModusWcTable
              caption="PM interface records"
              columns={columns}
              customClass="pm-interface-table"
              data={tableData}
              density="compact"
              hover
              isRowSelectable={isRowSelectable}
              selectable="multi"
              selectedRowIds={tableSelectedRowIds}
              sortable
              zebra
              onRowSelectionChange={handleRowSelectionChange}
            />
          </div>
        </div>
      </ModusWcCard>

      {isValidationSuccessful ? (
        <div className="pm-audit-reports">
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="semibold"
            customClass="pm-audit-reports-title"
            label="Audit Reports"
          />
          <div className="pm-audit-reports-checkboxes">
            {AUDIT_REPORT_OPTIONS.map((option) => (
              <ModusWcCheckbox
                key={option.id}
                customClass={`pm-audit-report-checkbox${
                  option.disabled ? ' pm-audit-report-checkbox-disabled' : ''
                }`}
                disabled={option.disabled}
                label={option.label}
                size="sm"
                value={auditReports[option.id]}
                onInputChange={(e: CustomEvent) => {
                  if (option.disabled) return
                  const target = (e.detail as InputEvent)?.target as
                    | HTMLInputElement
                    | null
                  if (!target) return
                  setAuditReports((prev) => ({
                    ...prev,
                    [option.id]: target.checked,
                  }))
                }}
              />
            ))}
          </div>
          <div className="pm-audit-reports-actions">
            <ModusWcButton
              color="tertiary"
              customClass="pm-audit-action-btn"
              size="sm"
              variant="outlined"
            >
              <ModusWcIcon decorative name="print" size="xs" variant="outlined" />
              Print
            </ModusWcButton>
            <ModusWcButton
              color="tertiary"
              customClass="pm-audit-action-btn"
              size="sm"
              variant="outlined"
            >
              <ModusWcIcon decorative name="description" size="xs" variant="outlined" />
              Preview
            </ModusWcButton>
          </div>
        </div>
      ) : null}

      <div className={`pm-sticky-footer${isValidated ? ' pm-sticky-footer-validated' : ''}`}>
        <div className="pm-filter-field pm-accounting-period-field">
          <span className="pm-filter-inline-label">Accounting Period</span>
          <ModusWcTextInput
            aria-label="Accounting Period"
            bordered={false}
            customClass="pm-filter-control"
            size="sm"
            value={accountingPeriod}
            onInputChange={(e: CustomEvent) => setAccountingPeriod(readInputString(e))}
          />
          <ModusWcIcon
            decorative
            customClass="pm-accounting-period-icon"
            name="calendar_today"
            size="xs"
            variant="outlined"
          />
        </div>
        {isValidated ? (
          <div className="pm-footer-batch-info">
            <ModusWcIcon
              decorative
              customClass="pm-footer-info-icon"
              name="info"
              size="xs"
              variant="outlined"
            />
            <span className="pm-footer-info-text">
              These batch reports will be attached to HQ batch control
            </span>
          </div>
        ) : null}
        <div className="pm-sticky-footer-actions">
          {isValidated ? (
            <ModusWcButton
              color="primary"
              customClass="pm-interface-btn"
              disabled={hasValidationErrors || isInterfacing}
              size="sm"
              variant="filled"
              onButtonClick={handleInterface}
            >
              Interface
            </ModusWcButton>
          ) : (
            <ModusWcButton
              color="primary"
              customClass="pm-validate-continue-btn"
              disabled={!canValidate}
              size="sm"
              variant="filled"
              onButtonClick={handleValidateContinue}
            >
              Validate &amp; Continue
            </ModusWcButton>
          )}
        </div>
      </div>

      {pagePhase === 'validating' || isInterfacing ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="pm-validation-overlay"
          role="status"
        >
          <div className="pm-validation-overlay-content">
            <ProgressSpinner progress={validationProgress} />
            <ModusWcTypography
              hierarchy="p"
              size="md"
              customClass="pm-validation-message"
              label={
                isInterfacing ? 'Interfacing records...' : 'Validating records...'
              }
            />
          </div>
        </div>
      ) : null}

      {showInterfaceSuccessToast ? (
        <ModusWcAlert
          alertDescription="Records interfaced successfully."
          customClass="pm-interface-success-toast"
          dismissible
          icon="check_circle"
          role="status"
          variant="success"
          onDismissClick={() => setShowInterfaceSuccessToast(false)}
        />
      ) : null}

      {isValidated && hasValidationErrors && showValidationErrorToast && failedRecord ? (
        <ModusWcAlert
          alertDescription={formatValidationFailureMessage(failedRecord)}
          customClass="pm-validation-error-toast"
          dismissible
          icon="alert"
          role="alert"
          variant="error"
          onDismissClick={() => setShowValidationErrorToast(false)}
        />
      ) : null}
    </div>
  )
}

