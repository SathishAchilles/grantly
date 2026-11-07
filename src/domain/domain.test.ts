import { describe, expect, it } from 'vitest'
import { ffe, hdfcEcss, nmmss, pmUspCsss } from '@/data/schemes'
import { freshStudent, renewalStudent, required, TODAY } from '@/test/fixtures'
import { byDeadline, formatDate, isPassed, todayIso } from './dates'
import { applicantTypeFor, evaluateScheme, studentDeadline } from './eligibility'
import { applications, tasks } from '@/data/cases'
import { fundingSummary, supportKindLabel, taskDestination } from './funding'
import type { Application, Scheme } from './types'

const outcome = (scheme: Scheme, student: ReturnType<typeof freshStudent>, ruleId: string) =>
  evaluateScheme(scheme, student, TODAY, applications).results.find((result) => result.rule.id === ruleId)?.outcome

describe('dates', () => {
  it("gives today's date in India", () => {
    expect(todayIso(new Date('2026-11-06T20:00:00Z'))).toBe('2026-11-07')
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formats dates for display and compares them', () => {
    expect(formatDate('2026-11-30')).toBe('30 Nov 2026')
    expect(isPassed('2026-10-31', TODAY)).toBe(true)
    expect(isPassed('2026-11-30', TODAY)).toBe(false)
  })

  it('sorts by deadline with undated items last', () => {
    const items = [
      { id: 'none' },
      { id: 'late', deadline: '2026-12-15' },
      { id: 'soon', deadline: '2026-11-20' },
      { id: 'also-none' },
    ]
    expect([...items].sort(byDeadline).map((item) => item.id)).toEqual(['soon', 'late', 'none', 'also-none'])
  })
})

describe('taskDestination', () => {
  const task = (id: string) =>
    required(
      tasks.find((candidate) => candidate.id === id),
      id,
    )
  const applicationFor = (id: string) => applications.find((candidate) => candidate.id === task(id).applicationId)

  it('sends a notice task to applications', () => {
    expect(taskDestination(task('task-meera-correction'), applicationFor('task-meera-correction')).to).toBe(
      '/applications',
    )
  })

  it("sends a document task to readiness for the application's scheme", () => {
    const application = applicationFor('task-arjun-payslips')
    expect(taskDestination(task('task-arjun-payslips'), application).to).toBe(
      `/readiness?scheme=${application?.schemeId}`,
    )
  })

  it('sends a college task to the college desk and a provider or unlinked task to applications', () => {
    expect(taskDestination(task('task-rahul-bonafide'), undefined).to).toBe('/college')
    expect(taskDestination({ ...task('task-arjun-payslips'), owner: 'provider' }, undefined).to).toBe('/applications')
    expect(taskDestination(task('task-arjun-payslips'), undefined).to).toBe('/applications')
  })
})

describe('fundingSummary', () => {
  it("counts only confirmed support: Meera's gap is ₹30,000 with ₹12,000 pending", () => {
    const summary = fundingSummary(renewalStudent())

    expect(summary.gap).toBe(30_000)
    expect(summary.pendingTotal).toBe(12_000)
    expect(summary.confirmed).toEqual([])
    expect(summary.pending.map((item) => item.label)).toEqual(['PM-USP CSSS renewal, 2026-27'])
  })

  it('reduces the gap with confirmed support, but never below zero', () => {
    const student = renewalStudent({
      support: [
        { id: 'a', label: 'Fee concession', amount: 20_000, kind: 'fee-reduction', state: 'confirmed' },
        { id: 'b', label: 'Pending award', amount: 15_000, kind: 'cash', state: 'pending' },
      ],
      costs: 90_000,
    })
    expect(fundingSummary(student).gap).toBe(40_000)
    expect(fundingSummary(renewalStudent({ costs: 10_000 })).gap).toBe(0)
  })

  it('describes what each kind of support does', () => {
    expect(supportKindLabel['fee-reduction']).toMatch(/not cash/)
    expect(supportKindLabel.cash).toBe('Will be paid to your bank account')
    expect(supportKindLabel.reimbursement).toMatch(/^Will repay.*already paid/)
  })

  it('never words how money is paid in the past tense', () => {
    for (const label of Object.values(supportKindLabel)) expect(label).not.toMatch(/^(Paid|Repaid)\b/)
  })

  it('keeps potential and pending support out of the gap however large it is', () => {
    const student = renewalStudent({
      support: [{ id: 'p', label: 'Potential award', amount: 1_000_000, kind: 'cash', state: 'pending' }],
    })
    const summary = fundingSummary(student)

    expect(summary.gap).toBe(fundingSummary(renewalStudent({ support: [] })).gap)
    expect(summary.confirmedTotal).toBe(0)
    expect(summary.pendingTotal).toBe(1_000_000)
  })
})

