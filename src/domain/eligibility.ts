import { isPassed } from './dates'
import type { ApplicantType, Rule, RuleOutcome, Scheme, Source, Student } from './types'

/** A rule paired with how the student fared against it. */
export interface RuleResult {
  rule: Rule
  outcome: RuleOutcome
}

/** Summary of all rule outcomes: any rule not met wins, then anything still unknown. */
export type Overall = 'meets-listed-conditions' | 'does-not-meet' | 'more-information-needed'

/** A closing date from one source, and whether it has already passed. */
export interface DeadlineOption {
  date: string
  source: Source
  passed: boolean
}

/** The closing date a student should work to: none published, one agreed date, or conflicting dates. */
export type StudentDeadline =
  | { status: 'none'; note: string }
  | { status: 'single'; option: DeadlineOption }
  | { status: 'conflict'; options: DeadlineOption[]; recommended: string | null }

/** The eligibility verdict for one student against one scheme. */
export interface SchemeEvaluation {
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
 * Works out which closing date the student should work to, flagging sources that disagree.
 *
 * @param scheme - The scheme whose published deadlines are read.
 * @param today - Today's date, as YYYY-MM-DD.
 * @returns No deadline, a single date, or a conflict with the earliest open date recommended.
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
  const open = options
    .filter((option) => !option.passed)
    .map((option) => option.date)
    .sort()
  return { status: 'conflict', options, recommended: open[0] ?? null }
}

/**
 * Checks a student against every rule that applies to them and reports the overall verdict.
 *
 * @param scheme - The scheme to evaluate.
 * @param student - The student being checked.
 * @param today - Today's date, as YYYY-MM-DD.
 * @returns Availability, each rule result, the overall verdict and the deadline.
 */
export function evaluateScheme(scheme: Scheme, student: Student, today: string): SchemeEvaluation {
  const open = scheme.openFor.includes(student.applicantType)
  const results = scheme.rules
    .filter((rule) => applies(rule.appliesTo, student.applicantType))
    .map((rule) => ({ rule, outcome: rule.evaluate(student) }))

  const outcomes = results.map((result) => result.outcome.result)
  const overall: Overall = outcomes.includes('not-met')
    ? 'does-not-meet'
    : outcomes.some((outcome) => outcome === 'need-info' || outcome === 'needs-confirmation')
      ? 'more-information-needed'
      : 'meets-listed-conditions'

  return {
    open,
    availability: open
      ? `Open for ${describeOpenFor(scheme.openFor)} in ${scheme.academicYear}.`
      : `Open for ${describeOpenFor(scheme.openFor)} in ${scheme.academicYear}, so you cannot apply as a ${student.applicantType} applicant.`,
    results,
    overall,
    deadline: studentDeadline(scheme, today),
  }
}

export { applies }
