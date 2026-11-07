import { describe, expect, it } from 'vitest'
import { applications, tasks } from '@/data/cases'
import { mailbox, type Email } from '@/data/emails'
import { arjun, meera } from '@/data/people'
import { fundingSummary } from './funding'
import { parseAmount, parseDate, readEmail } from './email'
import type { Application } from './types'
import { freshStudent, renewalStudent } from '@/test/fixtures'

const email = (overrides: Partial<Email>): Email => ({
  id: 'test',
  studentId: 'meera',
  from: 'test@example.org',
  subject: '',
  receivedOn: '2026-11-07',
  body: '',
  ...overrides,
})

const meeraReads = (overrides: Partial<Email>, apps: Application[] = applications) =>
  readEmail(email(overrides), renewalStudent(), apps, tasks)

describe('mailbox', () => {
  it('uses only fictional example.org senders', () => {
    expect(mailbox.every((message) => message.from.endsWith('example.org'))).toBe(true)
  })

  it("leaves Arjun's starting gap at ₹80,000, since the waiver is pending", () => {
    expect(fundingSummary(arjun).gap).toBe(80_000)
    expect(arjun.support.map((item) => item.state)).toEqual(['pending'])
  })

  it('gives every mailbox email its expected outcome', () => {
    const outcome = (message: Email) =>
      readEmail(message, message.studentId === 'meera' ? meera : arjun, applications, tasks).kind
    expect(Object.fromEntries(mailbox.map((message) => [message.id, outcome(message)]))).toEqual({
      'meera-nsp-returned': 'up-to-date',
      'meera-letter-ready': 'update',
      'meera-campus-fest': 'ignored',
      'arjun-ecss-received': 'update',
      'arjun-ecss-interview': 'update',
      'arjun-fee-waiver': 'update',
      'arjun-prize': 'suspicious',
    })
  })
})

describe('parsers', () => {
  it('reads rupee amounts written with ₹ or Rs', () => {
    expect(parseAmount('credited ₹12,000 today')).toBe(12_000)
    expect(parseAmount('Rs. 20,000 approved')).toBe(20_000)
    expect(parseAmount('no money here')).toBeNull()
  })

  it('reads dates like 20 Nov 2026 and 5 January 2027', () => {
    expect(parseDate('interview on 20 Nov 2026')).toBe('2026-11-20')
    expect(parseDate('on 5 January 2027')).toBe('2027-01-05')
    expect(parseDate('next week')).toBeNull()
  })
})

