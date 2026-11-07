import { describe, expect, it } from 'vitest'
import { applications, correctionNotice } from '../data/cases'
import { renewalStudent } from '../test/fixtures'
import { cleanNotice, interpretNotice, NOTICE_MAX_LENGTH, planResponse, sampleNotices } from './caseworker'
import type { Application } from './types'

const renewal = applications.find((application) => application.id === 'meera-pmusp-2026') as Application

describe('interpretNotice', () => {
  it.each([
    [correctionNotice, 'enrolment-evidence'],
    ['Please upload a bonafide certificate.', 'enrolment-evidence'],
    ['Payment failed: Aadhaar not seeded in NPCI mapper.', 'payment-issue'],
    ['Please attend an interview on 20 November.', 'unrecognised'],
    ['Your application is incomplete.', 'unrecognised'],
  ])('reads "%s" as %s', (text, kind) => {
    expect(interpretNotice(text).kind).toBe(kind)
  })

  it.each([
    ['income certificate missing', 'income-certificate'],
    ['salary slips not uploaded', 'salary-slips'],
    ['marksheet missing', 'previous-year-marksheet'],
    ['incomplete: bank passbook', 'bank-passbook'],
    ['fee receipt missing', 'fee-receipt'],
  ])('identifies the missing document in "%s"', (text, docType) => {
    expect(interpretNotice(text)).toEqual({ kind: 'missing-document', docType })
  })

  it('treats every sample notice as the kind its label describes', () => {
    expect(sampleNotices.map((notice) => interpretNotice(notice.text).kind)).toEqual([
      'enrolment-evidence',
      'missing-document',
      'payment-issue',
      'unrecognised',
    ])
  })
})

describe('cleanNotice', () => {
  it('caps the length and collapses whitespace, keeping markup as plain text', () => {
    expect(cleanNotice('  <b>Hi</b>\n\n there  ')).toBe('<b>Hi</b> there')
    expect(cleanNotice('x'.repeat(NOTICE_MAX_LENGTH + 50))).toHaveLength(NOTICE_MAX_LENGTH)
  })
})

describe('planResponse', () => {
  it("creates a college task when Meera only has last year's enrolment letter", () => {
    const plan = planResponse(correctionNotice, renewalStudent(), renewal)

    expect(plan.steps[2]).toBe('Your enrolment letter is for 2025-26, not 2026-27.')
    expect(plan.action).toMatchObject({
      type: 'create-task',
      task: {
        owner: 'institution',
        title: 'Issue an enrolment letter for 2026-27',
        deadline: '2026-11-30',
        fulfils: { type: 'enrolment-letter', academicYear: '2026-27', issuer: 'Lakeview Arts and Science College' },
      },
    })
  })

  it('attaches a current-year letter when Meera already has one', () => {
    const student = renewalStudent()
    student.documents.push({ id: 'new', type: 'enrolment-letter', label: 'Enrolment letter', academicYear: '2026-27', issuer: 'Lakeview Arts and Science College', basis: 'college-confirmed' })

    const plan = planResponse(correctionNotice, student, renewal)

    expect(plan.action).toEqual({ type: 'attach-document', applicationId: renewal.id, doc: expect.objectContaining({ id: 'new' }) })
    expect(plan.summary).toMatch(/Your other answers stay as submitted/)
  })

  it('says so when there is no enrolment letter at all', () => {
    const student = renewalStudent({ documents: [] })

    expect(planResponse(correctionNotice, student, renewal).steps[2]).toBe('You have no enrolment letter yet.')
  })

  it('asks the student to add a missing document', () => {
    const plan = planResponse('Application incomplete: income certificate not uploaded.', renewalStudent(), renewal)

    expect(plan.kind).toBe('missing-document')
    expect(plan.action).toMatchObject({ type: 'create-task', task: { owner: 'student', title: 'Add your income certificate' } })
  })

  it('explains the NPCI mapper for a payment problem, with its source', () => {
    const plan = planResponse('Payment failed: Aadhaar not seeded in NPCI mapper for the account.', renewalStudent(), renewal)

    expect(plan.steps[2]).toMatch(/not the same as the NPCI mapper/)
    expect(plan.source?.title).toBe('PFMS Aadhaar seeding guide')
    expect(plan.action).toMatchObject({ type: 'create-task', task: { owner: 'bank' } })
  })

  it('does not guess at an unrecognised notice', () => {
    const plan = planResponse('Please attend an interview on 20 November.', renewalStudent(), renewal)

    expect(plan.action).toBeNull()
    expect(plan.summary).toMatch(/I will not guess/)
  })
})
