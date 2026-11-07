import { Award, Banknote, ClockArrowLeft, FileText, RefreshCw, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/Card'
import { StatusBadge } from '@/components/StatusBadge'
import { StudentOnly } from '@/components/StudentOnly'
import { ownerLabel } from '@/components/TaskCard'
import { schemeById } from '@/data/schemes'
import { formatDate } from '@/domain/dates'
import type { Application, Student, Track } from '@/domain/types'
import { useGrantlyStore } from '@/store/useGrantlyStore'

const trackLabels: Record<Track, string> = {
  application: 'Application',
  award: 'Award',
  payment: 'Payment',
  renewal: 'Renewal',
}

const tracks = Object.keys(trackLabels) as Track[]

const trackIcons: Record<Track, LucideIcon> = {
  application: FileText,
  award: Award,
  payment: Banknote,
  renewal: RefreshCw,
}

function Timeline({ application }: { application: Application }) {
  const headingId = `timeline-${application.id}`
  const history = [...application.history].reverse()
  return (
    <Card aria-labelledby={headingId}>
      <h2 id={headingId} className="text-title font-extrabold">
        {schemeById(application.schemeId).shortName}, {application.academicYear}
      </h2>
      <p className="mt-2 inline-flex flex-wrap items-center gap-x-1 rounded-pill bg-paper px-3 py-1 text-small">
        Who acts next: <strong>{ownerLabel[application.owner]}</strong>
        {application.deadline && ` · Deadline ${formatDate(application.deadline)}`}
      </p>

      <ul
        className="relative mt-6 space-y-4 before:absolute before:top-7 before:bottom-7 before:left-[1.6875rem] before:w-[3px] before:rounded-pill before:bg-hairline"
        aria-label="Tracks"
      >
        {tracks.map((track) => {
          const state = application.tracks[track]
          const Icon = trackIcons[track]
          return (
            <li key={track} className="relative flex items-start gap-4">
              <span
                aria-hidden="true"
                className={`relative grid size-14 shrink-0 place-items-center rounded-pill ring-4 ring-surface ${
                  state
                    ? 'bg-forest text-white shadow-soft'
                    : 'border-2 border-dashed border-border bg-surface text-muted'
                }`}
              >
                <Icon size={26} strokeWidth={2.2} />
              </span>
              <div className={`min-w-0 flex-1 rounded-control p-3 ${state ? 'bg-forest-soft/50' : 'bg-paper'}`}>
                <p className="text-label font-extrabold tracking-wide text-muted uppercase">{trackLabels[track]}</p>
                {state ? (
                  <>
                    <p className="text-lg font-extrabold">{state.label}</p>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <StatusBadge basis={state.basis} />
                      <span className="text-small text-muted">{formatDate(state.date)}</span>
                    </span>
                  </>
                ) : (
                  <p className="font-semibold text-muted">Not started</p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <h3 className="mt-8 flex items-center gap-2 font-extrabold">
        <ClockArrowLeft aria-hidden="true" size={20} strokeWidth={2.4} className="text-forest" />
        History
      </h3>
      <ol className="mt-3 space-y-3">
        {history.map((entry) => (
          <li
            key={`${entry.date}-${entry.label}`}
            className="relative border-l-[3px] border-hairline pb-1 pl-5 before:absolute before:top-1.5 before:-left-[0.5625rem] before:size-3.5 before:rounded-pill before:border-[3px] before:border-surface before:bg-forest"
          >
            <p>
              <span className="font-extrabold">{formatDate(entry.date)}</span> · {trackLabels[entry.track]}:{' '}
              {entry.label}
            </p>
            <StatusBadge basis={entry.basis} />
            {entry.note && <p className="mt-1 text-small text-muted">{entry.note}</p>}
          </li>
        ))}
      </ol>
    </Card>
  )
}

function Funding({ student }: { student: Student }) {
  const applications = useGrantlyStore((state) => state.applications).filter(
    (application) => application.studentId === student.id,
  )
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {applications.map((application) => (
        <Timeline key={application.id} application={application} />
      ))}
    </div>
  )
}

/** The funding and renewal page: each application followed through award, payment and renewal as separate steps. */
export function Component() {
  return (
    <StudentOnly
      title="Funding and renewal"
      purpose="Follow each application through award, payment and renewal as separate steps, so one good status never hides a problem."
    >
      {(student) => <Funding student={student} />}
    </StudentOnly>
  )
}
