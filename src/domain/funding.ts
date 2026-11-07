import type { Student, SupportItem } from './types'

/** Costs, family contribution and support for one student, with the amount still unfunded. */
export interface FundingSummary {
  costs: number
  familyContribution: number
  confirmed: SupportItem[]
  pending: SupportItem[]
  confirmedTotal: number
  pendingTotal: number
  /** Costs left after the family contribution and confirmed support, never below zero. */
  gap: number
}

const total = (items: SupportItem[]) => items.reduce((sum, item) => sum + item.amount, 0)

/** Only confirmed support reduces the gap. Pending support is reported separately. */
export function fundingSummary(student: Student): FundingSummary {
  const confirmed = student.support.filter((item) => item.state === 'confirmed')
  const pending = student.support.filter((item) => item.state === 'pending')
  const confirmedTotal = total(confirmed)
  return {
    costs: student.costs,
    familyContribution: student.familyContribution,
    confirmed,
    pending,
    confirmedTotal,
    pendingTotal: total(pending),
    gap: Math.max(0, student.costs - student.familyContribution - confirmedTotal),
  }
}

/** Plain-language description of how each kind of support reaches the student. */
export const supportKindLabel: Record<SupportItem['kind'], string> = {
  cash: 'Paid to you',
  'fee-reduction': 'Reduces your college fee; not cash',
  reimbursement: 'Repays an expense you have already paid',
}
