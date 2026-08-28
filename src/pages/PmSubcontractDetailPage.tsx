import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ModusWcAlert,
  ModusWcButton,
  ModusWcCard,
  ModusWcDivider,
  ModusWcIcon,
  ModusWcModal,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { SubcontractDetailSummary } from '../components/subcontracts/SubcontractDetailSummary'
import { CountBadge } from '../components/subcontracts/CountBadge'
import { CollapsePaneIcon } from '../components/subcontracts/CollapsePaneIcon'
import { SubcontractDetailToolbar } from '../components/subcontracts/SubcontractDetailToolbar'
import {
  SubcontractDistributionTab,
  type DistributionView,
} from '../components/subcontracts/SubcontractDistributionTab'
import { SubcontractAutoComplianceTab } from '../components/subcontracts/SubcontractAutoComplianceTab'
import { SubcontractCertificatesTab } from '../components/subcontracts/SubcontractCertificatesTab'
import { SubcontractChangeOrdersTab } from '../components/subcontracts/SubcontractChangeOrdersTab'
import { SubcontractInclusionsExclusionsTab } from '../components/subcontracts/SubcontractInclusionsExclusionsTab'
import { SubcontractInformationTab } from '../components/subcontracts/SubcontractInformationTab'
import { SubcontractInterfacedTab } from '../components/subcontracts/SubcontractInterfacedTab'
import { SubcontractNonInterfacedTab } from '../components/subcontracts/SubcontractNonInterfacedTab'
import { SubcontractAttachmentTab } from '../components/subcontracts/SubcontractAttachmentTab'
import { SubcontractNotesTab } from '../components/subcontracts/SubcontractNotesTab'
import {
  createNewSubcontractRecord,
  deleteSubcontractRecord,
  getSubcontractById,
  loadSubcontractRecords,
  saveSubcontractRecord,
} from '../data/subcontractStore'
import type {
  SubcontractAttachmentFile,
  SubcontractCertificate,
  SubcontractChangeOrder,
  SubcontractComplianceCode,
  SubcontractInclusionExclusion,
  SubcontractItem,
  SubcontractRecord,
} from '../data/subcontractTypes'
import {
  getRequiredFieldCompletion,
  INFORMATION_TAB_REQUIRED_FIELDS,
} from '../utils/subcontractTabCompletion'
import {
  isSubcontractRecordDirty,
  serializeSubcontractRecord,
} from '../utils/subcontractDirtyState'
import { addingItemResetsWorkflow } from '../utils/subcontractWorkflow'

type DetailTab =
  | 'information'
  | 'notes'
  | 'distribution'
  | 'nonInterfaced'
  | 'interfaced'
  | 'attachment'
  | 'inclusions'
  | 'changeOrders'
  | 'certificates'
  | 'autoCompliance'

const WORKFLOW_RESET_MODAL_ID = 'sl-add-item-workflow-modal'

function DetailActionDivider() {
  return (
    <ModusWcDivider
      color="tertiary"
      customClass="sl-detail-action-divider"
      orientation="horizontal"
      responsive={false}
    />
  )
}

const ALL_DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'information', label: 'Information' },
  { id: 'notes', label: 'Notes' },
  { id: 'distribution', label: 'Distribution' },
  { id: 'nonInterfaced', label: 'Non-Interfaced Items' },
  { id: 'interfaced', label: 'Interfaced Items' },
  { id: 'attachment', label: 'Attachment' },
  { id: 'inclusions', label: 'Inclusions / Exclusions' },
  { id: 'changeOrders', label: 'Change Orders' },
  { id: 'certificates', label: 'Subcontractor Certificates' },
  { id: 'autoCompliance', label: 'Auto Compliance' },
]

// Not default tabs on the Vista PM Subcontracts form. Delete an id here to
// restore the tab; its component, columns, seed data, and styles are intact.
const PARKED_DETAIL_TABS: DetailTab[] = ['certificates', 'autoCompliance']

