import { TriangleAlert } from 'lucide-react'
import { formatDate } from '../domain/dates'
import type { StudentDeadline } from '../domain/eligibility'
import { SourceLink } from './SourceLink'

export function DeadlineView({ deadline, confirmWith }: { deadline: StudentDeadline; confirmWith: string }) {
  if (deadline.status === 'none') return <p>{deadline.note}</p>

  if (deadline.status === 'single') {
    const { option } = deadline
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          Student deadline: <strong>{formatDate(option.date)}</strong>
          {option.passed && ' (passed)'}
        </span>
        <SourceLink source={option.source} />
      </p>
    )
  }

  return (
    <div className="rounded-card border border-rust p-4">
      <p className="flex items-center gap-2 font-semibold text-rust">
        <TriangleAlert aria-hidden="true" size={18} />
        Sources disagree on the student deadline
      </p>
      <ul className="mt-2 space-y-1">
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
      <p className="mt-2 font-medium">
        {deadline.recommended
          ? `Act by ${formatDate(deadline.recommended)}, the earliest date that has not passed.`
          : 'Every listed date has passed.'}{' '}
        Confirm with {confirmWith}.
      </p>
    </div>
  )
}
