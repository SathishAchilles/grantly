import type { Rule, Scheme, Student } from '@/domain/types'
import { sources } from './sources'

const NOT_CONFIRMED = 'Not yet confirmed'

const met = (reason: string) => ({ result: 'met' as const, reason })
const notMet = (reason: string) => ({ result: 'not-met' as const, reason })

const incomeAtMost = (id: string, limit: number, label: string, source: Rule['source']): Rule => ({
  id,
  label,
  appliesTo: 'both',
  source,
  evaluate: (student) =>
    student.familyIncome <= limit
      ? met(`Family income ₹${student.familyIncome.toLocaleString('en-IN')} is within the limit.`)
      : notMet(`Family income ₹${student.familyIncome.toLocaleString('en-IN')} is above the limit.`),
})

/** The PM-USP Central Sector Scheme of Scholarship (CSSS), with its rules, evidence and deadlines. */
export const pmUspCsss: Scheme = {
  id: 'pm-usp-csss',
  name: 'PM-USP Central Sector Scheme of Scholarship for College and University Students (CSSS)',
  shortName: 'PM-USP CSSS',
  owner: 'Department of Higher Education, Ministry of Education',
  fundingAuthority: 'Ministry of Education',
  applicantGroup: 'Merit-cum-means: Class XII toppers in regular degree courses',
  geography: 'All India, with slots shared among State Education Boards',
  portal: 'National Scholarship Portal (NSP)',
  verificationAuthority: 'Institute, then State Nodal Agency',
  paymentRoute: 'Direct Benefit Transfer to an Aadhaar-seeded bank account, tracked on PFMS',
  academicYear: '2026-27',
  openFor: ['renewal'],
  providerUrl: 'https://scholarships.gov.in/',
  confirmWith: 'the NSP helpdesk or the Department of Higher Education (ns1-scholarship@gov.in, 011-20862360)',
  deadlines: [
    {
      source: sources.nspAnnouncement,
      entries: [
        { kind: 'student', date: '2026-10-31' },
        { kind: 'institute', date: '2026-11-15' },
        { kind: 'state', date: '2026-11-30' },
      ],
    },
    {
      source: sources.nspCatalogue,
      entries: [
        { kind: 'student', date: '2026-11-30' },
        { kind: 'defective', date: '2026-12-15' },
        { kind: 'institute', date: '2026-12-15' },
        { kind: 'state', date: '2026-12-31' },
      ],
    },
  ],
  rules: [
    {
      id: 'percentile',
      label: 'Above the 80th percentile of successful candidates in your Class XII board and stream',
      appliesTo: 'fresh',
      source: sources.csssGuidelines,
      evaluate: ({ class12 }) => {
        if (class12.percentile === undefined) {
          return {
            result: 'need-info',
            reason: `${class12.percent}% is a marks percentage, not a percentile. The cut-off comes from your board's list.`,
            ask: `Check whether your board (${class12.board}, ${class12.stream}, ${class12.year}) lists you in its top 20 percentile.`,
          }
        }
        return class12.percentile > 80
          ? met(`You are in the ${class12.percentile}th percentile.`)
          : notMet(`You are in the ${class12.percentile}th percentile.`)
      },
    },
    {
      id: 'regular-degree',
      label: 'Regular degree course, not distance, correspondence or diploma',
      appliesTo: 'fresh',
      source: sources.csssGuidelines,
      evaluate: (student) =>
        student.regularMode && student.level !== 'school'
          ? met(`${student.course} is a regular degree course.`)
          : notMet('This scheme needs a regular degree course.'),
    },
    {
      id: 'no-gap-year',
      label: 'No gap year after Class XII',
      appliesTo: 'fresh',
      source: sources.csssFaq,
      evaluate: (student) =>
        student.gapYearAfterClass12 ? notMet('You took a gap year after Class XII.') : met('No gap year after Class XII.'),
    },
    {
      id: 'recognised-institution',
      label: 'Institution recognised by its regulator, with a valid AISHE code',
      appliesTo: 'both',
      source: sources.csssGuidelines,
      evaluate: ({ institution }) =>
        institution.recognised
          ? met(`${institution.name} is recognised.`)
          : notMet(`${institution.name} is not recognised.`),
    },
    incomeAtMost('income', 450_000, 'Family income up to ₹4.5 lakh a year', sources.csssGuidelines),
    {
      id: 'no-other-scheme',
      label: 'Not availing any other merit or state scholarship, fee waiver or reimbursement',
      appliesTo: 'both',
      source: sources.csssGuidelines,
      evaluate: (student) =>
        student.otherSchemesAvailed.length === 0
          ? met('You are not availing any other scheme.')
          : notMet(`You are availing ${student.otherSchemesAvailed.join(', ')}.`),
    },
    {
      id: 'renewal-marks',
      label: 'At least 50% marks in the annual examination',
      appliesTo: 'renewal',
      source: sources.csssGuidelines,
      evaluate: ({ latestResults }) => {
        if (!latestResults) return { result: 'need-info', reason: 'Your latest marks are not recorded.', ask: 'Add your latest marksheet.' }
        return latestResults.marksPercent >= 50
          ? met(`${latestResults.marksPercent}% in ${latestResults.academicYear}.`)
          : notMet(`${latestResults.marksPercent}% in ${latestResults.academicYear}.`)
      },
    },
    {
      id: 'renewal-attendance',
      label: 'At least 75% attendance',
      appliesTo: 'renewal',
      source: sources.csssGuidelines,
      evaluate: ({ latestResults }) => {
        if (!latestResults) return { result: 'need-info', reason: 'Your attendance is not recorded.', ask: 'Ask your college for your attendance record.' }
        return latestResults.attendancePercent >= 75
          ? met(`${latestResults.attendancePercent}% attendance in ${latestResults.academicYear}.`)
          : notMet(`${latestResults.attendancePercent}% attendance in ${latestResults.academicYear}.`)
      },
    },
    {
      id: 'attendance-evidence',
      label: 'Evidence accepted for attendance',
      appliesTo: 'renewal',
      evaluate: () => ({
        result: 'needs-confirmation',
        reason: 'The guidelines do not say what evidence proves attendance.',
      }),
    },
  ],
  evidence: [
    {
      id: 'class-12-marksheet',
      label: 'Class XII marksheet',
      appliesTo: 'fresh',
      accepts: ['class-12-marksheet'],
      alternatives: [],
      rejects: [],
      note: 'Name and roll number must match exactly, or the scheme will not be visible.',
      source: sources.csssFaq,
    },
    {
      id: 'income-certificate',
      label: 'Family income certificate',
      appliesTo: 'fresh',
      accepts: ['income-certificate'],
      alternatives: [],
      rejects: [],
      note: 'Needed for fresh applications only.',
      source: sources.csssGuidelines,
    },
    {
      id: 'previous-year-marksheet',
      label: "Previous year's marksheet",
      appliesTo: 'renewal',
      accepts: ['previous-year-marksheet'],
      alternatives: [],
      rejects: [],
      note: 'The only document listed for renewal.',
      source: sources.csssFaq,
    },
  ],
  amountFor: (student) => {
    if (student.level === 'pg-general' || student.level === 'pg-professional') {
      return { value: 20_000, basis: 'a year at postgraduate level', source: sources.csssGuidelines }
    }
    if (student.studyYear >= 4) {
      return { value: 20_000, basis: 'a year in year 4 or 5 of a professional course', source: sources.csssGuidelines }
    }
    return { value: 12_000, basis: 'a year at graduation level, years 1 to 3', source: sources.csssGuidelines }
  },
}

