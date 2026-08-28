import { ModusWcFileDropzone } from '@trimble-oss/moduswebcomponents-react'
import type { SubcontractAttachmentFile, SubcontractRecord } from '../../data/subcontractTypes'

export function SubcontractAttachmentTab({
  record,
  onChange,
}: {
  record: SubcontractRecord
  onChange: (attachments: SubcontractAttachmentFile[]) => void
}) {
  const attachments = record.attachments ?? []

  return (
    <div className="sl-attachment-tab">
      <ModusWcFileDropzone
        aria-label="Attachment upload"
        customClass="sl-attachment-dropzone"
        fileDraggedOverInstructions="Drop a file here"
        includeStateIcon
        instructions=""
        maxTotalFileSizeBytes={25 * 1024 * 1024}
        onFileSelect={(e: CustomEvent<FileList>) => {
          const files = Array.from(e.detail ?? [])
          onChange(
            files.map((file) => ({
              id: crypto.randomUUID(),
              fileName: file.name,
              sizeBytes: file.size,
            })),
          )
        }}
      >
        <span slot="dropzone" className="sl-attachment-dropzone-copy">
          Drop a file here or <span className="sl-attachment-dropzone-click">click</span> to
          upload
        </span>
      </ModusWcFileDropzone>
      <span className="sr-only" aria-live="polite">
        {attachments.length > 0
          ? `Attached ${attachments.map((file) => file.fileName).join(', ')}`
          : 'No file attached'}
      </span>
    </div>
  )
}
