import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { SubcontractGridToolbar } from '../components/subcontracts/SubcontractGridToolbar'
import { LookupBinocularIcon } from '../components/subcontracts/LookupBinocularIcon'
import { SubcontractListTable } from '../components/subcontracts/SubcontractListTable'
import {
  createNewSubcontractRecord,
  deleteSubcontractRecord,
  loadSubcontractRecords,
  saveSubcontractRecord,
} from '../data/subcontractStore'
import { PROJECT_DESCRIPTION, PROJECT_NUMBER } from '../data/subcontractTypes'
import type { SubcontractRecord } from '../data/subcontractTypes'

export function PmSubcontractsPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState(() => loadSubcontractRecords())
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const refreshRecords = useCallback(() => {
    setRecords(loadSubcontractRecords())
    setSelectedIds([])
  }, [])

  const handleAddNew = useCallback(() => {
    const draft = createNewSubcontractRecord()
    saveSubcontractRecord(draft)
    navigate(`/pm-subcontracts/${draft.id}`)
  }, [navigate])

  const handleDeleteSelected = useCallback(() => {
    for (const id of selectedIds) deleteSubcontractRecord(id)
    setRecords(loadSubcontractRecords())
    setSelectedIds([])
  }, [selectedIds])

  const handleBooleanFieldChange = useCallback(
    (id: string, key: keyof SubcontractRecord, value: boolean) => {
      setRecords((previous) =>
        previous.map((record) => {
          if (record.id !== id) return record
          const next = { ...record, [key]: value }
          saveSubcontractRecord(next)
          return next
        }),
      )
    },
    [],
  )

  return (
    <div className="page-main sl-page-list">
      <ModusWcTypography
        hierarchy="h1"
        size="2xl"
        weight="bold"
        label="PM Subcontracts"
      />

      <ModusWcCard bordered={false} customClass="sl-header-card pm-project-card" padding="compact">
        <div className="sl-list-header-grid">
          <div className="sl-list-header-fields">
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
                aria-label="Project"
                required
                readOnly
                size="sm"
                value={PROJECT_NUMBER}
              >
                <LookupBinocularIcon />
              </ModusWcTextInput>
              <ModusWcTypography
                hierarchy="p"
                size="md"
                customClass="pm-project-grid-value"
                label={PROJECT_DESCRIPTION}
              />
            </div>
          </div>
        </div>
      </ModusWcCard>

      <ModusWcCard
        bordered={false}
        className="sl-table-card-host"
        customClass="pm-table-card sl-table-card"
        padding="compact"
      >
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3">
          <div className="pm-table-toolbar sl-list-primary-toolbar">
            <div className="pm-record-count">
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                weight="semibold"
                customClass="!m-0"
                label={`${records.length} subcontracts`}
              />
              <ModusWcButton
                aria-label="Refresh subcontracts"
                color="tertiary"
                shape="square"
                size="sm"
                variant="borderless"
                onButtonClick={refreshRecords}
              >
                <ModusWcIcon decorative name="refresh" size="xs" variant="outlined" />
              </ModusWcButton>
            </div>

            <div className="sl-list-primary-actions">
              <ModusWcButton
                color="tertiary"
                size="sm"
                variant="outlined"
                onButtonClick={() => {
                  /* Export to Excel */
                }}
              >
                Export to Excel
              </ModusWcButton>
              <ModusWcButton color="primary" size="sm" variant="filled" onButtonClick={handleAddNew}>
                Add New Subcontract
              </ModusWcButton>
            </div>
          </div>

          <SubcontractGridToolbar
            canDelete={selectedIds.length > 0}
            canUndo={false}
            onColumnProperties={() => {
              /* Customize columns */
            }}
            onCreate={handleAddNew}
            onDelete={handleDeleteSelected}
            onDistribution={() => {
              /* Distribution */
            }}
            onFieldProperties={() => {
              /* Field properties */
            }}
            onFilter={() => {
              /* Filter */
            }}
            onUndo={() => {
              /* Undo */
            }}
          />

          <SubcontractListTable
            records={records}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onBooleanFieldChange={handleBooleanFieldChange}
          />
        </div>
      </ModusWcCard>
    </div>
  )
}