const hdfcAmounts: Record<Student['level'], number> = {
  school: 18_000,
  'ug-general': 30_000,
  'ug-professional': 50_000,
  'pg-general': 35_000,
  'pg-professional': 75_000,
}

/** The HDFC Bank Parivartan Educational Crisis Scholarship Support (ECSS) programme. */
export const hdfcEcss: Scheme = {
  id: 'hdfc-ecss',
  name: "HDFC Bank Parivartan's Educational Crisis Scholarship Support (ECSS) 2026-27",
  shortName: 'HDFC Parivartan ECSS',
  owner: 'HDFC Bank Parivartan, run by Buddy4Study',
  fundingAuthority: 'HDFC Bank',
  applicantGroup: 'Merit-cum-need: school, diploma, UG and PG students',
  geography: 'All India',
  portal: 'Buddy4Study',
  verificationAuthority: 'Buddy4Study: document verification and interview',
  paymentRoute: NOT_CONFIRMED,
  academicYear: '2026-27',
  openFor: ['fresh', 'renewal'],
  providerUrl: 'https://www.parivartanecss.com/',
  deadlines: [{ source: sources.hdfcEcss, entries: [{ kind: 'student', date: '2026-12-15' }] }],
  rules: [
    {
      id: 'marks',
      label: 'At least 55% in the previous qualifying exam',
      appliesTo: 'both',
      source: sources.hdfcEcss,
      evaluate: (student) => {
        const marks = student.latestResults?.marksPercent ?? student.class12.percent
        return marks >= 55 ? met(`${marks}% in your previous exam.`) : notMet(`${marks}% in your previous exam.`)
      },
    },
    incomeAtMost('income', 250_000, 'Family income up to ₹2.5 lakh a year', sources.hdfcEcss),
    {
      id: 'crisis',
      label: 'Family or personal crisis in the past three years',
      appliesTo: 'both',
      source: sources.hdfcEcss,
      evaluate: () => met('A crisis gives preference but is not required.'),
    },
  ],
  evidence: [
    {
      id: 'admission-proof',
      label: 'Current year admission proof',
      appliesTo: 'both',
      accepts: ['fee-receipt'],
      alternatives: ['admission-letter', 'enrolment-letter'],
      rejects: [],
      currentYearOnly: true,
      note: 'If you do not have the fee receipt, the admission letter or confirmation is accepted.',
      source: sources.hdfcEcss,
    },
    {
      id: 'marksheet',
      label: "Previous year's marksheet",
      appliesTo: 'both',
      accepts: ['class-12-marksheet', 'previous-year-marksheet'],
      alternatives: [],
      rejects: [],
      note: 'From your previous qualifying exam.',
      source: sources.hdfcEcss,
    },
    {
      id: 'income-proof',
      label: 'Income proof',
      appliesTo: 'both',
      accepts: ['income-certificate', 'salary-slips'],
      alternatives: [],
      rejects: [],
      note: 'An income certificate, salary slip or employer letter, ITR or affidavit.',
      source: sources.hdfcEcss,
    },
    {
      id: 'bank-details',
      label: 'Bank passbook or cancelled cheque',
      appliesTo: 'both',
      accepts: ['bank-passbook'],
      alternatives: [],
      rejects: [],
      note: "In the applicant's name.",
      source: sources.hdfcEcss,
    },
  ],
  amountFor: (student) => ({
    value: hdfcAmounts[student.level],
    basis: 'for your course level',
    source: sources.hdfcEcss,
  }),
}

