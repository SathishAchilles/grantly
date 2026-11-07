import type { Email } from '@/data/emails'
import { interpretNotice } from './caseworker'
import type { ActionOwner, Application, Doc, Student, Task } from './types'

/** One change to the records that an email justifies. */
export type EmailChange =
  | { type: 'application-status'; applicationId: string; label: string; owner: ActionOwner }
  | { type: 'payment'; applicationId: string; label: string }
  | { type: 'support-confirmed'; studentId: string; supportId: string }
  | { type: 'task'; task: Omit<Task, 'id' | 'status'> }
  | { type: 'complete-task'; taskId: string }
  | { type: 'add-document'; studentId: string; doc: Omit<Doc, 'basis'> }

/** What reading an email led to: updates to apply, or a reason nothing changes. */
export type EmailOutcome =
  | { kind: 'update'; email: Email; summary: string; changes: EmailChange[] }
  | { kind: 'up-to-date' | 'ignored' | 'suspicious'; email: Email; summary: string }

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const schemeWords: [RegExp, string, string][] = [
  [/pm-usp|pm usp/, 'pm-usp-csss', 'PM-USP CSSS'],
  [/ecss/, 'hdfc-ecss', 'HDFC Parivartan ECSS'],
  [/\bffe\b|foundation for excellence/, 'ffe', 'FFE'],
]

const scholarshipWords = /scholarship|application|pm-usp|ecss|\bffe\b|\bnsp\b|enrolment|fee waiver/

/** Reads the first rupee amount, written as ₹12,000 or Rs 12,000. */
export function parseAmount(text: string): number | null {
  const digits = /(?:₹|\brs\.?)\s?(?<digits>[\d,]+)/i.exec(text)?.groups?.digits
  return digits === undefined ? null : Number(digits.replaceAll(',', ''))
}

/** Reads the first date written as "20 Nov 2026", returning YYYY-MM-DD. */
export function parseDate(text: string): string | null {
  const groups =
    /\b(?<day>\d{1,2}) (?<month>jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (?<year>\d{4})\b/i.exec(
      text,
    )?.groups
  if (!groups) return null
  const { day, month, year } = groups as Record<'day' | 'month' | 'year', string>
  return `${year}-${String(months.indexOf(month.toLowerCase()) + 1).padStart(2, '0')}-${day.padStart(2, '0')}`
}

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

/**
 * Matches an email to the student's applications and works out which records it changes.
 *
 * @param email - The email to read.
 * @param student - The student whose mailbox it is.
 * @param applications - All applications, from which the student's are picked.
 * @param tasks - All tasks, used to find an open task the email completes.
 * @returns An update with its changes, or why the email is up to date, ignored or suspicious.
 */
export function readEmail(email: Email, student: Student, applications: Application[], tasks: Task[]): EmailOutcome {
  const text = `${email.subject} ${email.body}`.toLowerCase()
  const amount = parseAmount(text)

  if (/processing fee|registration fee|pay ₹|pay rs/.test(text) && /scholarship|\bwin\b|\bwon\b/.test(text)) {
    return {
      kind: 'suspicious',
      email,
      summary:
        'Asks you to pay to get a scholarship. Applying on the National Scholarship Portal is free, so treat this as a likely scam.',
    }
  }
  if (!scholarshipWords.test(text)) return { kind: 'ignored', email, summary: 'Not about your scholarships.' }

  if (/fee waiver/.test(text) && /approved/.test(text) && amount !== null) {
    const item = student.support.find((support) => support.state === 'pending' && support.amount === amount)
    if (item) {
      return {
        kind: 'update',
        email,
        summary: `${item.label} of ${formatRupees(amount)} is approved. It will count towards your funding.`,
        changes: [{ type: 'support-confirmed', studentId: student.id, supportId: item.id }],
      }
    }
  }

  const scheme = schemeWords.find(([pattern]) => pattern.test(text))
  const application = scheme
    ? applications
        .filter((candidate) => candidate.studentId === student.id && candidate.schemeId === scheme[1])
        .sort((a, b) => b.academicYear.localeCompare(a.academicYear))[0]
    : undefined

  if (scheme && application) {
    const name = `${scheme[2]}, ${application.academicYear}`

    if (/credited|received/.test(text) && amount !== null) {
      const label = `Received ${formatRupees(amount)}`
      if (application.tracks.payment?.label === label) {
        return { kind: 'up-to-date', email, summary: `${name} already shows this payment.` }
      }
      const item = student.support.find((support) => support.state === 'pending' && support.amount === amount)
      return {
        kind: 'update',
        email,
        summary: `${name}: payment of ${formatRupees(amount)} received.`,
        changes: [
          { type: 'payment', applicationId: application.id, label },
          ...(item ? [{ type: 'support-confirmed' as const, studentId: student.id, supportId: item.id }] : []),
        ],
      }
    }

    if (/payment initiated/.test(text)) {
      const label = amount === null ? 'Payment initiated' : `Payment initiated ${formatRupees(amount)}`
      return {
        kind: 'update',
        email,
        summary: `${name}: payment initiated. It counts once it is received.`,
        changes: [{ type: 'payment', applicationId: application.id, label }],
      }
    }

    if (/application received|submitted successfully/.test(text)) {
      if (application.tracks.application.label === 'Submitted') {
        return { kind: 'up-to-date', email, summary: `${name} already shows as submitted.` }
      }
      return {
        kind: 'update',
        email,
        summary: `${name}: the provider has received your application.`,
        changes: [{ type: 'application-status', applicationId: application.id, label: 'Submitted', owner: 'provider' }],
      }
    }

    const date = parseDate(text)
    if (/shortlisted|interview/.test(text) && date !== null) {
      const title = `Attend the ${scheme[2]} interview`
      return {
        kind: 'update',
        email,
        summary: `${name}: you are shortlisted. Interview task added.`,
        changes: [
          {
            type: 'task',
            task: {
              studentId: student.id,
              studentName: student.name,
              institutionId: student.institution.id,
              applicationId: application.id,
              title,
              owner: 'student',
              deadline: date,
              requirement: email.subject,
            },
          },
        ],
      }
    }

    if (/enrolment letter/.test(text) && /ready|issued/.test(text)) {
      const open = tasks.find(
        (task) =>
          task.applicationId === application.id &&
          task.status !== 'completed' &&
          task.fulfils?.type === 'enrolment-letter',
      )
      return {
        kind: 'update',
        email,
        summary: `${name}: your college has issued the enrolment letter for ${application.academicYear}.`,
        changes: [
          open
            ? { type: 'complete-task', taskId: open.id }
            : {
                type: 'add-document',
                studentId: student.id,
                doc: {
                  id: `${email.id}-doc`,
                  type: 'enrolment-letter',
                  label: 'Enrolment letter',
                  academicYear: application.academicYear,
                  issuer: student.institution.name,
                },
              },
        ],
      }
    }

    if (
      interpretNotice(text).kind === 'enrolment-evidence' &&
      application.tracks.application.label === 'Correction required'
    ) {
      return { kind: 'up-to-date', email, summary: `${name} already shows this correction request.` }
    }
  }

  return { kind: 'ignored', email, summary: 'Could not match this to an application.' }
}
