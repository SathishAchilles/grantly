import { isPassed } from './dates'
import type { ApplicantType, Rule, RuleOutcome, Scheme, Source, Student } from './types'

export interface RuleResult {
  rule: Rule
  outcome: RuleOutcome
}

export type Overall = 'meets-listed-conditions' | 'does-not-meet' | 'more-information-needed'

export interface DeadlineOption {
  date: string
  source: Source
  passed: boolean
}

export type StudentDeadline =
  | { status: 'none'; note: string }
  | { status: 'single'; option: DeadlineOption }
  | { status: 'conflict'; options: DeadlineOption[]; recommended: string | null }

export interface SchemeEvaluation {
  open: boolean
  availability: string
  results: RuleResult[]
  overall: Overall
  deadline: StudentDeadline
}

const applies = (appliesTo: ApplicantType | 'both', applicantType: ApplicantType) =>
  appliesTo === 'both' || appliesTo === applicantType

const describeOpenFor = (openFor: ApplicantType[]) =>
  openFor.length === 2 ? 'fresh and renewal applications' : `${openFor[0]} applications only`

export function studentDeadline(scheme: Scheme, today: string): StudentDeadline {
  const options: DeadlineOption[] = scheme.deadlines.flatMap((set) =>
    set.entries
      .filter((entry) => entry.kind === 'student')
      .map((entry) => ({ date: entry.date, source: set.source, passed: isPassed(entry.date, today) })),
  )
  const [first] = options
  if (!first) return { status: 'none', note: scheme.noDeadlineNote ?? 'No closing date has been published.' }
  if (new Set(options.map((option) => option.date)).size === 1) return { status: 'single', option: first }
  const open = options.filter((option) => !option.passed).map((option) => option.date).sort()
  return { status: 'conflict', options, recommended: open[0] ?? null }
}

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