const ffeCourses = ['B.E.', 'B.Tech', 'Integrated M.Tech', 'MBBS', 'LLB']

/** The Foundation For Excellence (FFE) scholarship. */
export const ffe: Scheme = {
  id: 'ffe',
  name: 'Foundation For Excellence (FFE) Scholarship 2026-27',
  shortName: 'FFE',
  owner: 'Foundation For Excellence',
  fundingAuthority: 'Foundation For Excellence',
  applicantGroup: 'First-year professional degree students from low-income families',
  geography: 'All India, with rank limits by state',
  portal: 'ffe.org',
  verificationAuthority: 'FFE facilitator verifies financial need',
  paymentRoute: NOT_CONFIRMED,
  academicYear: '2026-27',
  openFor: ['fresh'],
  providerUrl: 'https://ffe.org/scholarships/',
  deadlines: [],
  noDeadlineNote: 'Applications opened on 1 Aug 2026. FFE has not published a closing date.',
  rules: [
    {
      id: 'course',
      label: 'First year of B.E., B.Tech, integrated M.Tech, MBBS or LLB',
      appliesTo: 'fresh',
      source: sources.ffe,
      evaluate: (student) =>
        ffeCourses.includes(student.course) && student.studyYear === 1
          ? met(`First year of ${student.course}.`)
          : notMet(`${student.course}, year ${student.studyYear}, is not an eligible course and year.`),
    },
    {
      id: 'class-12-year',
      label: 'Passed Class XII after 2024',
      appliesTo: 'fresh',
      source: sources.ffe,
      evaluate: ({ class12 }) =>
        class12.year > 2024 ? met(`Passed in ${class12.year}.`) : notMet(`Passed in ${class12.year}.`),
    },
    {
      id: 'income',
      label: 'Gross family income below ₹4 lakh a year',
      appliesTo: 'fresh',
      source: sources.ffe,
      evaluate: (student) =>
        student.familyIncome < 400_000
          ? met(`Family income ₹${student.familyIncome.toLocaleString('en-IN')} is below the limit.`)
          : notMet(`Family income ₹${student.familyIncome.toLocaleString('en-IN')} is not below the limit.`),
    },
    {
      id: 'rank',
      label: 'Entrance rank within the limit for your exam and state',
      appliesTo: 'fresh',
      evaluate: () => ({
        result: 'needs-confirmation',
        reason: 'FFE lists rank limits by state but does not say which exam the state limits use.',
      }),
    },
  ],
  evidence: [
    {
      id: 'marksheet',
      label: 'Class XII marksheet',
      appliesTo: 'fresh',
      accepts: ['class-12-marksheet'],
      alternatives: [],
      rejects: [],
      note: 'One of the mandatory documents.',
      source: sources.ffe,
    },
    {
      id: 'salaried-income',
      label: 'Salary slips for 3 months, certified by the employer',
      appliesTo: 'fresh',
      accepts: ['salary-slips'],
      alternatives: [],
      rejects: ['income-certificate'],
      appliesWhen: (student) => student.parentEmployment === 'salaried',
      note: 'For an employed parent, an income certificate is not accepted in place of payslips.',
      source: sources.ffe,
    },
    {
      id: 'other-income',
      label: 'Income certificate or ITR',
      appliesTo: 'fresh',
      accepts: ['income-certificate'],
      alternatives: [],
      rejects: [],
      appliesWhen: (student) => student.parentEmployment !== 'salaried',
      note: 'For self-employed or farming families.',
      source: sources.ffe,
    },
    {
      id: 'fee-receipt',
      label: 'Paid tuition, hostel or mess receipts',
      appliesTo: 'fresh',
      accepts: ['fee-receipt'],
      alternatives: [],
      rejects: [],
      note: 'One of the mandatory documents.',
      source: sources.ffe,
    },
  ],
  amountFor: () => ({ value: null, basis: 'Not published by the provider', source: null }),
}

