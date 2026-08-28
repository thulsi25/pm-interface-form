import type { SubcontractRecord } from '../data/subcontractTypes'

export type TabRequiredField = {
  key: keyof SubcontractRecord
  isFilled: (record: SubcontractRecord) => boolean
}

function textFilled(value: string): boolean {
  return value.trim().length > 0
}

/** Required fields shown on the Information tab (asterisk + nav badge denominator). */
export const INFORMATION_TAB_REQUIRED_FIELDS: TabRequiredField[] = [
  { key: 'vendor', isFilled: (record) => textFilled(record.vendor) },
]

export function getRequiredFieldCompletion(
  fields: TabRequiredField[],
  record: SubcontractRecord,
): { filled: number; total: number } {
  const total = fields.length
  const filled = fields.filter((field) => field.isFilled(record)).length
  return { filled, total }
}