describe('evaluateScheme: PM-USP CSSS', () => {
  it('does not offer a renewal-only scheme to a fresh applicant', () => {
    const evaluation = evaluateScheme(pmUspCsss, freshStudent(), TODAY, applications)

    expect(evaluation.open).toBe(false)
    expect(evaluation.availability).toBe(
      'Open for renewal applications only in 2026-27, so you cannot apply as a fresh applicant.',
    )
  })

  it('treats 84% as a percentage, not a percentile, and asks for evidence', () => {
    const result = outcome(pmUspCsss, freshStudent(), 'percentile')

    expect(result?.result).toBe('need-info')
    expect(result?.reason).toMatch(/84% is a marks percentage, not a percentile/)
    expect(result?.ask).toMatch(/CBSE, Science, 2026/)
  })

  it('checks a known percentile', () => {
    expect(
      outcome(pmUspCsss, freshStudent({ class12: { ...freshStudent().class12, percentile: 85 } }), 'percentile')
        ?.result,
    ).toBe('met')
    expect(
      outcome(pmUspCsss, freshStudent({ class12: { ...freshStudent().class12, percentile: 80 } }), 'percentile')
        ?.result,
    ).toBe('not-met')
  })

  it.each([
    ['regular-degree', { regularMode: false }],
    ['regular-degree', { level: 'school' as const }],
    ['no-gap-year', { gapYearAfterClass12: true }],
    ['recognised-institution', { institution: { ...freshStudent().institution, recognised: false } }],
    ['income', { familyIncome: 450_001 }],
    ['no-other-scheme', { otherSchemesAvailed: ['State scholarship'] }],
  ])('fails %s when the condition is not met', (ruleId, overrides) => {
    expect(outcome(pmUspCsss, freshStudent(overrides), ruleId)?.result).toBe('not-met')
  })

  it('meets the fresh conditions it can check for Arjun, so more information is needed overall', () => {
    const evaluation = evaluateScheme(pmUspCsss, freshStudent(), TODAY, applications)

    for (const id of ['regular-degree', 'no-gap-year', 'recognised-institution', 'income', 'no-other-scheme']) {
      expect(outcome(pmUspCsss, freshStudent(), id)?.result).toBe('met')
    }
    expect(evaluation.overall).toBe('more-information-needed')
  })

  it("meets Meera's renewal conditions of 50% marks and 75% attendance", () => {
    expect(outcome(pmUspCsss, renewalStudent(), 'renewal-marks')).toEqual({ result: 'met', reason: '68% in 2025-26.' })
    expect(outcome(pmUspCsss, renewalStudent(), 'renewal-attendance')?.result).toBe('met')
    expect(outcome(pmUspCsss, renewalStudent(), 'attendance-evidence')?.result).toBe('needs-confirmation')
    expect(outcome(pmUspCsss, renewalStudent(), 'percentile')).toBeUndefined()
  })

  it('fails or asks about renewal results when they are low or missing', () => {
    const low = renewalStudent({ latestResults: { academicYear: '2025-26', marksPercent: 49, attendancePercent: 74 } })
    expect(outcome(pmUspCsss, low, 'renewal-marks')?.result).toBe('not-met')
    expect(outcome(pmUspCsss, low, 'renewal-attendance')?.result).toBe('not-met')
    expect(evaluateScheme(pmUspCsss, low, TODAY, applications).overall).toBe('does-not-meet')

    const missing = renewalStudent({ latestResults: undefined })
    expect(outcome(pmUspCsss, missing, 'renewal-marks')?.result).toBe('need-info')
    expect(outcome(pmUspCsss, missing, 'renewal-attendance')?.ask).toMatch(/attendance record/)
  })

  it('keeps the two NSP renewal deadlines as an unresolved conflict with no recommendation', () => {
    const deadline = studentDeadline(pmUspCsss, TODAY)

    expect(deadline).toEqual({ status: 'conflict', options: expect.any(Array) })
    expect(
      deadline.status === 'conflict' &&
        deadline.options.map((option) => [option.date, option.passed, option.source.title]),
    ).toEqual([
      ['2026-10-31', true, 'NSP Students page announcement'],
      ['2026-11-30', false, 'NSP scheme catalogue'],
    ])
    expect(deadline).not.toHaveProperty('recommended')
  })

  it('still reports the conflict once every date has passed', () => {
    const deadline = studentDeadline(pmUspCsss, '2026-12-01')
    expect(deadline.status === 'conflict' && deadline.options.every((option) => option.passed)).toBe(true)
  })

  it('gives amounts by level and year', () => {
    expect(pmUspCsss.amountFor(renewalStudent()).value).toBe(12_000)
    expect(pmUspCsss.amountFor(freshStudent({ studyYear: 4 })).value).toBe(20_000)
    expect(pmUspCsss.amountFor(freshStudent({ level: 'pg-general' })).value).toBe(20_000)
    expect(pmUspCsss.amountFor(freshStudent({ level: 'pg-professional' })).basis).toBe('a year at postgraduate level')
  })
})