/** The National Means-cum-Merit Scholarship Scheme (NMMSS). */
export const nmmss: Scheme = {
  id: 'nmmss',
  name: 'National Means-cum-Merit Scholarship Scheme (NMMSS) 2026-27',
  shortName: 'NMMSS',
  owner: 'Department of School Education & Literacy',
  fundingAuthority: 'Ministry of Education',
  applicantGroup: 'Class IX students who qualify through the state or UT exam',
  geography: 'All India, through state and UT exams',
  portal: 'National Scholarship Portal (NSP)',
  verificationAuthority: 'Institute nodal officer, then district nodal officer',
  paymentRoute: NOT_CONFIRMED,
  academicYear: '2026-27',
  openFor: ['fresh', 'renewal'],
  providerUrl: 'https://scholarships.gov.in/',
  deadlines: [
    {
      source: sources.nspCatalogue,
      entries: [
        { kind: 'student', date: '2026-11-15' },
        { kind: 'defective', date: '2026-11-30' },
        { kind: 'institute', date: '2026-11-30' },
        { kind: 'state', date: '2026-12-15' },
      ],
    },
  ],
  rules: [
    {
      id: 'class-9',
      label: 'In Class IX, qualified through the state or UT exam',
      appliesTo: 'fresh',
      source: sources.nmmssPib,
      evaluate: (student) =>
        student.schoolClass === 9 ? met('You are in Class IX.') : notMet('This scheme is for school students in Class IX.'),
    },
  ],
  evidence: [],
  amountFor: () => ({ value: null, basis: 'Not published by the provider', source: null }),
}

/** Every scheme the app can evaluate. */
export const schemes: Scheme[] = [pmUspCsss, hdfcEcss, ffe, nmmss]

/**
 * Looks up a scheme by its id.
 *
 * @param id - The scheme id.
 * @returns The matching scheme. Throws when the id is unknown.
 */
export function schemeById(id: string): Scheme {
  const scheme = schemes.find((candidate) => candidate.id === id)
  if (!scheme) throw new Error(`Unknown scheme: ${id}`)
  return scheme
}
