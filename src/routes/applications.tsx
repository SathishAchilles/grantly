import { Card } from '../components/Card'
import { Caseworker } from '../components/Caseworker'
import { Fact } from '../components/Fact'
import { StatusBadge } from '../components/StatusBadge'
import { StudentOnly } from '../components/StudentOnly'
import { ownerLabel } from '../components/TaskCard'
import { schemeById } from '../data/schemes'
import { formatDate } from '../domain/dates'
import type { Application, Student } from '../domain/types'
import { useGrantlyStore } from '../store/useGrantlyStore'

function ApplicationCard({ application }: { application: Application }) {
  const scheme = schemeById(application.schemeId)
  const status = application.tracks.application
  const headingId = `application-${application.id}`
  return (
    <Card aria-labelledby={headingId}>
      <h2 id={headingId} className="text-title font-semibold">
        {scheme.shortName}, {application.academicYear}
      </h2>
      <p className="mt-1 flex flex-wrap items-center gap-x-3">
        <strong>{status.label}</strong>
        <StatusBadge basis={status.basis} />
      </p>
      <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
        <Fact label="Who acts next">{ownerLabel[application.owner]}</Fact>
        <Fact label="Next step">{application.nextAction}</Fact>
        <Fact label="Deadline">
          {application.deadline ? formatDate(application.deadline) : 'None published'}
          {application.deadlineNote && <span className="block text-small text-muted">{application.deadlineNote}</span>}
        </Fact>
      </dl>
      {application.notice && (
        <figure className="mt-4 rounded-control border-l-4 border-rust bg-paper p-3">
          <figcaption className="text-small font-semibold">Notice from the provider</figcaption>
          <blockquote>{application.notice}</blockquote>
        </figure>
      )}
    </Card>
  )
}

function Applications({ student }: { student: Student }) {
  const all = useGrantlyStore((state) => state.applications)
  const mine = all.filter((application) => application.studentId === student.id)
  const [first, ...rest] = mine.filter((application) => application.academicYear === '2026-27')
  if (!first) return <p>No applications for 2026-27 yet. Start from Opportunities.</p>
  const active: [Application, ...Application[]] = [first, ...rest]
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-6">
        {active.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
      <Caseworker key={student.id} student={student} applications={active} />
    </div>
  )
}

export function Component() {
  return (
    <StudentOnly title="Applications" purpose="Know what is missing, who has to act next, and turn confusing notices into one clear task.">
      {(student) => <Applications student={student} />}
    </StudentOnly>
  )
}
