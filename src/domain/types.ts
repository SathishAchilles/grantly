// Application, award, payment and renewal stay separate tracks. One student can
// hold an accepted award, a failed payment and a renewal that is not yet due.

/** Who or what vouches for a status, from provider confirmation down to the student's own report. */
export type StatusBasis = 'provider-confirmed' | 'evidence' | 'college-confirmed' | 'student-reported'

/** The party who has to act next on an application or task. */
export type ActionOwner = 'student' | 'institution' | 'family' | 'bank' | 'provider'

/** Whether the student is applying for the first time or renewing an earlier award. */
export type ApplicantType = 'fresh' | 'renewal'

/** An official page that backs a rule, amount or deadline, with the date it was last checked. */
export interface Source {
  title: string
  url: string
  checkedOn: string
}

/** The kinds of document a scheme can ask for. */
export type DocType =
  | 'income-certificate'
  | 'salary-slips'
  | 'class-12-marksheet'
  | 'previous-year-marksheet'
  | 'enrolment-letter'
  | 'admission-letter'
  | 'fee-receipt'
  | 'bank-passbook'

/** A document the student holds and who issued it. */
export interface Doc {
  id: string
  type: DocType
  label: string
  /** Year the document covers, when it is specific to one. */
  academicYear?: string
  issuer: string
  /** How the document's existence was established. */
  basis: StatusBasis
}

/** Result of checking one rule: met, not met, or what is still unknown. */
export type Outcome = 'met' | 'not-met' | 'need-info' | 'needs-confirmation'

/** The result of one rule together with the reason shown to the student. */
export interface RuleOutcome {
  result: Outcome
  reason: string
  /** Question to put to the student when more information is needed. */
  ask?: string
}

/** One listed eligibility condition of a scheme. */
export interface Rule {
  id: string
  label: string
  /** Applicant type the rule covers. "both" covers fresh and renewal applications. */
  appliesTo: ApplicantType | 'both'
  source?: Source
  evaluate: (student: Student) => RuleOutcome
}

/** A document a scheme asks for, with the types it accepts, tolerates instead or refuses. */
export interface EvidenceRequirement {
  id: string
  label: string
  appliesTo: ApplicantType | 'both'
  /** Document types that satisfy the requirement. */
  accepts: DocType[]
  /** Document types the programme accepts in place of the preferred ones. */
  alternatives: DocType[]
  /** Document types students commonly offer that the programme does not accept. */
  rejects: DocType[]
  /** When true, only a document for the scheme's academic year counts. */
  currentYearOnly?: boolean
  /** Narrows the requirement to the students it concerns. When absent, it always applies. */
  appliesWhen?: (student: Student) => boolean
  note: string
  source: Source
}

/** Whose closing date an entry is: the student's, or a later date for defects, institutes or states. */
export type DeadlineKind = 'student' | 'defective' | 'institute' | 'state'

/** The closing dates published by one source. */
export interface DeadlineSet {
  source: Source
  entries: { kind: DeadlineKind; date: string }[]
}

/** A scheme's award for a student, with the basis for the figure. */
export interface Amount {
  /** Rupees, or null when the provider has not published an amount. */
  value: number | null
  basis: string
  source: Source | null
}

/** A scholarship programme: who runs it, who it is open to, and its dates, rules and evidence. */
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
  /** Shown when the provider has published no closing date. */
  noDeadlineNote?: string
  confirmWith?: string
  rules: Rule[]
  evidence: EvidenceRequirement[]
  amountFor: (student: Student) => Amount
}

/** Broad level of study that scheme rules are written against. */
export type CourseLevel = 'school' | 'ug-general' | 'ug-professional' | 'pg-general' | 'pg-professional'

/** A state and, optionally, a city. */
export interface Place {
  state: string
  city?: string
}

/** A college or school, and whether it is recognised. */
export interface Institution {
  id: string
  name: string
  place: Place
  recognised: boolean
}

/** Money a student has received or expects towards their costs. */
export interface SupportItem {
  id: string
  label: string
  amount: number
  kind: 'cash' | 'fee-reduction' | 'reimbursement'
  /** Only confirmed support reduces the funding gap. */
  state: 'confirmed' | 'pending'
}

/** A student and the facts that scheme rules and documents are checked against. */
export interface Student {
  id: string
  role: 'student'
  name: string
  course: string
  level: CourseLevel
  studyYear: number
  /** Set only for school-level students. */
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
  /** Annual family income in rupees. */
  familyIncome: number
  parentEmployment: 'salaried' | 'self-employed' | 'farmer'
  otherSchemesAvailed: string[]
  /** Total study cost in rupees. */
  costs: number
  /** Amount in rupees the family can pay towards the costs. */
  familyContribution: number
  support: SupportItem[]
  documents: Doc[]
}

/** A college staff member who helps students with their applications. */
export interface Coordinator {
  id: string
  role: 'coordinator'
  name: string
  title: string
  institution: Institution
}

/** Anyone who can use the app: a student or a coordinator. */
export type Person = Student | Coordinator

/** The separate tracks on which an application's progress is recorded. */
export type Track = 'application' | 'award' | 'payment' | 'renewal'

/** The current label on one track, with its basis and date. */
export interface TrackState {
  label: string
  basis: StatusBasis
  date: string
}

/** One dated change on an application track. */
export interface HistoryEntry {
  date: string
  track: Track
  label: string
  basis: StatusBasis
  note?: string
}

/** A student's application to a scheme for an academic year, with progress recorded per track. */
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
  /** Notice text received from the provider, when there is one. */
  notice?: string
  /** Current state per track. Only the application track is always present. */
  tracks: { application: TrackState } & Partial<Record<Exclude<Track, 'application'>, TrackState>>
  history: HistoryEntry[]
}

/** Where a task stands between being requested and being completed. */
export type TaskStatus = 'requested' | 'acknowledged' | 'completed' | 'needs-clarification'

/** A piece of work requested of the student, college, bank or provider on an application. */
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
  /** The document this task produces when it is completed. */
  fulfils?: Omit<Doc, 'id' | 'basis'>
}
