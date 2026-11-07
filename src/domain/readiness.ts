import { applies } from './eligibility'
import type { ApplicantType, Application, Doc, EvidenceRequirement, Scheme, Student } from './types'

/** How well the student's documents cover one requirement. */
export type ReadinessResult = 'satisfied' | 'alternative' | 'not-satisfied' | 'missing' | 'needs-confirmation'

/** A readiness result, or a marker that a conditional requirement does not apply to this student. */
export type RequirementStatus = ReadinessResult | 'not-applicable'

/** One evidence requirement with the document matched to it and what the student should do next. */
export interface RequirementReadiness {
  requirement: EvidenceRequirement
  /** "needs-confirmation" means a document's academic year is unclear. "not-applicable" is never counted. */
  result: RequirementStatus
  /** True when the requirement only applies to some students, so it is shown as "Only if ...". */
  conditional: boolean
  /** The document that was matched, or the one that is out of date or refused. */
  doc?: Doc
  /** Plain-language next step for the student. */
  guidance: string
}

/** Lower-case names for document types, used when telling the student what to add. */
const docTypeLabel: Record<Doc['type'], string> = {
  'income-certificate': 'income certificate',
  'salary-slips': 'salary slips',
  'class-12-marksheet': 'Class XII marksheet',
  'previous-year-marksheet': "previous year's marksheet",
  'enrolment-letter': 'enrolment letter',
  'admission-letter': 'admission letter',
  'fee-receipt': 'fee receipt',
  'bank-passbook': 'bank passbook',
}

const find = (student: Student, types: Doc['type'][]) => student.documents.find((doc) => types.includes(doc.type))

type YearStatus = 'current' | 'other' | 'unclear'

const yearLabel = /^(\d{4})-(\d{2})$/
const yearInText = /\b\d{4}-\d{2}\b/

const isWellFormedYear = (year: string | undefined): year is string => {
  const match = year === undefined ? null : yearLabel.exec(year)
  return match !== null && Number(match[2]) === (Number(match[1]) + 1) % 100
}

/** Compares a document's academic year with the one the scheme needs, flagging labels that are missing or contradict each other. */
function yearStatus(doc: Doc, academicYear: string): YearStatus {
  const named = yearInText.exec(doc.label)?.[0]
  if (!isWellFormedYear(doc.academicYear) || (named !== undefined && named !== doc.academicYear)) return 'unclear'
  return doc.academicYear === academicYear ? 'current' : 'other'
}

const statusOf = (requirement: EvidenceRequirement, academicYear: string) => (doc: Doc) =>
  requirement.currentYearOnly ? yearStatus(doc, academicYear) : 'current'

function evaluateRequirement(
  requirement: EvidenceRequirement,
  student: Student,
  academicYear: string,
): RequirementReadiness {
  const conditional = requirement.appliesWhen !== undefined
  const status = statusOf(requirement, academicYear)
  const accepted = student.documents.find((doc) => requirement.accepts.includes(doc.type) && status(doc) === 'current')
  if (accepted) {
    return {
      requirement,
      conditional,
      result: 'satisfied',
      doc: accepted,
      guidance: `Your ${accepted.label.toLowerCase()} meets this.`,
    }
  }

  const alternative = student.documents.find(
    (doc) => requirement.alternatives.includes(doc.type) && status(doc) === 'current',
  )
  if (alternative) {
    return {
      requirement,
      conditional,
      result: 'alternative',
      doc: alternative,
      guidance: `You can use your ${alternative.label.toLowerCase()}. This programme accepts it instead.`,
    }
  }

  const candidates = [...requirement.accepts, ...requirement.alternatives]
  const unclear = student.documents.find((doc) => candidates.includes(doc.type) && status(doc) === 'unclear')
  if (unclear) {
    return {
      requirement,
      conditional,
      result: 'needs-confirmation',
      doc: unclear,
      guidance: `The year on your ${unclear.label.toLowerCase()} is unclear. Confirm with ${unclear.issuer} that it covers ${academicYear}.`,
    }
  }

  const outdated = find(student, candidates)
  if (outdated) {
    return {
      requirement,
      conditional,
      result: 'not-satisfied',
      doc: outdated,
      guidance: `Your ${outdated.label.toLowerCase()} is for ${outdated.academicYear}. Ask ${outdated.issuer} for one covering ${academicYear}.`,
    }
  }

  const needed = requirement.accepts.map((type) => docTypeLabel[type]).join(' or ')
  const rejected = find(student, requirement.rejects)
  if (rejected) {
    return {
      requirement,
      conditional,
      result: 'not-satisfied',
      doc: rejected,
      guidance: `Your ${rejected.label.toLowerCase()} is not accepted here. You need ${needed}.`,
    }
  }

  return { requirement, conditional, result: 'missing', guidance: `Add your ${needed}.` }
}

/**
 * Works out whether the student is a fresh or renewal applicant to one scheme.
 *
 * @param schemeId - The scheme being checked.
 * @param studentId - The student being checked.
 * @param applications - Every application on record. When omitted the student counts as fresh.
 * @returns "renewal" only when the student has a renewal application to this scheme, otherwise "fresh".
 */
export function applicantTypeFor(
  schemeId: string,
  studentId: string,
  applications: readonly Application[] = [],
): ApplicantType {
  const renewing = applications.some(
    (application) =>
      application.schemeId === schemeId &&
      application.studentId === studentId &&
      application.applicantType === 'renewal',
  )
  return renewing ? 'renewal' : 'fresh'
}

/**
 * Checks the student's documents against every evidence requirement of the scheme for their applicant type.
 * Conditional requirements that do not apply are kept in the list, marked "not-applicable", so they can be shown.
 *
 * @param scheme - The scheme whose evidence requirements are checked.
 * @param student - The student whose documents are checked.
 * @param applications - Every application on record, used to tell a renewal from a fresh application to this scheme.
 * @returns One readiness entry per requirement for the applicant type.
 */
export function evaluateReadiness(
  scheme: Scheme,
  student: Student,
  applications: readonly Application[] = [],
): RequirementReadiness[] {
  const applicantType = applicantTypeFor(scheme.id, student.id, applications)
  return scheme.evidence
    .filter((requirement) => applies(requirement.appliesTo, applicantType))
    .map((requirement): RequirementReadiness => {
      if (requirement.appliesWhen?.(student) === false) {
        return {
          requirement,
          conditional: true,
          result: 'not-applicable',
          guidance: 'This does not apply to you, so it is not counted.',
        }
      }
      return evaluateRequirement(requirement, student, scheme.academicYear)
    })
}

/** Totals for one scheme's readiness list. */
export interface ReadinessSummary {
  /** Requirements that apply to the student. Conditional ones that do not apply are left out. */
  required: number
  ready: number
  /** Requirements whose document year needs confirming. */
  unresolved: number
  /** Conditional requirements that do not apply and are not counted. */
  skipped: number
}

/**
 * Counts how many applicable requirements are ready, unresolved or skipped.
 *
 * @param results - The output of evaluateReadiness.
 * @returns The counts the readiness page reports.
 */
export function summarizeReadiness(results: RequirementReadiness[]): ReadinessSummary {
  const counted = results.filter(({ result }) => result !== 'not-applicable')
  return {
    required: counted.length,
    ready: counted.filter(({ result }) => result === 'satisfied' || result === 'alternative').length,
    unresolved: counted.filter(({ result }) => result === 'needs-confirmation').length,
    skipped: results.length - counted.length,
  }
}

export { docTypeLabel }
