import { BadgeCheck, Building2, FileCheck2, UserRound, type LucideIcon } from 'lucide-react'
import type { StatusBasis } from '@/domain/types'

const bases: Record<StatusBasis, { label: string; icon: LucideIcon; className: string }> = {
  'provider-confirmed': { label: 'Provider-confirmed', icon: BadgeCheck, className: 'bg-forest-soft text-forest-deep' },
  evidence: { label: 'Supported by evidence', icon: FileCheck2, className: 'bg-blue-soft text-blue' },
  'college-confirmed': { label: 'Confirmed by college staff', icon: Building2, className: 'bg-forest-soft text-forest-deep' },
  'student-reported': { label: 'Student-reported', icon: UserRound, className: 'bg-muted-soft text-muted' },
}

/** A badge showing who or what a status rests on, such as the provider or the student's own report, so the student can judge how far to trust it. */
export function StatusBadge({ basis }: { basis: StatusBasis }) {
  const { label, icon: Icon, className } = bases[basis]
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill py-0.5 pr-2.5 pl-1.5 text-label leading-snug font-bold ${className}`}>
      <Icon aria-hidden="true" size={15} strokeWidth={2.4} className="shrink-0" />
      {label}
    </span>
  )
}
