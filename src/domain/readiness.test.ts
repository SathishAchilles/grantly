import { describe, expect, it } from 'vitest'
import { ffe, hdfcEcss, pmUspCsss } from '../data/schemes'
import { freshStudent, renewalStudent } from '../test/fixtures'
import { evaluateReadiness } from './readiness'
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
    expect(byId(results, 'other-income')).toBeUndefined()
    expect(byId(results, 'fee-receipt')).toMatchObject({ result: 'missing', guidance: 'Add your fee receipt.' })
  })

  it('shows the same document passing one programme and failing another', () => {
    expect(byId(evaluateReadiness(hdfcEcss, freshStudent()), 'income-proof')?.result).toBe('satisfied')
    expect(byId(evaluateReadiness(ffe, freshStudent()), 'salaried-income')?.result).toBe('not-satisfied')
  })

  it('accepts an income certificate for FFE from a self-employed family', () => {
    const results = evaluateReadiness(ffe, freshStudent({ parentEmployment: 'self-employed' }))

    expect(byId(results, 'other-income')?.result).toBe('satisfied')
    expect(byId(results, 'salaried-income')).toBeUndefined()
  })

  it('points to the issuer when a document is from the wrong academic year', () => {
    const admission = byId(evaluateReadiness(hdfcEcss, renewalStudent()), 'admission-proof')

    expect(admission?.result).toBe('not-satisfied')
    expect(admission?.guidance).toBe(
      'Your enrolment letter is for 2025-26. Ask Lakeview Arts and Science College for one covering 2026-27.',
    )
  })

  it('accepts a current-year letter once the college issues it', () => {
    const student = renewalStudent()
    student.documents.push(enrolment2026)

    expect(byId(evaluateReadiness(hdfcEcss, student), 'admission-proof')?.result).toBe('alternative')
  })

  it('shows only the evidence for the applicant type', () => {
    expect(evaluateReadiness(pmUspCsss, renewalStudent()).map((result) => result.requirement.id)).toEqual(['previous-year-marksheet'])
    expect(evaluateReadiness(pmUspCsss, freshStudent()).map((result) => result.requirement.id)).toEqual([
      'class-12-marksheet',
      'income-certificate',
    ])
  })
})
