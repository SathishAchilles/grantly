import { CircleAlert, CircleCheck, CircleHelp, CircleX, type LucideIcon } from 'lucide-react'
import type { ReadinessResult } from '../domain/readiness'
import type { Outcome } from '../domain/types'

type Kind = Outcome | ReadinessResult

const kinds: Record<Kind, { label: string; icon: LucideIcon; className: string }> = {
  met: { label: 'Meets the listed condition', icon: CircleCheck, className: 'text-forest' },
  'not-met': { label: 'Does not meet this condition', icon: CircleX, className: 'text-rust' },
  'need-info': { label: 'More information needed', icon: CircleAlert, className: 'text-blue' },
  'needs-confirmation': { label: 'Rule needs confirmation', icon: CircleHelp, className: 'text-muted' },
  satisfied: { label: 'Ready', icon: CircleCheck, className: 'text-forest' },
  alternative: { label: 'Ready with an accepted alternative', icon: CircleCheck, className: 'text-forest' },
  'not-satisfied': { label: 'Not accepted', icon: CircleX, className: 'text-rust' },
  missing: { label: 'Missing', icon: CircleAlert, className: 'text-rust' },
}

export function OutcomeBadge({ kind }: { kind: Kind }) {
  const { label, icon: Icon, className } = kinds[kind]
  return (
    <span className={`inline-flex items-center gap-1.5 text-small font-semibold ${className}`}>
      <Icon aria-hidden="true" size={16} />
      {label}
    </span>
  )
}
