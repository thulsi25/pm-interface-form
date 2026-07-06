import { useCallback, useMemo, useState } from 'react'
import type { ITableColumn } from '@trimble-oss/moduswebcomponents'
import {
  ModusWcAlert,
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import type { ISelectOption } from '@trimble-oss/moduswebcomponents'
import {
  PM_INTERFACE_RECORDS,
  type InterfaceRecord,
} from '../data/interfaceRecords'
import {
  createAmountCell,
  createNumericTextCell,
  createStatusBadge,
  createTextCell,
} from '../utils/tableCells'
import { readInputString } from '../utils/modusFormEvents'

const RECORD_TYPE_OPTIONS: ISelectOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Approved Change Order', value: 'aco' },
  { label: 'Purchase Order Change Order', value: 'poco' },
  { label: 'Quotes', value: 'quotes' },
]

const NUMERIC_COLUMN_CLASS = 'pm-table-col-numeric'

function buildColumns(): ITableColumn[] {
  return [
    {
      id: 'recordType',
      accessor: 'recordType',
      header: 'Record Type',
      sortable: true,
      cellRenderer: (value) => createTextCell(String(value ?? '')),
    },
    {
      id: 'status',
      accessor: 'status',
      header: 'Status',
      sortable: true,
      cellRenderer: (value) =>
        createStatusBadge(value as InterfaceRecord['status']),
    },
    {
      id: 'recordId',
      accessor: 'recordId',
      header: 'ID',
      sortable: true,
      className: NUMERIC_COLUMN_CLASS,
      width: '7rem',
      cellRenderer: (value) => createNumericTextCell(String(value ?? '')),
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
      className: NUMERIC_COLUMN_CLASS,
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
      header: 'Transaction Type',
      width: '8rem',
    },
  ]
}

export function PmInterfacePage() {
  const [project] = useState('100')
  const [recordType, setRecordType] = useState('all')
  const [inventoryCompany, setInventoryCompany] = useState('1')
  const [accountingPeriod] = useState('June, 2026')
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const columns = useMemo(() => buildColumns(), [])
  const tableData = useMemo(
    () => PM_INTERFACE_RECORDS.map((row) => ({ ...row })),
    [],
  )

  const canValidate = selectedRowIds.length > 0

  const isRowSelectable = useCallback((row: Record<string, unknown>) => {
    return row.status !== 'In unposted batch'
  }, [])

  const handleRowSelectionChange = useCallback(
    (e: CustomEvent<{ selectedRowIds: string[] }>) => {
      setSelectedRowIds(e.detail.selectedRowIds)
    },
    [],
  )

  return (
    <div className="page-main">
      <ModusWcTypography
        hierarchy="h1"
        size="2xl"
        weight="bold"
        label="PM Interface"
      />

      <ModusWcCard bordered={false} padding="compact">
        <div className="pm-project-grid">
          <ModusWcTextInput
            includeSearch
            label="Project"
            required
            size="sm"
            value={project}
            readOnly
          />
          <ModusWcTextInput
            label="Project Description"
            readOnly
            size="sm"
            value="Olympic HQ Building"
          />
        </div>
      </ModusWcCard>

      <ModusWcAlert
        alertDescription="You have 2 unposted batches that need to be interfaced."
        customClass="pm-batch-alert"
        icon="warning_outlined"
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
                label={`${tableData.length} records`}
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
              <div className="pm-filter-field">
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
              aria-label="Column visibility"
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
            >
              <ModusWcIcon decorative name="columns" size="xs" variant="outlined" />
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
              disabled
              size="sm"
              variant="outlined"
            >
              Clear Search
            </ModusWcButton>
          </div>

          <div className="pm-table-scroll">
            <ModusWcTable
              caption="PM interface records"
              columns={columns}
              data={tableData}
              density="compact"
              hover
              isRowSelectable={isRowSelectable}
              selectable="multi"
              selectedRowIds={selectedRowIds}
              sortable
              zebra
              onRowSelectionChange={handleRowSelectionChange}
            />
          </div>
        </div>
      </ModusWcCard>

      <div className="pm-sticky-footer">
        <div className="pm-filter-field">
          <span className="pm-filter-inline-label">Accounting Period</span>
          <ModusWcTextInput
            aria-label="Accounting Period"
            bordered={false}
            customClass="pm-filter-control"
            readOnly
            size="sm"
            value={accountingPeriod}
          />
        </div>
        <div className="pm-sticky-footer-actions">
          <ModusWcButton
            color="primary"
            customClass="pm-validate-continue-btn"
            disabled={!canValidate}
            size="sm"
            variant="filled"
            onButtonClick={() => {
              /* validate workflow stub */
            }}
          >
            Validate &amp; Continue
          </ModusWcButton>
        </div>
      </div>
    </div>
  )
}

