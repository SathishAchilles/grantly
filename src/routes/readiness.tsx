import { FileText, FolderCheck } from 'lucide-react'
import { Card } from '../components/Card'
import { OutcomeBadge } from '../components/OutcomeBadge'
import { SourceLink } from '../components/SourceLink'
import { StatusBadge } from '../components/StatusBadge'
import { StudentOnly } from '../components/StudentOnly'
import { schemes } from '../data/schemes'
import { evaluateReadiness } from '../domain/readiness'
import type { Scheme, Student } from '../domain/types'

function ProgrammeReadiness({ scheme, student }: { scheme: Scheme; student: Student }) {
  const results = evaluateReadiness(scheme, student)
  const ready = results.filter((result) => result.result === 'satisfied' || result.result === 'alternative').length
  const headingId = `ready-${scheme.id}`
  return (
    <Card aria-labelledby={headingId}>
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[1.1rem] bg-peach text-ink">
          <FolderCheck size={26} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="text-title leading-tight font-extrabold">
            {scheme.shortName}
          </h2>
          <p className="font-bold text-muted">
            {ready} of {results.length} documents ready
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="mt-4 flex gap-1.5">
        {results.map(({ requirement, result }) => (
          <span
            key={requirement.id}
            className={`h-2.5 flex-1 rounded-pill ${result === 'satisfied' || result === 'alternative' ? 'bg-forest' : 'bg-rust-soft'}`}
          />
        ))}
      </div>
      <ul className="mt-5 space-y-2.5">
        {results.map(({ requirement, result, guidance }) => (
          <li key={requirement.id} className="rounded-control border border-hairline p-3.5">
            <p className="font-bold">{requirement.label}</p>
            <OutcomeBadge kind={result} />
            <p className="text-small">{guidance}</p>
            <p className="text-small text-muted">{requirement.note}</p>
            <SourceLink source={requirement.source} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Readiness({ student }: { student: Student }) {
  const open = schemes.filter((scheme) => scheme.openFor.includes(student.applicantType) && scheme.evidence.length > 0)
  return (
    <div className="space-y-10">
      <section aria-labelledby="documents-heading">
        <h2 id="documents-heading" className="text-title font-extrabold">
          Your documents
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {student.documents.map((doc) => (
            <li key={doc.id} className="flex items-start gap-3 rounded-card border border-hairline bg-surface p-4 shadow-soft">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-control bg-forest-soft text-forest-deep">
                <FileText size={22} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="font-bold">
                  {doc.label}
                  {doc.academicYear && `, ${doc.academicYear}`}
                </p>
                <p className="text-small text-muted">Issued by {doc.issuer}</p>
                <StatusBadge basis={doc.basis} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {open.map((scheme) => (
          <ProgrammeReadiness key={scheme.id} scheme={scheme} student={student} />
        ))}
      </div>
    </div>
  )
}

export function Component() {
  return (
    <StudentOnly title="Readiness" purpose="Check your documents against each programme's own rules, including accepted alternatives.">
      {(student) => <Readiness student={student} />}
    </StudentOnly>
  )
}
