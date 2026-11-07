import { describe, expect, it } from 'vitest'
import { applications } from '@/data/cases'
import { ffe, hdfcEcss, pmUspCsss } from '@/data/schemes'
import { freshStudent, renewalStudent } from '@/test/fixtures'
import { applicantTypeFor, evaluateReadiness, summarizeReadiness } from './readiness'
import type { Doc } from './types'

const byId = (results: ReturnType<typeof evaluateReadiness>, id: string) =>
  results.find((result) => result.requirement.id === id)

const enrolment2026: Doc = {
  id: 'new',
  type: 'enrolment-letter',
  label: 'Enrolment letter',
  academicYear: '2026-27',
  issuer: 'Lakeview Arts and Science College',
  basis: 'college-confirmed',
}

describe('evaluateReadiness', () => {
  it("accepts Arjun's admission letter for HDFC ECSS when he has no paid fee receipt", () => {
    const admission = byId(evaluateReadiness(hdfcEcss, freshStudent()), 'admission-proof')

    expect(admission?.result).toBe('alternative')
    expect(admission?.doc?.type).toBe('admission-letter')
    expect(admission?.guidance).toBe('You can use your admission letter. This programme accepts it instead.')
  })

  it("rejects Arjun's income certificate for FFE and names salary slips", () => {
    const results = evaluateReadiness(ffe, freshStudent())
    const income = byId(results, 'salaried-income')

    expect(income?.result).toBe('not-satisfied')
    expect(income?.guidance).toBe('Your income certificate is not accepted here. You need salary slips.')
    expect(byId(results, 'other-income')?.result).toBe('not-applicable')
    expect(byId(results, 'fee-receipt')).toMatchObject({ result: 'missing', guidance: 'Add your fee receipt.' })
  })

  it('shows the same document passing one programme and failing another', () => {
    expect(byId(evaluateReadiness(hdfcEcss, freshStudent()), 'income-proof')?.result).toBe('satisfied')
    expect(byId(evaluateReadiness(ffe, freshStudent()), 'salaried-income')?.result).toBe('not-satisfied')
  })

  it('accepts an income certificate for FFE from a self-employed family', () => {
    const results = evaluateReadiness(ffe, freshStudent({ parentEmployment: 'self-employed' }))

    expect(byId(results, 'other-income')?.result).toBe('satisfied')
    expect(byId(results, 'salaried-income')).toMatchObject({ result: 'not-applicable', conditional: true })
  })

  it('points to the issuer when a document is from the wrong academic year', () => {
    const admission = byId(evaluateReadiness(hdfcEcss, renewalStudent(), applications), 'admission-proof')

    expect(admission?.result).toBe('not-satisfied')
    expect(admission?.guidance).toBe(
      'Your enrolment letter is for 2025-26. Ask Lakeview Arts and Science College for one covering 2026-27.',
    )
  })

  it('accepts a current-year letter once the college issues it', () => {
    const student = renewalStudent()
    student.documents.push(enrolment2026)

    expect(byId(evaluateReadiness(hdfcEcss, student, applications), 'admission-proof')?.result).toBe('alternative')
  })

  it('shows only the evidence for the applicant type', () => {
    expect(evaluateReadiness(pmUspCsss, renewalStudent(), applications).map((result) => result.requirement.id)).toEqual(
      ['previous-year-marksheet'],
    )
    expect(evaluateReadiness(pmUspCsss, freshStudent()).map((result) => result.requirement.id)).toEqual([
      'class-12-marksheet',
      'income-certificate',
    ])
  })

  it('keeps inapplicable conditional requirements visible but out of the counts', () => {
    const results = evaluateReadiness(ffe, freshStudent())

    expect(byId(results, 'other-income')).toMatchObject({ result: 'not-applicable', conditional: true })
    expect(byId(results, 'salaried-income')?.conditional).toBe(true)
    expect(byId(results, 'marksheet')?.conditional).toBe(false)
    expect(summarizeReadiness(results)).toEqual({ required: 3, ready: 1, unresolved: 0, skipped: 1 })
  })

  it('reports a document with no academic year as needing confirmation, not ready', () => {
    const student = freshStudent()
    student.documents = [{ ...enrolment2026, academicYear: undefined }]
    const admission = byId(evaluateReadiness(hdfcEcss, student), 'admission-proof')

    expect(admission?.result).toBe('needs-confirmation')
    expect(admission?.guidance).toBe(
      'The year on your enrolment letter is unclear. Confirm with Lakeview Arts and Science College that it covers 2026-27.',
    )
    expect(summarizeReadiness(evaluateReadiness(hdfcEcss, student))).toMatchObject({ unresolved: 1, ready: 0 })
  })

  it.each([
    ['a malformed year', { academicYear: '2026/27' }],
    ['a year that is not consecutive', { academicYear: '2026-29' }],
    ['a label that names a different year', { label: 'Enrolment letter 2025-26', academicYear: '2026-27' }],
  ])('treats %s as needing confirmation', (_name, override) => {
    const student = freshStudent()
    student.documents = [{ ...enrolment2026, ...override }]

    expect(byId(evaluateReadiness(hdfcEcss, student), 'admission-proof')?.result).toBe('needs-confirmation')
  })

  it('still accepts a consistent label that repeats the matching year', () => {
    const student = freshStudent()
    student.documents = [{ ...enrolment2026, label: 'Enrolment letter 2026-27' }]

    expect(byId(evaluateReadiness(hdfcEcss, student), 'admission-proof')?.result).toBe('alternative')
  })

  it('does not question the year of documents that are not year-specific', () => {
    const student = freshStudent()
    student.documents = [{ ...enrolment2026, type: 'bank-passbook', academicYear: undefined }]

    expect(byId(evaluateReadiness(hdfcEcss, student), 'bank-details')?.result).toBe('satisfied')
  })

  it('derives the applicant type per scheme from the student applications', () => {
    expect(applicantTypeFor('pm-usp-csss', 'meera', applications)).toBe('renewal')
    expect(applicantTypeFor('hdfc-ecss', 'meera', applications)).toBe('fresh')
    expect(applicantTypeFor('pm-usp-csss', 'arjun', applications)).toBe('fresh')
    expect(applicantTypeFor('pm-usp-csss', 'meera')).toBe('fresh')
  })

  it('ignores the student-level applicant type when choosing renewal evidence', () => {
    const ids = (results: ReturnType<typeof evaluateReadiness>) => results.map((result) => result.requirement.id)

    expect(ids(evaluateReadiness(pmUspCsss, renewalStudent()))).toEqual(['class-12-marksheet', 'income-certificate'])
    expect(ids(evaluateReadiness(pmUspCsss, freshStudent(), applications))).toEqual([
      'class-12-marksheet',
      'income-certificate',
    ])
  })
})