const DETAIL_TABS = ALL_DETAIL_TABS.filter((tab) => !PARKED_DETAIL_TABS.includes(tab.id))

function getTabRequiredCompletion(tab: DetailTab, record: SubcontractRecord) {
  if (tab === 'information') {
    return getRequiredFieldCompletion(INFORMATION_TAB_REQUIRED_FIELDS, record)
  }
  return { filled: 0, total: 0 }
}

export function PmSubcontractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DetailTab>('information')
  const [navExpanded, setNavExpanded] = useState(true)
  const [record, setRecord] = useState<SubcontractRecord | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState('')
  const [recordIds, setRecordIds] = useState<string[]>(() =>
    loadSubcontractRecords().map((item) => item.id),
  )
  const [toastMessage, setToastMessage] = useState('')
  const [validationError, setValidationError] = useState('')
  const [distributionView, setDistributionView] = useState<DistributionView>('grid')
  const addItemRef = useRef<(() => void) | null>(null)
  const addInclusionRef = useRef<(() => void) | null>(null)
  const addCertificateRef = useRef<(() => void) | null>(null)

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 3000)
  }, [])

  useEffect(() => {
    if (!id) {
      navigate('/pm-subcontracts')
      return
    }

    const existing = getSubcontractById(id)
    if (!existing) {
      navigate('/pm-subcontracts')
      return
    }

    setRecord({ ...existing })
    setSavedSnapshot(serializeSubcontractRecord(existing))
    setRecordIds(loadSubcontractRecords().map((item) => item.id))
    setActiveTab('information')
    setValidationError('')
    setDistributionView('grid')
  }, [id, navigate])

  const currentIndex = useMemo(
    () => (record ? recordIds.indexOf(record.id) : -1),
    [record, recordIds],
  )

  const tabRequiredCompletion = useMemo(() => {
    if (!record) {
      return {
        information: { filled: 0, total: INFORMATION_TAB_REQUIRED_FIELDS.length },
        notes: { filled: 0, total: 0 },
        distribution: { filled: 0, total: 0 },
        nonInterfaced: { filled: 0, total: 0 },
        interfaced: { filled: 0, total: 0 },
        attachment: { filled: 0, total: 0 },
        inclusions: { filled: 0, total: 0 },
        changeOrders: { filled: 0, total: 0 },
        certificates: { filled: 0, total: 0 },
        autoCompliance: { filled: 0, total: 0 },
      } satisfies Record<DetailTab, { filled: number; total: number }>
    }

    return Object.fromEntries(
      DETAIL_TABS.map((tab) => [tab.id, getTabRequiredCompletion(tab.id, record)]),
    ) as Record<DetailTab, { filled: number; total: number }>
  }, [record])

  const isDirty = useMemo(() => {
    if (!record || !savedSnapshot) return false
    return isSubcontractRecordDirty(record, savedSnapshot)
  }, [record, savedSnapshot])

  const updateItems = useCallback((items: SubcontractItem[]) => {
    setRecord((prev) => (prev ? { ...prev, items } : prev))
    setValidationError('')
  }, [])

  const updateInclusionsExclusions = useCallback(
    (inclusionsExclusions: SubcontractInclusionExclusion[]) => {
      setRecord((prev) => (prev ? { ...prev, inclusionsExclusions } : prev))
      setValidationError('')
    },
    [],
  )

  const updateChangeOrders = useCallback((changeOrders: SubcontractChangeOrder[]) => {
    setRecord((prev) => (prev ? { ...prev, changeOrders } : prev))
    setValidationError('')
  }, [])

  const updateCertificates = useCallback((certificates: SubcontractCertificate[]) => {
    setRecord((prev) => (prev ? { ...prev, certificates } : prev))
    setValidationError('')
  }, [])

  const updateComplianceCodes = useCallback((complianceCodes: SubcontractComplianceCode[]) => {
    setRecord((prev) => (prev ? { ...prev, complianceCodes } : prev))
    setValidationError('')
  }, [])

  const updateAttachments = useCallback((attachments: SubcontractAttachmentFile[]) => {
    setRecord((prev) => (prev ? { ...prev, attachments } : prev))
    setValidationError('')
  }, [])

  const updateRecord = useCallback((patch: Partial<SubcontractRecord>) => {
    setRecord((prev) => (prev ? { ...prev, ...patch } : prev))
    setValidationError('')
  }, [])

  const openWorkflowModal = useCallback(() => {
    const dialog = document.getElementById(WORKFLOW_RESET_MODAL_ID) as HTMLDialogElement | null
    dialog?.showModal()
  }, [])

  const closeWorkflowModal = useCallback(() => {
    const dialog = document.getElementById(WORKFLOW_RESET_MODAL_ID) as HTMLDialogElement | null
    dialog?.close()
  }, [])

  const handleAddItem = useCallback(() => {
    if (!record) return
    if (addingItemResetsWorkflow(record)) {
      openWorkflowModal()
      return
    }
    addItemRef.current?.()
  }, [openWorkflowModal, record])

  const handleConfirmAddItem = useCallback(() => {
    if (!record) return
    const next = {
      ...record,
      approved: false,
      slStatus: '3 - Pending',
      workflowStatus: 'Approval Required' as const,
    }
    saveSubcontractRecord(next)
    setRecord(next)
    setSavedSnapshot(serializeSubcontractRecord(next))
    closeWorkflowModal()
    window.setTimeout(() => addItemRef.current?.(), 0)
  }, [closeWorkflowModal, record])

  const goToRecord = useCallback(
    (nextId: string) => {
      navigate(`/pm-subcontracts/${nextId}`)
    },
    [navigate],
  )

  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return
    goToRecord(recordIds[currentIndex - 1])
  }, [currentIndex, goToRecord, recordIds])

  const handleNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= recordIds.length - 1) return
    goToRecord(recordIds[currentIndex + 1])
  }, [currentIndex, goToRecord, recordIds])

  const handleDelete = useCallback(() => {
    if (!record) return
    deleteSubcontractRecord(record.id)
    navigate('/pm-subcontracts')
  }, [navigate, record])

  const handleCreate = useCallback(() => {
    const draft = createNewSubcontractRecord()
    saveSubcontractRecord(draft)
    navigate(`/pm-subcontracts/${draft.id}`)
  }, [navigate])

  const handleSave = useCallback(() => {
    if (!record) return

    if (!record.vendor.trim()) {
      setValidationError('Vendor is required.')
      setActiveTab('information')
      return
    }

    saveSubcontractRecord(record)
    setSavedSnapshot(serializeSubcontractRecord(record))
    showToast('Subcontract saved successfully.')
  }, [record, showToast])

  const handleSubmitForApproval = useCallback(() => {
    if (!record) return

    const next: SubcontractRecord = { ...record, workflowStatus: 'Submitted for Approval' }
    setRecord(next)
    saveSubcontractRecord(next)
    setSavedSnapshot(serializeSubcontractRecord(next))
    showToast('Submitted for approval. Reviewers have been notified.')
  }, [record, showToast])

  if (!record) {
    return null
  }

  const isDistributionAdd = activeTab === 'distribution' && distributionView === 'add'
  const distributionCount = record.distribution.length
  const nonInterfacedCount = (record.items ?? []).filter((item) => !item.interfaced).length
  const interfacedCount = (record.items ?? []).filter((item) => item.interfaced).length
  const inclusionsCount = (record.inclusionsExclusions ?? []).length
  const changeOrdersCount = (record.changeOrders ?? []).length
  const certificatesCount = (record.certificates ?? []).length
  const complianceCount = (record.complianceCodes ?? []).length
  const isGridTab =
    activeTab !== 'information' && activeTab !== 'notes' && activeTab !== 'attachment'
  const contentTitle =
    activeTab === 'information'
      ? 'Information'
      : isDistributionAdd
        ? 'Add New Distribution'
        : activeTab === 'nonInterfaced'
          ? 'Non-Interfaced Items'
          : activeTab === 'interfaced'
            ? 'Interfaced Items'
            : activeTab === 'inclusions'
              ? 'Inclusions / Exclusions'
              : activeTab === 'changeOrders'
                ? 'Change Orders'
                : activeTab === 'notes'
                  ? 'Notes'
                  : activeTab === 'certificates'
                    ? 'Subcontractor Certificates'
                    : activeTab === 'autoCompliance'
                      ? 'Auto Compliance'
                      : activeTab === 'attachment'
                        ? 'Attachment'
                        : 'Distribution'
  const contentCount = isDistributionAdd
    ? null
    : activeTab === 'nonInterfaced'
      ? nonInterfacedCount
      : activeTab === 'interfaced'
        ? interfacedCount
        : activeTab === 'inclusions'
          ? inclusionsCount
          : activeTab === 'changeOrders'
            ? changeOrdersCount
            : activeTab === 'certificates'
              ? certificatesCount
              : activeTab === 'autoCompliance'
                ? complianceCount
                : activeTab === 'distribution'
                  ? distributionCount
                  : null

  return (
    <div className="page-main sl-page-detail">
      <SubcontractDetailSummary
        record={record}
        isDirty={isDirty}
        onBack={() => navigate('/pm-subcontracts')}
        onSubmitForApproval={handleSubmitForApproval}
      />

      <SubcontractDetailToolbar
        canDelete
        disabled={isDistributionAdd}
        currentIndex={Math.max(currentIndex, 0)}
        totalCount={recordIds.length}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onEmail={() => {
          /* Send email */
        }}
        onFieldProperties={() => {
          /* Field properties */
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onDistribution={() => {
          /* Distribution */
        }}
      />

      <ModusWcCard bordered={false} customClass="sl-detail-card" padding="compact">
        <div
          className={`sl-detail-layout${navExpanded ? '' : ' sl-detail-layout-nav-collapsed'}`}
        >
          <nav
            id="subcontract-detail-nav"
            aria-label="Subcontract sections"
            className="sl-detail-nav"
            hidden={!navExpanded}
          >
            {DETAIL_TABS.map((tab) => {
              const completion = tabRequiredCompletion[tab.id]
              return (
                <button
                  key={tab.id}
                  className={`sl-detail-nav-item${activeTab === tab.id ? ' sl-detail-nav-item-active' : ''}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="sl-detail-nav-item-label">{tab.label}</span>
                  {completion.total > 0 ? (
                    <CountBadge
                      ariaLabel={`${completion.filled} of ${completion.total} required fields completed`}
                    >
                      {completion.filled} / {completion.total}
                    </CountBadge>
                  ) : null}
                </button>
              )
            })}
          </nav>

          <div className="sl-detail-content">
            <div
              className={`sl-detail-content-header${isGridTab ? ' sl-detail-content-header-tight' : ''}`}
            >
              <ModusWcButton
                aria-controls="subcontract-detail-nav"
                aria-expanded={navExpanded}
                aria-label={navExpanded ? 'Collapse section navigation' : 'Expand section navigation'}
                color="tertiary"
                customClass="sl-detail-nav-toggle"
                shape="square"
                size="sm"
                variant="filled"
                onButtonClick={() => setNavExpanded((expanded) => !expanded)}
              >
                <CollapsePaneIcon expanded={navExpanded} />
              </ModusWcButton>
              {isDistributionAdd ? (
                <ModusWcButton
                  aria-label="Back to distributions"
                  color="tertiary"
                  shape="square"
                  size="sm"
                  variant="borderless"
                  onButtonClick={() => setDistributionView('grid')}
                >
                  <ModusWcIcon decorative name="arrow_back" size="sm" variant="outlined" />
                </ModusWcButton>
              ) : null}

              <div className="sl-detail-content-heading">
                <ModusWcTypography
                  hierarchy="h2"
                  size="md"
                  weight="semibold"
                  customClass="sl-detail-content-title"
                  label={contentTitle}
                />
                <span hidden={contentCount == null} aria-hidden={contentCount == null}>
                  <CountBadge
                    ariaLabel={
                      contentCount != null ? `${contentCount} ${contentTitle} records` : undefined
                    }
                    className="sl-detail-content-count"
                  >
                    {contentCount ?? 0}
                  </CountBadge>
                </span>
              </div>

              {activeTab === 'distribution' && !isDistributionAdd ? (
                <div className="sl-detail-content-actions">
                  <ModusWcButton color="tertiary" size="sm" variant="outlined">
                    Export to Excel
                  </ModusWcButton>
                  <DetailActionDivider />
                  <ModusWcButton
                    color="primary"
                    size="sm"
                    variant="outlined"
                    onButtonClick={() => setDistributionView('add')}
                  >
                    Add New Distribution
                  </ModusWcButton>
                </div>
              ) : null}

              {activeTab === 'nonInterfaced' ? (
                <div className="sl-detail-content-actions">
                  <ModusWcButton color="tertiary" size="sm" variant="outlined">
                    Export to Excel
                  </ModusWcButton>
                  <DetailActionDivider />
                  <ModusWcButton
                    color="primary"
                    size="sm"
                    variant="outlined"
                    onButtonClick={handleAddItem}
                  >
                    Add Item
                  </ModusWcButton>
                </div>
              ) : null}

              {activeTab === 'interfaced' || activeTab === 'changeOrders' ? (
                <div className="sl-detail-content-actions">
                  <ModusWcButton color="tertiary" size="sm" variant="outlined">
                    Export to Excel
                  </ModusWcButton>
                </div>
              ) : null}

              {activeTab === 'inclusions' ? (
                <div className="sl-detail-content-actions">
                  <ModusWcButton color="tertiary" size="sm" variant="outlined">
                    Export to Excel
                  </ModusWcButton>
                  <DetailActionDivider />
                  <ModusWcButton
                    color="primary"
                    size="sm"
                    variant="outlined"
                    onButtonClick={() => addInclusionRef.current?.()}
                  >
                    Add Inclusion / Exclusion
                  </ModusWcButton>
                </div>
              ) : null}

              {activeTab === 'certificates' ? (
                <div className="sl-detail-content-actions">
                  <ModusWcButton color="tertiary" size="sm" variant="outlined">
                    Export to Excel
                  </ModusWcButton>
                  <DetailActionDivider />
                  <ModusWcButton
                    color="primary"
                    size="sm"
                    variant="outlined"
                    onButtonClick={() => addCertificateRef.current?.()}
                  >
                    Add Certificate
                  </ModusWcButton>
                </div>
              ) : null}

              {activeTab === 'autoCompliance' ? (
                <div className="sl-detail-content-actions">
                  <ModusWcButton color="tertiary" size="sm" variant="outlined">
                    Export to Excel
                  </ModusWcButton>
                </div>
              ) : null}
            </div>

            <div className="sl-detail-content-body">
              {validationError ? (
                <p className="sl-validation-error" role="alert">
                  {validationError}
                </p>
              ) : null}

              <div
                hidden={activeTab !== 'information'}
                aria-hidden={activeTab !== 'information'}
                role="tabpanel"
                aria-label="Information"
              >
                <SubcontractInformationTab record={record} onChange={updateRecord} />
              </div>
              <div
                hidden={activeTab !== 'notes'}
                aria-hidden={activeTab !== 'notes'}
                role="tabpanel"
                aria-label="Notes"
              >
                <SubcontractNotesTab record={record} onChange={updateRecord} />
              </div>
              <div
                hidden={activeTab !== 'distribution'}
                aria-hidden={activeTab !== 'distribution'}
                role="tabpanel"
                aria-label="Distribution"
              >
                <SubcontractDistributionTab
                  record={record}
                  view={distributionView}
                  onChange={(distribution) => updateRecord({ distribution })}
                  onCommitted={() => {
                    setDistributionView('grid')
                    showToast('Distribution firms added successfully.')
                  }}
                />
              </div>
              <div
                hidden={activeTab !== 'nonInterfaced'}
                aria-hidden={activeTab !== 'nonInterfaced'}
                role="tabpanel"
                aria-label="Non-Interfaced Items"
              >
                <SubcontractNonInterfacedTab
                  addItemRef={addItemRef}
                  record={record}
                  onChange={updateItems}
                />
              </div>
              <div
                hidden={activeTab !== 'interfaced'}
                aria-hidden={activeTab !== 'interfaced'}
                role="tabpanel"
                aria-label="Interfaced Items"
              >
                <SubcontractInterfacedTab record={record} onChange={updateItems} />
              </div>
              <div
                hidden={activeTab !== 'attachment'}
                aria-hidden={activeTab !== 'attachment'}
                role="tabpanel"
                aria-label="Attachment"
              >
                <SubcontractAttachmentTab record={record} onChange={updateAttachments} />
              </div>
              <div
                hidden={activeTab !== 'inclusions'}
                aria-hidden={activeTab !== 'inclusions'}
                role="tabpanel"
                aria-label="Inclusions / Exclusions"
              >
                <SubcontractInclusionsExclusionsTab
                  addRowRef={addInclusionRef}
                  record={record}
                  onChange={updateInclusionsExclusions}
                />
              </div>
              <div
                hidden={activeTab !== 'changeOrders'}
                aria-hidden={activeTab !== 'changeOrders'}
                role="tabpanel"
                aria-label="Change Orders"
              >
                <SubcontractChangeOrdersTab record={record} onChange={updateChangeOrders} />
              </div>
              <div
                hidden={activeTab !== 'certificates'}
                aria-hidden={activeTab !== 'certificates'}
                role="tabpanel"
                aria-label="Subcontractor Certificates"
              >
                <SubcontractCertificatesTab
                  addRowRef={addCertificateRef}
                  record={record}
                  visible={activeTab === 'certificates'}
                  onChange={updateCertificates}
                />
              </div>
              <div
                hidden={activeTab !== 'autoCompliance'}
                aria-hidden={activeTab !== 'autoCompliance'}
                role="tabpanel"
                aria-label="Auto Compliance"
              >
                <SubcontractAutoComplianceTab
                  record={record}
                  visible={activeTab === 'autoCompliance'}
                  onChange={updateComplianceCodes}
                />
              </div>
            </div>
          </div>
        </div>
      </ModusWcCard>

      <div className="sl-detail-footer">
        <ModusWcButton
          color="primary"
          disabled={!isDirty || isDistributionAdd}
          size="md"
          variant="filled"
          onButtonClick={handleSave}
        >
          Save Changes
        </ModusWcButton>
      </div>

      {toastMessage ? (
        <ModusWcAlert
          alertDescription={toastMessage}
          customClass="pm-interface-success-toast"
          dismissible
          icon="check_circle"
          role="status"
          variant="success"
          onDismissClick={() => setToastMessage('')}
        />
      ) : null}

      <ModusWcModal
        aria-label="Adding an item will reset the workflow"
        backdrop="static"
        modalId={WORKFLOW_RESET_MODAL_ID}
        position="center"
        showClose
      >
        <span slot="header">Reset workflow?</span>
        <div slot="content">
          <ModusWcTypography hierarchy="p" size="md">
            Adding an item will reset the workflow. The subcontract will return to Approval
            Required and SL Status will be set to 3 - Pending.
          </ModusWcTypography>
        </div>
        <div slot="footer" className="flex justify-end gap-2">
          <ModusWcButton
            color="tertiary"
            size="sm"
            variant="outlined"
            onButtonClick={closeWorkflowModal}
          >
            Cancel
          </ModusWcButton>
          <ModusWcButton
            color="primary"
            size="sm"
            variant="filled"
            onButtonClick={handleConfirmAddItem}
          >
            Add Item
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </div>
  )
}
