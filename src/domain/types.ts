// Application, award, payment and renewal stay separate tracks. One student can
// hold an accepted award, a failed payment and a renewal that is not yet due.

export type StatusBasis = 'provider-confirmed' | 'evidence' | 'college-confirmed' | 'student-reported'

export type ActionOwner = 'student' | 'institution' | 'family' | 'bank' | 'provider'

export type ApplicantType = 'fresh' | 'renewal'

export interface Source {
  title: string
  url: string
  checkedOn: string
}

export type DocType =
  | 'income-certificate'
  | 'salary-slips'
  | 'class-12-marksheet'
  | 'previous-year-marksheet'
  | 'enrolment-letter'
  | 'admission-letter'
  | 'fee-receipt'
  | 'bank-passbook'

export interface Doc {
  id: string
  type: DocType
  label: string
  academicYear?: string
  issuer: string
  basis: StatusBasis
}

export type Outcome = 'met' | 'not-met' | 'need-info' | 'needs-confirmation'

export interface RuleOutcome {
  result: Outcome
  reason: string
  ask?: string
}

export interface Rule {
  id: string
  label: string
  appliesTo: ApplicantType | 'both'
  source?: Source
  evaluate: (student: Student) => RuleOutcome
}

export interface EvidenceRequirement {
  id: string
  label: string
  appliesTo: ApplicantType | 'both'
  accepts: DocType[]
  alternatives: DocType[]
  rejects: DocType[]
  currentYearOnly?: boolean
  appliesWhen?: (student: Student) => boolean
  note: string
  source: Source
}

export type DeadlineKind = 'student' | 'defective' | 'institute' | 'state'

export interface DeadlineSet {
  source: Source
  entries: { kind: DeadlineKind; date: string }[]
}

export interface Amount {
  value: number | null
  basis: string
  source: Source | null
}

export interface Scheme {
  id: string
  name: string
  shortName: string
  owner: string
  fundingAuthority: string
  applicantGroup: string
  geography: string
  portal: string
  verificationAuthority: string
  paymentRoute: string
  academicYear: string
  openFor: ApplicantType[]
  providerUrl: string
  deadlines: DeadlineSet[]
  noDeadlineNote?: string
  confirmWith?: string
  rules: Rule[]
  evidence: EvidenceRequirement[]
  amountFor: (student: Student) => Amount
}

export type CourseLevel = 'school' | 'ug-general' | 'ug-professional' | 'pg-general' | 'pg-professional'

export interface Place {
  state: string
  city?: string
}

export interface Institution {
  id: string
  name: string
  place: Place
  recognised: boolean
}

export interface SupportItem {
  id: string
  label: string
  amount: number
  kind: 'cash' | 'fee-reduction' | 'reimbursement'
  state: 'confirmed' | 'pending'
}

export interface Student {
  id: string
  role: 'student'
  name: string
  course: string
  level: CourseLevel
  studyYear: number
  schoolClass?: number
  applicantType: ApplicantType
  regularMode: boolean
  gapYearAfterClass12: boolean
  institution: Institution
  domicile: Place
  residence: Place
  schooling: Place
  class12: { percent: number; board: string; stream: string; year: number; percentile?: number }
  latestResults?: { academicYear: string; marksPercent: number; attendancePercent: number }
  entrance?: { exam: string; rank: number }
  familyIncome: number
  parentEmployment: 'salaried' | 'self-employed' | 'farmer'
  otherSchemesAvailed: string[]
  costs: number
  familyContribution: number
  support: SupportItem[]
  documents: Doc[]
}

export interface Coordinator {
  id: string
  role: 'coordinator'
  name: string
  title: string
  institution: Institution
}

export type Person = Student | Coordinator

export type Track = 'application' | 'award' | 'payment' | 'renewal'

export interface TrackState {
  label: string
  basis: StatusBasis
  date: string
}

export interface HistoryEntry {
  date: string
  track: Track
  label: string
  basis: StatusBasis
  note?: string
}

export interface Application {
  id: string
  studentId: string
  schemeId: string
  academicYear: string
  applicantType: ApplicantType
  owner: ActionOwner
  nextAction: string
  deadline?: string
  deadlineNote?: string
  notice?: string
  tracks: { application: TrackState } & Partial<Record<Exclude<Track, 'application'>, TrackState>>
  history: HistoryEntry[]
}

export type TaskStatus = 'requested' | 'acknowledged' | 'completed' | 'needs-clarification'

export interface Task {
  id: string
  studentId: string
  studentName: string
  institutionId: string
  applicationId: string
  title: string
  owner: ActionOwner
  deadline?: string
  requirement: string
  status: TaskStatus
  fulfils?: Omit<Doc, 'id' | 'basis'>
}
