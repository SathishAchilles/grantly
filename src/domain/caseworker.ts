import { correctionNotice } from '@/data/cases'
import { sources } from '@/data/sources'
import { docTypeLabel } from './readiness'
import type { Application, Doc, Source, Student, Task } from './types'

/** Longest notice text kept, so a long paste cannot flood the page. */
export const NOTICE_MAX_LENGTH = 2000

/** The kinds of provider notice the app recognises. */
export type NoticeKind = 'enrolment-evidence' | 'missing-document' | 'payment-issue' | 'unrecognised'

/** What a notice asks for. A missing document also names which document. */
export type Interpretation =
  | { kind: 'missing-document'; docType: Doc['type'] }
  | { kind: Exclude<NoticeKind, 'missing-document'> }

/** A change the student can confirm: attach a document or create a task. */
export type ProposedAction =
  | { type: 'attach-document'; applicationId: string; doc: Doc }
  | { type: 'create-task'; task: Omit<Task, 'id' | 'status'> }

/** The reading of a notice: steps taken, a summary for the student and the action proposed, if any. */
export interface CaseworkerPlan {
  kind: NoticeKind
  steps: string[]
  summary: string
  action: ProposedAction | null
  source?: Source
}

const documentWords: [RegExp, Doc['type']][] = [
  [/income/, 'income-certificate'],
  [/salary|payslip/, 'salary-slips'],
  [/marksheet|mark sheet/, 'previous-year-marksheet'],
  [/passbook|bank detail/, 'bank-passbook'],
  [/fee receipt/, 'fee-receipt'],
]

/** Normalises pasted text: caps the length, collapses whitespace and trims. */
export const cleanNotice = (text: string) => text.slice(0, NOTICE_MAX_LENGTH).replace(/\s+/g, ' ').trim()

/**
 * Classifies pasted notice text by the keywords it contains.
 *
 * @param text - The notice as pasted.
 * @returns The notice kind, plus the document type for a missing document.
 */
export function interpretNotice(text: string): Interpretation {
  const notice = cleanNotice(text).toLowerCase()
  if (/enrol|enroll|bonafide/.test(notice) && /academic year|current|bonafide/.test(notice))
    return { kind: 'enrolment-evidence' }
  if (/aadhaar|npci|seeding|account/.test(notice) && /payment|failed|rejected|credit/.test(notice))
    return { kind: 'payment-issue' }
  if (/missing|not uploaded|incomplete/.test(notice)) {
    const match = documentWords.find(([pattern]) => pattern.test(notice))
    if (match) return { kind: 'missing-document', docType: match[1] }
  }
  return { kind: 'unrecognised' }
}

/**
 * Turns a notice into a plan the student can confirm, without changing any record itself.
 *
 * @param text - The notice as pasted.
 * @param student - The student the notice is about.
 * @param application - The application the notice relates to.
 * @returns The steps, a summary and the proposed action, or null when the notice is not recognised.
 */
export function planResponse(text: string, student: Student, application: Application): CaseworkerPlan {
  const interpretation = interpretNotice(text)
  const requirement = cleanNotice(text)
  const read = `Read the notice for ${application.academicYear}.`
  const taskBase = {
    studentId: student.id,
    studentName: student.name,
    institutionId: student.institution.id,
    applicationId: application.id,
    requirement,
  }

  switch (interpretation.kind) {
    case 'enrolment-evidence': {
      const identified = 'Identified a request for current academic-year enrolment evidence.'
      const current = student.documents.find(
        (doc) => doc.type === 'enrolment-letter' && doc.academicYear === application.academicYear,
      )
      if (current) {
        return {
          kind: interpretation.kind,
          steps: [
            read,
            identified,
            `Found your ${current.label.toLowerCase()} for ${application.academicYear}, issued by ${current.issuer}.`,
          ],
          summary: `Attach your ${application.academicYear} enrolment letter to the correction. Your other answers stay as submitted.`,
          action: { type: 'attach-document', applicationId: application.id, doc: current },
        }
      }
      const previous = student.documents.find((doc) => doc.type === 'enrolment-letter')
      return {
        kind: interpretation.kind,
        steps: [
          read,
          identified,
          previous
            ? `Your enrolment letter is for ${previous.academicYear}, not ${application.academicYear}.`
            : 'You have no enrolment letter yet.',
        ],
        summary: `Ask ${student.institution.name} to issue an enrolment letter for ${application.academicYear}. Your college will see the request.`,
        action: {
          type: 'create-task',
          task: {
            ...taskBase,
            title: `Issue an enrolment letter for ${application.academicYear}`,
            owner: 'institution',
            deadline: application.deadline,
            fulfils: {
              type: 'enrolment-letter',
              label: 'Enrolment letter',
              academicYear: application.academicYear,
              issuer: student.institution.name,
            },
          },
        },
      }
    }
    case 'missing-document': {
      const name = docTypeLabel[interpretation.docType]
      return {
        kind: interpretation.kind,
        steps: [read, `Identified a missing ${name}.`],
        summary: `Add your ${name}, then resubmit the correction.`,
        action: {
          type: 'create-task',
          task: { ...taskBase, title: `Add your ${name}`, owner: 'student', deadline: application.deadline },
        },
      }
    }
    case 'payment-issue':
      return {
        kind: interpretation.kind,
        steps: [
          read,
          'Identified an Aadhaar-based payment problem.',
          'Linking Aadhaar in your bank account is not the same as the NPCI mapper used for the payment. Your bank updates the mapper.',
        ],
        summary: 'Visit your bank branch and ask them to update the NPCI mapper for your account.',
        source: sources.pfmsSeeding,
        action: {
          type: 'create-task',
          task: { ...taskBase, title: 'Ask your bank to update the NPCI mapper', owner: 'bank' },
        },
      }
    case 'unrecognised':
      return {
        kind: interpretation.kind,
        steps: [read, 'This does not match any notice type I recognise.'],
        summary: 'I will not guess. Tell me what the notice asks for, or contact the scheme helpdesk.',
        action: null,
      }
  }
}

/** Example notices offered for trying the notice reader. */
export const sampleNotices = [
  { label: 'Returned: enrolment evidence', text: correctionNotice },
  { label: 'Incomplete: missing document', text: 'Application incomplete: income certificate not uploaded.' },
  { label: 'Payment failed: Aadhaar', text: 'Payment failed: Aadhaar not seeded in NPCI mapper for the account.' },
  { label: 'Something else', text: 'Please attend an interview on 20 November.' },
]