describe('evaluateScheme: other schemes', () => {
  it('HDFC ECSS: meets all listed conditions for Arjun, with one published deadline', () => {
    const evaluation = evaluateScheme(hdfcEcss, freshStudent(), TODAY, applications)

    expect(evaluation.open).toBe(true)
    expect(evaluation.availability).toBe('Open for fresh and renewal applications in 2026-27.')
    expect(evaluation.overall).toBe('meets-listed-conditions')
    expect(evaluation.deadline).toMatchObject({ status: 'single', option: { date: '2026-12-15', passed: false } })
    expect(hdfcEcss.amountFor(freshStudent()).value).toBe(50_000)
  })

  it('HDFC ECSS: uses the latest results when present, and fails low marks or high income', () => {
    expect(outcome(hdfcEcss, renewalStudent(), 'marks')?.reason).toBe('68% in your previous exam.')
    expect(
      outcome(hdfcEcss, freshStudent({ class12: { ...freshStudent().class12, percent: 54 } }), 'marks')?.result,
    ).toBe('not-met')
    expect(outcome(hdfcEcss, freshStudent({ familyIncome: 250_001 }), 'income')?.result).toBe('not-met')
    expect(outcome(hdfcEcss, freshStudent(), 'crisis')?.reason).toMatch(/not required/)
  })

  it('FFE: course, year, income and rank checks, with no published deadline or amount', () => {
    const evaluation = evaluateScheme(ffe, freshStudent(), TODAY, applications)

    expect(evaluation.overall).toBe('more-information-needed')
    expect(outcome(ffe, freshStudent(), 'rank')?.result).toBe('needs-confirmation')
    expect(outcome(ffe, freshStudent({ course: 'B.Sc. Physics' }), 'course')?.result).toBe('not-met')
    expect(
      outcome(ffe, freshStudent({ class12: { ...freshStudent().class12, year: 2024 } }), 'class-12-year')?.result,
    ).toBe('not-met')
    expect(outcome(ffe, freshStudent({ familyIncome: 400_000 }), 'income')?.result).toBe('not-met')
    expect(evaluation.deadline).toEqual({
      status: 'none',
      note: 'Applications opened on 1 Aug 2026. FFE has not published a closing date.',
    })
    expect(ffe.amountFor(freshStudent()).value).toBeNull()
    const renewingFfe = [
      {
        ...required(applications[0], 'application'),
        studentId: 'meera',
        schemeId: 'ffe',
        applicantType: 'renewal' as const,
      },
    ]
    expect(evaluateScheme(ffe, renewalStudent(), TODAY, renewingFfe).open).toBe(false)
  })

  it('NMMSS: only school students in Class IX meet the fresh rule', () => {
    expect(evaluateScheme(nmmss, freshStudent(), TODAY, applications).overall).toBe('does-not-meet')
    expect(outcome(nmmss, freshStudent({ schoolClass: 9 }), 'class-9')?.result).toBe('met')
  })

  it('NMMSS: a second-year B.Sc. student is never a positive match, fresh or renewing', () => {
    const meeraEvaluation = evaluateScheme(nmmss, renewalStudent(), TODAY, applications)
    expect(meeraEvaluation.overall).toBe('does-not-meet')
    expect(outcome(nmmss, renewalStudent(), 'school-student')?.result).toBe('not-met')
    const renewing = [{ ...required(applications[0], 'application'), studentId: 'meera', schemeId: 'nmmss' }]
    expect(evaluateScheme(nmmss, renewalStudent(), TODAY, renewing).overall).toBe('does-not-meet')
  })

  it('NMMSS: school students are checked by class, and a missing class asks for information', () => {
    const school = { level: 'school' as const }
    expect(outcome(nmmss, freshStudent({ ...school, schoolClass: 11 }), 'school-student')?.result).toBe('met')
    expect(outcome(nmmss, freshStudent({ ...school, schoolClass: 8 }), 'school-student')?.result).toBe('not-met')
    expect(outcome(nmmss, freshStudent({ ...school, schoolClass: 13 }), 'school-student')?.result).toBe('not-met')
    const missing = evaluateScheme(nmmss, freshStudent({ ...school, schoolClass: undefined }), TODAY, applications)
    expect(missing.results.find((result) => result.rule.id === 'school-student')?.outcome.ask).toBe(
      'Which class are you in?',
    )
    expect(missing.overall).toBe('does-not-meet')
  })

  it('never reports a positive verdict when no rule applies', () => {
    const noRules: Scheme = { ...hdfcEcss, rules: [] }
    const evaluation = evaluateScheme(noRules, freshStudent(), TODAY, applications)
    expect(evaluation.results).toEqual([])
    expect(evaluation.overall).toBe('more-information-needed')
    const onlyRenewal: Scheme = {
      ...hdfcEcss,
      rules: hdfcEcss.rules.map((rule) => ({ ...rule, appliesTo: 'renewal' })),
    }
    expect(evaluateScheme(onlyRenewal, freshStudent(), TODAY, applications).overall).toBe('more-information-needed')
  })

  it('a known mismatch outranks unknowns', () => {
    const mixed = evaluateScheme(ffe, freshStudent({ course: 'B.Sc. Physics' }), TODAY, applications)
    expect(mixed.overall).toBe('does-not-meet')
  })

  it('uses a default note when a scheme has no deadlines and no note', () => {
    const scheme = { ...ffe, noDeadlineNote: undefined }
    expect(studentDeadline(scheme, TODAY)).toEqual({ status: 'none', note: 'No closing date has been published.' })
  })
})

