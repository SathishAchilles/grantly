// Application, award, payment and renewal stay separate records. One student can
// hold an accepted award, a failed payment and a renewal that is not yet due.

export type StatusBasis = 'provider-confirmed' | 'evidence' | 'student-reported'

export type ActionOwner = 'student' | 'institution' | 'referee' | 'provider' | 'finance'

export interface Tracked<State extends string> {
  state: State
  basis: StatusBasis
  owner: ActionOwner
  updatedAt: string
}

export type ApplicationState =
  | 'draft'
  | 'submitted'
  | 'awaiting-verification'
  | 'correction-required'
  | 'under-review'
  | 'shortlisted'
  | 'waitlisted'
  | 'unsuccessful'
  | 'withdrawn'

export type AwardOfferState = 'offered' | 'conditions-outstanding' | 'accepted' | 'declined' | 'expired'

export type InstalmentState =
  | 'details-required'
  | 'pending-approval'
  | 'scheduled'
  | 'initiated'
  | 'failed-or-returned'
  | 'received'
  | 'reconciled'

export type RenewalState =
  | 'not-due'
  | 'approaching'
  | 'evidence-required'
  | 'submitted'
  | 'approved'
  | 'deferred'
  | 'discontinued'

export interface Application {
  id: string
  scholarshipId: string
  academicYear: string
  status: Tracked<ApplicationState>
}

export interface AwardOffer {
  id: string
  applicationId: string
  amountInr: number
  status: Tracked<AwardOfferState>
}

export interface Instalment {
  id: string
  awardOfferId: string
  amountInr: number
  payee: 'student' | 'institution'
  expectedOn: string
  status: Tracked<InstalmentState>
}

export interface Renewal {
  id: string
  awardOfferId: string
  academicYear: string
  dueOn: string
  status: Tracked<RenewalState>
}
