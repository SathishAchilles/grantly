import { applies } from './eligibility'
import type { Doc, EvidenceRequirement, Scheme, Student } from './types'

/** How well the student's documents cover one requirement. */
export type ReadinessResult = 'satisfied' | 'alternative' | 'not-satisfied' | 'missing'

/** One evidence requirement with the document matched to it and what the student should do next. */
export interface RequirementReadiness {
  requirement: EvidenceRequirement
  result: ReadinessResult
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

const isCurrent = (requirement: EvidenceRequirement, academicYear: string) => (doc: Doc) =>
  !requirement.currentYearOnly || doc.academicYear === academicYear

function evaluateRequirement(requirement: EvidenceRequirement, student: Student, academicYear: string): RequirementReadiness {
  const current = isCurrent(requirement, academicYear)
  const accepted = student.documents.find((doc) => requirement.accepts.includes(doc.type) && current(doc))
  if (accepted) {
    return { requirement, result: 'satisfied', doc: accepted, guidance: `Your ${accepted.label.toLowerCase()} meets this.` }
  }

  const alternative = student.documents.find((doc) => requirement.alternatives.includes(doc.type) && current(doc))
  if (alternative) {
    return {
      requirement,
      result: 'alternative',
      doc: alternative,
      guidance: `You can use your ${alternative.label.toLowerCase()}. This programme accepts it instead.`,
    }
  }

  const outdated = find(student, [...requirement.accepts, ...requirement.alternatives])
  if (outdated) {
    return {
      requirement,
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
      result: 'not-satisfied',
      doc: rejected,
      guidance: `Your ${rejected.label.toLowerCase()} is not accepted here. You need ${needed}.`,
    }
  }

  return { requirement, result: 'missing', guidance: `Add your ${needed}.` }
}

/**
 * Checks the student's documents against each evidence requirement that applies to them.
 *
 * @param scheme - The scheme whose evidence requirements are checked.
 * @param student - The student whose documents are checked.
 * @returns One readiness entry per applicable requirement.
 */
export function evaluateReadiness(scheme: Scheme, student: Student): RequirementReadiness[] {
  return scheme.evidence
    .filter((requirement) => applies(requirement.appliesTo, student.applicantType))
    .filter((requirement) => requirement.appliesWhen?.(student) ?? true)
    .map((requirement) => evaluateRequirement(requirement, student, scheme.academicYear))
}

export { docTypeLabel }
