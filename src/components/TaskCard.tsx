import { BadgeCheck, Building2, Hourglass, Landmark, PencilLine, UsersRound, type LucideIcon } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { formatDate } from '../domain/dates'
import type { ActionOwner, Task } from '../domain/types'
import { Fact } from './Fact'

export const ownerLabel: Record<ActionOwner, string> = {
  student: 'Student',
  institution: 'College',
  family: 'Family',
  bank: 'Bank',
  provider: 'Scholarship provider',
}

const ownerIcon: Record<ActionOwner, LucideIcon> = {
  student: PencilLine,
  institution: Building2,
  family: UsersRound,
  bank: Landmark,
  provider: BadgeCheck,
}

const statusLabel: Record<Task['status'], string> = {
  requested: 'Requested',
  acknowledged: 'Acknowledged',
  completed: 'Completed',
  'needs-clarification': 'Needs clarification',
}

interface TaskCardProps {
  task: Task
  viewer: 'student' | 'coordinator'
  /** Gives the card the larger "do this next" treatment. Purely visual. */
  featured?: boolean
  children?: ReactNode
}

export function TaskCard({ task, viewer, featured = false, children }: TaskCardProps) {
  const headingId = useId()
  const waiting = viewer === 'student' && task.owner !== 'student'
  const Icon = ownerIcon[task.owner]
  return (
    <article
      aria-labelledby={headingId}
      className={`relative overflow-hidden rounded-card bg-surface p-5 ${
        featured
          ? 'border-2 border-marigold bg-linear-to-br from-marigold-soft via-surface to-peach shadow-lift sm:p-7'
          : 'border border-hairline shadow-soft'
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className={`grid shrink-0 place-items-center rounded-[1.1rem] ${
            featured ? 'size-14 bg-marigold text-ink shadow-soft' : 'size-12 bg-forest-soft text-forest-deep'
          }`}
        >
          <Icon size={featured ? 30 : 24} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={headingId} className={`font-extrabold leading-snug ${featured ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
            {task.title}
          </h3>
          {waiting && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-forest-soft py-1 pr-3 pl-2 text-small font-bold text-forest-deep">
              <Hourglass aria-hidden="true" size={16} strokeWidth={2.4} className="shrink-0" />
              Your part is done. Waiting on: {ownerLabel[task.owner]}.
            </p>
          )}
        </div>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-small sm:grid-cols-[auto_1fr] [&>dd]:min-w-0 [&>dd]:break-words [&>dt]:font-bold [&>dt]:text-muted max-sm:[&>dd]:mb-1 max-sm:[&>dt]:-mb-2">
        <Fact label="Owner">{ownerLabel[task.owner]}</Fact>
        <Fact label="Student">{task.studentName}</Fact>
        <Fact label="Deadline">{task.deadline ? formatDate(task.deadline) : 'No published deadline'}</Fact>
        <Fact label="Why">{task.requirement}</Fact>
        <Fact label="Status">{statusLabel[task.status]}</Fact>
      </dl>
      {children}
    </article>
  )
}
