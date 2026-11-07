import type { Coordinator, Institution, Person, Student } from '@/domain/types'

/** The college where Meera studies and Priya coordinates scholarships. */
export const lakeview: Institution = {
  id: 'lakeview',
  name: 'Lakeview Arts and Science College',
  place: { state: 'Tamil Nadu', city: 'Chennai' },
  recognised: true,
}

/** The college where Arjun studies. */
export const deccan: Institution = {
  id: 'deccan',
  name: 'Deccan Institute of Technology',
  place: { state: 'Maharashtra', city: 'Pune' },
  recognised: true,
}

/** A renewal applicant studying B.Sc. Physics. */
export const meera: Student = {
  id: 'meera',
  role: 'student',
  name: 'Meera Krishnan',
  course: 'B.Sc. Physics',
  level: 'ug-general',
  studyYear: 2,
  applicantType: 'renewal',
  regularMode: true,
  gapYearAfterClass12: false,
  institution: lakeview,
  domicile: { state: 'Kerala' },
  residence: { state: 'Tamil Nadu', city: 'Chennai' },
  schooling: { state: 'Kerala' },
  class12: { percent: 93, board: 'Kerala Board of Higher Secondary Education', stream: 'Science', year: 2025, percentile: 92 },
  latestResults: { academicYear: '2025-26', marksPercent: 68, attendancePercent: 82 },
  familyIncome: 180_000,
  parentEmployment: 'self-employed',
  otherSchemesAvailed: [],
  costs: 60_000,
  familyContribution: 30_000,
  support: [{ id: 'meera-pmusp-renewal', label: 'PM-USP CSSS renewal, 2026-27', amount: 12_000, kind: 'cash', state: 'pending' }],
  documents: [
    { id: 'meera-income', type: 'income-certificate', label: 'Income certificate', academicYear: '2025-26', issuer: 'Village Officer, Kerala', basis: 'evidence' },
    { id: 'meera-class12', type: 'class-12-marksheet', label: 'Class XII marksheet', academicYear: '2024-25', issuer: 'Kerala Board of Higher Secondary Education', basis: 'evidence' },
    { id: 'meera-marks-2025', type: 'previous-year-marksheet', label: 'First-year marksheet', academicYear: '2025-26', issuer: 'Lakeview Arts and Science College', basis: 'evidence' },
    { id: 'meera-enrolment-2025', type: 'enrolment-letter', label: 'Enrolment letter', academicYear: '2025-26', issuer: 'Lakeview Arts and Science College', basis: 'evidence' },
    { id: 'meera-passbook', type: 'bank-passbook', label: 'Bank passbook', issuer: 'Indian Bank', basis: 'evidence' },
  ],
}

/** A fresh applicant studying B.Tech. */
export const arjun: Student = {
  id: 'arjun',
  role: 'student',
  name: 'Arjun Kumar',
  course: 'B.Tech',
  level: 'ug-professional',
  studyYear: 1,
  applicantType: 'fresh',
  regularMode: true,
  gapYearAfterClass12: false,
  institution: deccan,
  domicile: { state: 'Bihar' },
  residence: { state: 'Maharashtra', city: 'Pune' },
  schooling: { state: 'Bihar' },
  class12: { percent: 84, board: 'CBSE', stream: 'Science', year: 2026 },
  entrance: { exam: 'JEE Main', rank: 112_000 },
  familyIncome: 220_000,
  parentEmployment: 'salaried',
  otherSchemesAvailed: [],
  costs: 120_000,
  familyContribution: 40_000,
  support: [
    { id: 'arjun-fee-waiver', label: 'Deccan Institute merit fee waiver', amount: 20_000, kind: 'fee-reduction', state: 'pending' },
  ],
  documents: [
    { id: 'arjun-income', type: 'income-certificate', label: 'Income certificate', academicYear: '2026-27', issuer: 'Circle Officer, Bihar', basis: 'evidence' },
    { id: 'arjun-admission', type: 'admission-letter', label: 'Admission letter', academicYear: '2026-27', issuer: 'Deccan Institute of Technology', basis: 'evidence' },
    { id: 'arjun-class12', type: 'class-12-marksheet', label: 'Class XII marksheet', academicYear: '2025-26', issuer: 'CBSE', basis: 'evidence' },
    { id: 'arjun-passbook', type: 'bank-passbook', label: 'Bank passbook', issuer: 'State Bank of India', basis: 'evidence' },
  ],
}

/** The scholarship coordinator at Lakeview. */
export const priya: Coordinator = {
  id: 'priya',
  role: 'coordinator',
  name: 'Priya Nair',
  title: 'Scholarship coordinator',
  institution: lakeview,
}

/** Everyone who can be switched to, students first. */
export const people: Person[] = [meera, arjun, priya]
