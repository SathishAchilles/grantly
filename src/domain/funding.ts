import type { Student, SupportItem } from './types'

export interface FundingSummary {
  costs: number
  familyContribution: number
  confirmed: SupportItem[]
  pending: SupportItem[]
  confirmedTotal: number
  pendingTotal: number
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

export const supportKindLabel: Record<SupportItem['kind'], string> = {
  cash: 'Paid to you',
  'fee-reduction': 'Reduces your college fee; not cash',
  reimbursement: 'Repays an expense you have already paid',
}
