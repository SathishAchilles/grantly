import { BadgeCheck, FileCheck2, UserRound, type LucideIcon } from 'lucide-react'
import type { StatusBasis } from '../domain/types'

const bases: Record<StatusBasis, { label: string; icon: LucideIcon; className: string }> = {
  'provider-confirmed': { label: 'Provider-confirmed', icon: BadgeCheck, className: 'text-forest' },
  evidence: { label: 'Supported by evidence', icon: FileCheck2, className: 'text-blue' },
  'student-reported': { label: 'Student-reported', icon: UserRound, className: 'text-muted' },
}

export function StatusBadge({ basis }: { basis: StatusBasis }) {
  const { label, icon: Icon, className } = bases[basis]
  return (
    <span className={`inline-flex items-center gap-1.5 text-label font-semibold ${className}`}>
      <Icon aria-hidden="true" size={14} />
      {label}
    </span>
  )
}
