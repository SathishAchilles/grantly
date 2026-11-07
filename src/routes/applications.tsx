import { CalendarClock, Mail, MapPin, Signpost, UserRoundCheck } from 'lucide-react'
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

const step = 'relative min-h-12 pt-3 pl-16 font-extrabold'
const stepValue =
  'relative pb-5 pl-16 before:absolute before:-top-1 before:bottom-0 before:left-[1.4375rem] before:w-[3px] before:rounded-pill before:bg-hairline last:pb-0 last:before:hidden'
const stepIcon = 'absolute top-0 left-0 grid size-12 place-items-center rounded-pill ring-4 ring-surface'

function ApplicationCard({ application }: { application: Application }) {
  const scheme = schemeById(application.schemeId)
  const status = application.tracks.application
  const headingId = `application-${application.id}`
  return (
    <Card aria-labelledby={headingId}>
      <h2 id={headingId} className="text-title font-extrabold">
        {scheme.shortName}, {application.academicYear}
      </h2>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-control bg-paper px-4 py-3">
        <MapPin aria-hidden="true" size={20} strokeWidth={2.4} className="shrink-0 text-forest" />
        <strong className="text-lg">{status.label}</strong>
        <StatusBadge basis={status.basis} />
      </p>
      <dl className="mt-5">
        <Fact
          label="Who acts next"
          termClassName={step}
          valueClassName={stepValue}
          icon={
            <span aria-hidden="true" className={`${stepIcon} bg-forest-soft text-forest-deep`}>
              <UserRoundCheck size={24} strokeWidth={2.2} />
            </span>
          }
        >
          {ownerLabel[application.owner]}
        </Fact>
        <Fact
          label="Next step"
          termClassName={step}
          valueClassName={stepValue}
          icon={
            <span aria-hidden="true" className={`${stepIcon} bg-marigold text-ink`}>
              <Signpost size={24} strokeWidth={2.2} />
            </span>
          }
        >
          {application.nextAction}
        </Fact>
        <Fact
          label="Deadline"
          termClassName={step}
          valueClassName={stepValue}
          icon={
            <span aria-hidden="true" className={`${stepIcon} bg-blue-soft text-blue`}>
              <CalendarClock size={24} strokeWidth={2.2} />
            </span>
          }
        >
          {application.deadline ? formatDate(application.deadline) : 'None published'}
          {application.deadlineNote && <span className="mt-0.5 block text-small text-muted">{application.deadlineNote}</span>}
        </Fact>
      </dl>
      {application.notice && (
        <figure className="mt-5 rounded-[1.25rem] border-2 border-rust/60 bg-rust-soft p-4">
          <figcaption className="flex items-center gap-2 text-small font-extrabold text-rust">
            <Mail aria-hidden="true" size={18} strokeWidth={2.4} className="shrink-0" />
            Notice from the provider
          </figcaption>
          <blockquote className="mt-2 border-l-4 border-rust/40 pl-3 leading-relaxed">{application.notice}</blockquote>
        </figure>
      )}
    </Card>
  )
}

function Applications({ student }: { student: Student }) {
  const all = useGrantlyStore((state) => state.applications)
  const mine = all.filter((application) => application.studentId === student.id)
  const [first, ...rest] = mine.filter((application) => application.academicYear === '2026-27')
  if (!first) return <p className="rounded-card border border-hairline bg-surface p-5 shadow-soft">No applications for 2026-27 yet. Start from Opportunities.</p>
  const active: [Application, ...Application[]] = [first, ...rest]
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
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
