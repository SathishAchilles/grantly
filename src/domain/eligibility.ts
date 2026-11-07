import { isPassed } from './dates'
import type { Application, ApplicantType, Rule, RuleOutcome, Scheme, Source, Student } from './types'

/** A rule paired with how the student fared against it. */
export interface RuleResult {
  rule: Rule
  outcome: RuleOutcome
}

/** Summary of all rule outcomes: any rule not met wins, then anything unknown or no applicable rules at all. */
export type Overall = 'meets-listed-conditions' | 'does-not-meet' | 'more-information-needed'

/** A closing date from one source, and whether it has already passed. */
export interface DeadlineOption {
  date: string
  source: Source
  passed: boolean
}

/** The student's closing date: none published, one agreed date, or conflicting dates left unresolved. */
export type StudentDeadline =
  | { status: 'none'; note: string }
  | { status: 'single'; option: DeadlineOption }
  | { status: 'conflict'; options: DeadlineOption[] }

/** The eligibility verdict for one student against one scheme. */
export interface SchemeEvaluation {
  /** The applicant type used for this scheme, derived from the student's applications to it. */
  applicantType: ApplicantType
  /** Whether the scheme accepts the student's applicant type. */
  open: boolean
  availability: string
  results: RuleResult[]
  overall: Overall
  deadline: StudentDeadline
}

/**
 * Whether a rule or requirement aimed at one applicant type covers the given applicant.
 *
 * @param appliesTo - The applicant type the rule targets, or "both".
 * @param applicantType - The applicant type of the student.
 * @returns True when the rule covers the applicant.
 */
const applies = (appliesTo: ApplicantType | 'both', applicantType: ApplicantType) =>
  appliesTo === 'both' || appliesTo === applicantType

const describeOpenFor = (openFor: ApplicantType[]) =>
  openFor.length === 2 ? 'fresh and renewal applications' : `${openFor[0]} applications only`

/**
 * Derives the applicant type for one scheme: renewal only when the student already has a renewal application for it.
 *
 * @param scheme - The scheme being evaluated.
 * @param student - The student applying.
 * @param applications - Applications on record, of any student or scheme.
 * @returns "renewal" when the student has a renewal application for this scheme, otherwise "fresh".
 */
export function applicantTypeFor(
  scheme: Scheme,
  student: Student,
  applications: readonly Application[],
): ApplicantType {
  const renewing = applications.some(
    (application) =>
      application.studentId === student.id &&
      application.schemeId === scheme.id &&
      application.applicantType === 'renewal',
  )
  return renewing ? 'renewal' : 'fresh'
}

/**
 * Collects the student closing dates every source publishes, without choosing between them.
 *
 * @param scheme - The scheme whose published deadlines are read.
 * @param today - Today's date, as YYYY-MM-DD.
 * @returns No deadline, a single date, or a conflict listing every dated option with its source.
 */
export function studentDeadline(scheme: Scheme, today: string): StudentDeadline {
  const options: DeadlineOption[] = scheme.deadlines.flatMap((set) =>
    set.entries
      .filter((entry) => entry.kind === 'student')
      .map((entry) => ({ date: entry.date, source: set.source, passed: isPassed(entry.date, today) })),
  )
  const [first] = options
  if (!first) return { status: 'none', note: scheme.noDeadlineNote ?? 'No closing date has been published.' }
  if (new Set(options.map((option) => option.date)).size === 1) return { status: 'single', option: first }
  return { status: 'conflict', options }
}

/**
 * Checks a student against every rule that applies to them and reports the overall verdict.
 *
 * @param scheme - The scheme to evaluate.
 * @param student - The student being checked.
 * @param today - Today's date, as YYYY-MM-DD.
 * @param applications - Applications on record, used to decide whether the student is renewing this scheme.
 * @returns Availability, each rule result, the overall verdict and the deadline.
 */
export function evaluateScheme(
  scheme: Scheme,
  student: Student,
  today: string,
  applications: readonly Application[],
): SchemeEvaluation {
  const applicantType = applicantTypeFor(scheme, student, applications)
  const open = scheme.openFor.includes(applicantType)
  const results = scheme.rules
    .filter((rule) => applies(rule.appliesTo, applicantType))
    .map((rule) => ({ rule, outcome: rule.evaluate(student) }))

  const outcomes = results.map((result) => result.outcome.result)
  const overall: Overall = outcomes.includes('not-met')
    ? 'does-not-meet'
    : outcomes.length === 0 || outcomes.some((outcome) => outcome === 'need-info' || outcome === 'needs-confirmation')
      ? 'more-information-needed'
      : 'meets-listed-conditions'

  return {
    applicantType,
    open,
    availability: open
      ? `Open for ${describeOpenFor(scheme.openFor)} in ${scheme.academicYear}.`
      : `Open for ${describeOpenFor(scheme.openFor)} in ${scheme.academicYear}, so you cannot apply as a ${applicantType} applicant.`,
    results,
    overall,
    deadline: studentDeadline(scheme, today),
  }
}

export { applies }
