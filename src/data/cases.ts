import type { Application, Task } from '@/domain/types'

/** The notice text returned with the correction request on the fictional application. */
export const correctionNotice = 'Application returned. Please provide current academic-year enrolment evidence.'

/** Starting applications for the fictional students. */
export const applications: Application[] = [
  {
    id: 'meera-pmusp-2025',
    studentId: 'meera',
    schemeId: 'pm-usp-csss',
    academicYear: '2025-26',
    applicantType: 'fresh',
    owner: 'provider',
    nextAction: 'Nothing to do. This year is complete.',
    tracks: {
      application: { label: 'Selected', basis: 'provider-confirmed', date: '2026-01-12' },
      award: { label: 'Accepted', basis: 'provider-confirmed', date: '2026-01-20' },
      payment: { label: 'Received ₹12,000', basis: 'provider-confirmed', date: '2026-03-10' },
      renewal: { label: 'Renewal applied for 2026-27', basis: 'evidence', date: '2026-10-20' },
    },
    history: [
      { date: '2025-10-18', track: 'application', label: 'Submitted', basis: 'evidence' },
      { date: '2026-01-12', track: 'application', label: 'Selected', basis: 'provider-confirmed' },
      { date: '2026-01-20', track: 'award', label: 'Accepted', basis: 'provider-confirmed' },
      { date: '2026-03-02', track: 'payment', label: 'Payment initiated', basis: 'provider-confirmed' },
      { date: '2026-03-10', track: 'payment', label: 'Received ₹12,000', basis: 'provider-confirmed' },
    ],
  },
  {
    id: 'meera-pmusp-2026',
    studentId: 'meera',
    schemeId: 'pm-usp-csss',
    academicYear: '2026-27',
    applicantType: 'renewal',
    owner: 'student',
    nextAction: 'Provide current academic-year enrolment evidence.',
    deadline: '2026-11-30',
    deadlineNote: 'The earliest NSP renewal date still open. NSP pages disagree, so act by this date.',
    notice: correctionNotice,
    tracks: {
      application: { label: 'Correction required', basis: 'provider-confirmed', date: '2026-11-05' },
    },
    history: [
      {
        date: '2026-10-20',
        track: 'application',
        label: 'Submitted',
        basis: 'evidence',
        note: 'NSP acknowledgement saved.',
      },
      {
        date: '2026-11-05',
        track: 'application',
        label: 'Correction required',
        basis: 'provider-confirmed',
        note: correctionNotice,
      },
    ],
  },
  {
    id: 'arjun-hdfc-2026',
    studentId: 'arjun',
    schemeId: 'hdfc-ecss',
    academicYear: '2026-27',
    applicantType: 'fresh',
    owner: 'student',
    nextAction: 'Review your draft, then submit it on Buddy4Study.',
    deadline: '2026-12-15',
    tracks: {
      application: { label: 'Draft', basis: 'student-reported', date: '2026-11-06' },
    },
    history: [{ date: '2026-11-06', track: 'application', label: 'Draft started', basis: 'student-reported' }],
  },
  {
    id: 'arjun-ffe-2026',
    studentId: 'arjun',
    schemeId: 'ffe',
    academicYear: '2026-27',
    applicantType: 'fresh',
    owner: 'family',
    nextAction: "Get your parent's last 3 months of salary slips, certified by the employer.",
    deadlineNote: 'FFE has not published a closing date.',
    tracks: {
      application: { label: 'Draft, blocked on documents', basis: 'student-reported', date: '2026-11-06' },
    },
    history: [{ date: '2026-11-06', track: 'application', label: 'Draft started', basis: 'student-reported' }],
  },
]

/** Starting tasks, including those waiting on the college. */
export const tasks: Task[] = [
  {
    id: 'task-meera-correction',
    studentId: 'meera',
    studentName: 'Meera Krishnan',
    institutionId: 'lakeview',
    applicationId: 'meera-pmusp-2026',
    title: 'Respond to the PM-USP correction request',
    owner: 'student',
    deadline: '2026-11-30',
    requirement: correctionNotice,
    status: 'requested',
  },
  {
    id: 'task-arjun-payslips',
    studentId: 'arjun',
    studentName: 'Arjun Kumar',
    institutionId: 'deccan',
    applicationId: 'arjun-ffe-2026',
    title: 'Get 3 months of salary slips, certified by the employer',
    owner: 'family',
    requirement: 'FFE needs payslips for an employed parent. An income certificate is not accepted.',
    status: 'requested',
  },
  {
    id: 'task-rahul-bonafide',
    studentId: 'rahul',
    studentName: 'Rahul Verma',
    institutionId: 'lakeview',
    applicationId: 'rahul-hdfc-2026',
    title: 'Issue a bonafide certificate',
    owner: 'institution',
    deadline: '2026-12-01',
    requirement: 'HDFC Parivartan ECSS accepts a bonafide certificate as admission proof.',
    status: 'acknowledged',
  },
  {
    id: 'task-ayesha-verify',
    studentId: 'ayesha',
    studentName: 'Ayesha Khan',
    institutionId: 'lakeview',
    applicationId: 'ayesha-pmusp-2026',
    title: 'Verify the PM-USP renewal on NSP',
    owner: 'institution',
    deadline: '2026-12-15',
    requirement: 'Institute verification for PM-USP renewals, per the NSP catalogue.',
    status: 'requested',
  },
]
