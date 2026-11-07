import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { StudentOnly } from '../components/StudentOnly'
import { ownerLabel } from '../components/TaskCard'
import { schemeById } from '../data/schemes'
import { formatDate } from '../domain/dates'
import type { Application, Student, Track } from '../domain/types'
import { useGrantlyStore } from '../store/useGrantlyStore'

const trackLabels: Record<Track, string> = {
  application: 'Application',
  award: 'Award',
  payment: 'Payment',
  renewal: 'Renewal',
}

const tracks = Object.keys(trackLabels) as Track[]

function Timeline({ application }: { application: Application }) {
  const headingId = `timeline-${application.id}`
  const history = [...application.history].reverse()
  return (
    <Card aria-labelledby={headingId}>
      <h2 id={headingId} className="text-title font-semibold">
        {schemeById(application.schemeId).shortName}, {application.academicYear}
      </h2>
      <p className="text-small">
        Who acts next: <strong>{ownerLabel[application.owner]}</strong>
        {application.deadline && ` · Deadline ${formatDate(application.deadline)}`}
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2" aria-label="Tracks">
        {tracks.map((track) => {
          const state = application.tracks[track]
          return (
            <li key={track} className="rounded-control border border-hairline p-3">
              <p className="text-label font-semibold uppercase tracking-wide text-muted">{trackLabels[track]}</p>
              {state ? (
                <>
                  <p className="font-semibold">{state.label}</p>
                  <StatusBadge basis={state.basis} />
                  <p className="text-small text-muted">{formatDate(state.date)}</p>
                </>
              ) : (
                <p className="text-muted">Not started</p>
              )}
            </li>
          )
        })}
      </ul>

      <h3 className="mt-6 font-semibold">History</h3>
      <ol className="mt-2 space-y-2">
        {history.map((entry) => (
          <li key={`${entry.date}-${entry.label}`} className="border-l-2 border-hairline pl-3">
            <p>
              <span className="font-medium">{formatDate(entry.date)}</span> · {trackLabels[entry.track]}: {entry.label}
            </p>
            <StatusBadge basis={entry.basis} />
            {entry.note && <p className="text-small text-muted">{entry.note}</p>}
          </li>
        ))}
      </ol>
    </Card>
  )
}

function Funding({ student }: { student: Student }) {
  const applications = useGrantlyStore((state) => state.applications).filter((application) => application.studentId === student.id)
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {applications.map((application) => (
        <Timeline key={application.id} application={application} />
      ))}
    </div>
  )
}

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
