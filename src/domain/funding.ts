import type { Application, Student, SupportItem, Task } from './types'

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

/**
 * Plain-language description of how each kind of support would reach the student. Worded in the future tense so it
 * never implies money has been paid; whether it has been received is shown by the support item's state, not this label.
 */
export const supportKindLabel: Record<SupportItem['kind'], string> = {
  cash: 'Will be paid to your bank account',
  'fee-reduction': 'Reduces your college fee; not cash',
  reimbursement: 'Will repay an expense you have already paid',
}

/** Where to send a student to resolve a task, with a short description of the destination. */
export interface TaskDestination {
  to: string
  label: string
}

/** Picks the workflow that resolves a task: college tasks go to the college desk, notices to applications, documents to readiness for the task's scheme. */
export function taskDestination(task: Task, application: Application | undefined): TaskDestination {
  if (task.owner === 'institution') return { to: '/college', label: 'Open the college desk' }
  if (!application || application.notice || task.owner === 'provider') {
    return { to: '/applications', label: 'Open applications' }
  }
  return { to: `/readiness?scheme=${encodeURIComponent(application.schemeId)}`, label: 'Check documents in readiness' }
}
