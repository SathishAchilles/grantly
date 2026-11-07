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

const statusLabel: Record<Task['status'], string> = {
  requested: 'Requested',
  acknowledged: 'Acknowledged',
  completed: 'Completed',
  'needs-clarification': 'Needs clarification',
}

interface TaskCardProps {
  task: Task
  viewer: 'student' | 'coordinator'
  children?: ReactNode
}

export function TaskCard({ task, viewer, children }: TaskCardProps) {
  const headingId = useId()
  const waiting = viewer === 'student' && task.owner !== 'student'
  return (
    <article aria-labelledby={headingId} className="rounded-card border border-hairline bg-surface p-5">
      <h3 id={headingId} className="text-lg font-semibold">
        {task.title}
      </h3>
      {waiting && (
        <p className="mt-1 font-medium text-forest">Your part is done. Waiting on: {ownerLabel[task.owner]}.</p>
      )}
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-small sm:grid-cols-[auto_1fr]">
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