describe('applicant type per scheme', () => {
  const renewalFor = (schemeId: string, studentId: string): Application => ({
    ...required(applications[0], 'application'),
    schemeId,
    studentId,
    applicantType: 'renewal',
  })

  it('is renewal only for the scheme the student is renewing', () => {
    const meera = renewalStudent()
    expect(applicantTypeFor(pmUspCsss, meera, applications)).toBe('renewal')
    expect(applicantTypeFor(hdfcEcss, meera, applications)).toBe('fresh')
    expect(applicantTypeFor(ffe, meera, applications)).toBe('fresh')
  })

  it('ignores other students and fresh applications', () => {
    expect(applicantTypeFor(pmUspCsss, freshStudent(), applications)).toBe('fresh')
    expect(applicantTypeFor(hdfcEcss, freshStudent(), [renewalFor('hdfc-ecss', 'someone-else')])).toBe('fresh')
    expect(applicantTypeFor(hdfcEcss, freshStudent(), [])).toBe('fresh')
  })

  it('renewing PM-USP does not make HDFC or FFE evaluate as renewal', () => {
    const meera = renewalStudent()
    expect(evaluateScheme(pmUspCsss, meera, TODAY, applications).applicantType).toBe('renewal')
    const hdfc = evaluateScheme(hdfcEcss, meera, TODAY, applications)
    expect(hdfc.applicantType).toBe('fresh')
    expect(hdfc.results.every((result) => ['fresh', 'both'].includes(result.rule.appliesTo))).toBe(true)
    const foundation = evaluateScheme(ffe, meera, TODAY, applications)
    expect(foundation.applicantType).toBe('fresh')
    expect(foundation.open).toBe(true)
  })

  it('opens renewal-only schemes and words availability by the derived type', () => {
    const arjun = freshStudent()
    expect(evaluateScheme(pmUspCsss, arjun, TODAY, applications).availability).toMatch(/cannot apply as a fresh/)
    const renewing = [renewalFor('pm-usp-csss', arjun.id)]
    expect(evaluateScheme(pmUspCsss, arjun, TODAY, renewing).open).toBe(true)
  })
})
