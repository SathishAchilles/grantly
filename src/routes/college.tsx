import { Building2, UserRoundSearch } from 'lucide-react'
import { useActivePerson } from '@/hooks/useActivePerson'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { TaskCard } from '@/components/TaskCard'
import { byDeadline, todayIso } from '@/domain/dates'
import type { Coordinator } from '@/domain/types'
import { useGrantlyStore } from '@/store/useGrantlyStore'

function Queue({ coordinator }: { coordinator: Coordinator }) {
  const tasks = useGrantlyStore((state) => state.tasks)
  const setTaskStatus = useGrantlyStore((state) => state.setTaskStatus)
  const queue = tasks
    .filter((task) => task.institutionId === coordinator.institution.id && task.owner === 'institution')
    .sort(byDeadline)

  return (
    <>
      <p className="mb-8 flex max-w-3xl items-start gap-3 rounded-card border border-hairline bg-surface px-5 py-4 shadow-soft">
        <Building2 aria-hidden="true" size={24} strokeWidth={2.2} className="mt-0.5 shrink-0 text-forest" />
        {coordinator.name}, {coordinator.title}, {coordinator.institution.name}. Nearest deadline first.
      </p>
      <h2 className="mb-4 text-title font-extrabold">Waiting on your college</h2>
      {queue.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-5 shadow-soft">No tasks are waiting on your college.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          {queue.map((task) => (
            <TaskCard key={task.id} task={task} viewer="coordinator">
              <div className="mt-5 flex flex-wrap gap-2 border-t border-hairline pt-4">
                <Button variant="secondary" disabled={task.status !== 'requested'} onClick={() => setTaskStatus(task.id, 'acknowledged', todayIso())}>
                  Acknowledge
                </Button>
                <Button disabled={task.status === 'completed'} onClick={() => setTaskStatus(task.id, 'completed', todayIso())}>
                  Mark complete
                </Button>
                <Button
                  variant="secondary"
                  disabled={task.status === 'completed' || task.status === 'needs-clarification'}
                  onClick={() => setTaskStatus(task.id, 'needs-clarification', todayIso())}
                >
                  Needs clarification
                </Button>
              </div>
            </TaskCard>
          ))}
        </div>
      )}
    </>
  )
}

export function Component() {
  const person = useActivePerson()
  return (
    <>
      <PageHeader title="College desk" purpose="One shared queue of what your college owes its students, with the reason for each request." />
      {person.role === 'coordinator' ? (
        <Queue coordinator={person} />
      ) : (
        <p className="flex max-w-2xl items-start gap-3 rounded-card border border-hairline bg-surface p-5 shadow-soft">
          <UserRoundSearch aria-hidden="true" size={26} strokeWidth={2.2} className="shrink-0 text-forest" />
          College desk is for scholarship coordinators. Choose Priya Nair in "Viewing as" to see it.</p>
      )}
    </>
  )
}
