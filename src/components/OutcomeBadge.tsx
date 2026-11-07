import { CircleAlert, CircleCheck, CircleHelp, CircleX, type LucideIcon } from 'lucide-react'
import type { ReadinessResult } from '../domain/readiness'
import type { Outcome } from '../domain/types'

type Kind = Outcome | ReadinessResult

const kinds: Record<Kind, { label: string; icon: LucideIcon; className: string }> = {
  met: { label: 'Meets the listed condition', icon: CircleCheck, className: 'bg-forest-soft text-forest-deep' },
  'not-met': { label: 'Does not meet this condition', icon: CircleX, className: 'bg-rust-soft text-rust' },
  'need-info': { label: 'More information needed', icon: CircleAlert, className: 'bg-blue-soft text-blue' },
  'needs-confirmation': { label: 'Rule needs confirmation', icon: CircleHelp, className: 'bg-muted-soft text-muted' },
  satisfied: { label: 'Ready', icon: CircleCheck, className: 'bg-forest-soft text-forest-deep' },
  alternative: { label: 'Ready with an accepted alternative', icon: CircleCheck, className: 'bg-forest-soft text-forest-deep' },
  'not-satisfied': { label: 'Not accepted', icon: CircleX, className: 'bg-rust-soft text-rust' },
  missing: { label: 'Missing', icon: CircleAlert, className: 'bg-rust-soft text-rust' },
}

export function OutcomeBadge({ kind }: { kind: Kind }) {
  const { label, icon: Icon, className } = kinds[kind]
  return (
    <span className={`my-1 inline-flex items-center gap-1.5 rounded-pill py-1 pr-3 pl-2 text-small leading-snug font-bold ${className}`}>
      <Icon aria-hidden="true" size={18} strokeWidth={2.4} className="shrink-0" />
      {label}
    </span>
  )
}
