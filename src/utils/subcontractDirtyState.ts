import type { SubcontractRecord } from '../data/subcontractTypes'

export function serializeSubcontractRecord(record: SubcontractRecord): string {
  return JSON.stringify(record)
}

export function isSubcontractRecordDirty(
  current: SubcontractRecord,
  savedSnapshot: string,
): boolean {
  return serializeSubcontractRecord(current) !== savedSnapshot
}