describe('readEmail rules', () => {
  it('1: flags a fee demanded to release a scholarship as a likely scam', () => {
    const outcome = meeraReads({ subject: 'You won!', body: 'Pay ₹499 processing fee to claim your scholarship.' })
    expect(outcome).toMatchObject({ kind: 'suspicious' })
    expect(outcome.summary).toMatch(/likely scam/)
  })

  it('2: ignores email that is not about scholarships', () => {
    expect(meeraReads({ subject: 'Library hours', body: 'Open late on Friday.' })).toMatchObject({ kind: 'ignored', summary: 'Not about your scholarships.' })
  })

  it('3: confirms a pending fee waiver of the same amount', () => {
    const outcome = readEmail(email({ subject: 'Fee waiver of ₹20,000 approved' }), freshStudent(), applications, tasks)
    expect(outcome).toMatchObject({ kind: 'update', changes: [{ type: 'support-confirmed', supportId: 'arjun-fee-waiver' }] })
  })

  it('3: does not confirm a waiver with no matching pending amount', () => {
    expect(readEmail(email({ subject: 'Fee waiver of ₹5,000 approved' }), freshStudent(), applications, tasks).kind).toBe('ignored')
  })

  it('4: records a credited payment and confirms the matching pending support', () => {
    const outcome = meeraReads({ subject: 'PM-USP CSSS 2026-27', body: '₹12,000 has been credited to your account.' })
    expect(outcome).toMatchObject({
      kind: 'update',
      changes: [
        { type: 'payment', applicationId: 'meera-pmusp-2026', label: 'Received ₹12,000' },
        { type: 'support-confirmed', supportId: 'meera-pmusp-renewal' },
      ],
    })
  })

  it('4: records a credited payment without touching support when no amount matches', () => {
    const outcome = meeraReads({ subject: 'PM-USP arrears', body: '₹3,000 credited.' })
    expect(outcome).toMatchObject({ kind: 'update', changes: [{ type: 'payment', label: 'Received ₹3,000' }] })
    expect(outcome.kind === 'update' && outcome.changes).toHaveLength(1)
  })

  it('4: reports a payment already shown as up to date', () => {
    const apps = applications.map((application) =>
      application.id === 'meera-pmusp-2026'
        ? { ...application, tracks: { ...application.tracks, payment: { label: 'Received ₹12,000', basis: 'evidence' as const, date: '2026-11-07' } } }
        : application,
    )
    expect(meeraReads({ subject: 'PM-USP', body: '₹12,000 credited.' }, apps).kind).toBe('up-to-date')
  })

  it('5: treats an initiated payment as initiated only, with or without an amount', () => {
    const withAmount = meeraReads({ subject: 'PM-USP CSSS', body: 'Payment initiated for ₹12,000.' })
    expect(withAmount).toMatchObject({ kind: 'update', changes: [{ type: 'payment', label: 'Payment initiated ₹12,000' }] })
    expect(withAmount.summary).toMatch(/counts once it is received/)
    expect(meeraReads({ subject: 'PM-USP CSSS', body: 'Payment initiated.' })).toMatchObject({ changes: [{ label: 'Payment initiated' }] })
  })

  it('6: marks an application submitted, or up to date if it already is', () => {
    const arjunReads = (apps: Application[]) =>
      readEmail(email({ subject: 'HDFC ECSS: application received' }), freshStudent(), apps, tasks)
    expect(arjunReads(applications)).toMatchObject({
      kind: 'update',
      changes: [{ type: 'application-status', applicationId: 'arjun-hdfc-2026', label: 'Submitted', owner: 'provider' }],
    })
    const submitted = applications.map((application) =>
      application.id === 'arjun-hdfc-2026'
        ? { ...application, tracks: { application: { label: 'Submitted', basis: 'evidence' as const, date: '2026-11-07' } } }
        : application,
    )
    expect(arjunReads(submitted).kind).toBe('up-to-date')
  })

  it('7: adds an interview task with the date from the email', () => {
    const outcome = readEmail(email({ subject: 'HDFC ECSS: shortlisted for interview on 20 Nov 2026' }), freshStudent(), applications, tasks)
    expect(outcome).toMatchObject({
      kind: 'update',
      changes: [{ type: 'task', task: { title: 'Attend the HDFC Parivartan ECSS interview', owner: 'student', deadline: '2026-11-20', applicationId: 'arjun-hdfc-2026' } }],
    })
  })

  it('8: adds the issued letter as a document when no college task is open', () => {
    const outcome = meeraReads({ subject: 'Enrolment letter issued', body: 'For your PM-USP CSSS renewal.' })
    expect(outcome).toMatchObject({
      kind: 'update',
      changes: [{ type: 'add-document', doc: { type: 'enrolment-letter', academicYear: '2026-27', issuer: 'Lakeview Arts and Science College' } }],
    })
  })

  it('8: completes the open college task instead, when there is one', () => {
    const open = [
      ...tasks,
      { ...tasks[0], id: 'task-letter', status: 'requested' as const, owner: 'institution' as const, fulfils: { type: 'enrolment-letter' as const, label: 'Enrolment letter', academicYear: '2026-27', issuer: 'Lakeview' } },
    ] as typeof tasks
    const outcome = readEmail(email({ subject: 'Your enrolment letter is ready', body: 'PM-USP CSSS renewal.' }), renewalStudent(), applications, open)
    expect(outcome).toMatchObject({ kind: 'update', changes: [{ type: 'complete-task', taskId: 'task-letter' }] })
  })

  it('9: recognises a correction request the application already shows', () => {
    expect(meeraReads({ subject: 'PM-USP returned', body: 'Provide current academic-year enrolment evidence.' }).kind).toBe('up-to-date')
  })

  it('falls back to "could not match" for scholarship email with no matching rule or application', () => {
    expect(meeraReads({ subject: 'FFE scholarship update', body: 'News for scholars.' })).toMatchObject({
      kind: 'ignored',
      summary: 'Could not match this to an application.',
    })
    expect(meeraReads({ subject: 'PM-USP CSSS newsletter', body: 'Tips for scholars.' }).kind).toBe('ignored')
    const corrected = applications.map((application) =>
      application.id === 'meera-pmusp-2026'
        ? { ...application, tracks: { application: { label: 'Correction resubmitted', basis: 'student-reported' as const, date: '2026-11-07' } } }
        : application,
    )
    expect(meeraReads({ subject: 'PM-USP returned', body: 'Provide current academic-year enrolment evidence.' }, corrected).kind).toBe('ignored')
  })
})
