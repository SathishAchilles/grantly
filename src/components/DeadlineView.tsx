import { CalendarDays, TriangleAlert } from 'lucide-react'
import { formatDate } from '@/domain/dates'
import type { StudentDeadline } from '@/domain/eligibility'
import { SourceLink } from './SourceLink'

export function DeadlineView({ deadline, confirmWith }: { deadline: StudentDeadline; confirmWith: string }) {
  if (deadline.status === 'none') return <p>{deadline.note}</p>

  if (deadline.status === 'single') {
    const { option } = deadline
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-2">
          <CalendarDays aria-hidden="true" size={18} className="shrink-0 text-forest" />
          <span>
            Student deadline: <strong>{formatDate(option.date)}</strong>
            {option.passed && ' (passed)'}
          </span>
        </span>
        <SourceLink source={option.source} />
      </p>
    )
  }

  return (
    <div className="rounded-[1.25rem] border-2 border-rust/70 bg-rust-soft p-4">
      <p className="flex items-center gap-2 font-extrabold text-rust">
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-pill bg-surface">
          <TriangleAlert size={18} strokeWidth={2.4} />
        </span>
        Sources disagree on the student deadline
      </p>
      <ul className="mt-3 space-y-1.5 rounded-control bg-surface/80 p-3">
        {deadline.options.map((option) => (
          <li key={option.source.url} className="flex flex-wrap items-center gap-x-3">
            <span>
              {formatDate(option.date)}
              {option.passed ? ' (passed)' : ''}
            </span>
            <SourceLink source={option.source} />
          </li>
        ))}
      </ul>
      <p className="mt-3 font-bold">
        {deadline.recommended
          ? `Act by ${formatDate(deadline.recommended)}, the earliest date that has not passed.`
          : 'Every listed date has passed.'}{' '}
        Confirm with {confirmWith}.
      </p>
    </div>
  )
}
