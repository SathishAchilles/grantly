import { FileText, FolderCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Card } from '@/components/Card'
import { OutcomeBadge } from '@/components/OutcomeBadge'
import { SourceLink } from '@/components/SourceLink'
import { StatusBadge } from '@/components/StatusBadge'
import { StudentOnly } from '@/components/StudentOnly'
import { schemes } from '@/data/schemes'
import { applicantTypeFor } from '@/domain/eligibility'
import { evaluateReadiness, summarizeReadiness } from '@/domain/readiness'
import type { Application, Scheme, Student } from '@/domain/types'
import { useGrantlyStore } from '@/store/useGrantlyStore'

function ProgrammeReadiness({
  scheme,
  student,
  applications,
}: {
  scheme: Scheme
  student: Student
  applications: Application[]
}) {
  const results = evaluateReadiness(scheme, student, applications)
  const { required, ready, unresolved, skipped } = summarizeReadiness(results)
  const applicantType = applicantTypeFor(scheme, student, applications)
  const headingId = `ready-${scheme.id}`
  return (
    <Card aria-labelledby={headingId}>
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-[1.1rem] bg-peach text-ink"
        >
          <FolderCheck size={26} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="text-title leading-tight font-extrabold">
            {scheme.shortName}
          </h2>
          <p className="font-bold text-muted">
            {ready} of {required} required documents ready
          </p>
          <p className="text-small text-muted">
            Checked for {applicantType} applicants, {scheme.academicYear}.
            {unresolved > 0 && ` ${unresolved} to confirm.`}
            {skipped > 0 && ` Conditional documents that do not apply to you: ${skipped}.`}
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="mt-4 flex gap-1.5">
        {results
          .filter(({ result }) => result !== 'not-applicable')
          .map(({ requirement, result }) => (
            <span
              key={requirement.id}
              className={`h-2.5 flex-1 rounded-pill ${result === 'satisfied' || result === 'alternative' ? 'bg-forest' : 'bg-rust-soft'}`}
            />
          ))}
      </div>
      <ul className="mt-5 space-y-2.5">
        {results.map(({ requirement, result, guidance, conditional }) => (
          <li key={requirement.id} className="rounded-control border border-hairline p-3.5">
            <p className="font-bold">{requirement.label}</p>
            {conditional && <p className="text-small font-bold text-muted">Only if this applies to you</p>}
            {result === 'not-applicable' ? null : <OutcomeBadge kind={result} />}
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
  const applications = useGrantlyStore((state) => state.applications)
  const [searchParams] = useSearchParams()
  const open = schemes.filter(
    (scheme) => scheme.openFor.includes(applicantTypeFor(scheme, student, applications)) && scheme.evidence.length > 0,
  )
  const chosen = open.find((scheme) => scheme.id === searchParams.get('scheme'))
  const shown = chosen ? [chosen] : open
  return (
    <div className="space-y-10">
      <section aria-labelledby="documents-heading">
        <h2 id="documents-heading" className="text-title font-extrabold">
          Your documents
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {student.documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-start gap-3 rounded-card border border-hairline bg-surface p-4 shadow-soft"
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-control bg-forest-soft text-forest-deep"
              >
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
      <nav aria-label="Programme">
        <ul className="flex flex-wrap gap-2">
          {[
            { id: null, name: 'All programmes' },
            ...open.map((scheme) => ({ id: scheme.id, name: scheme.shortName })),
          ].map(({ id, name }) => (
            <li key={name}>
              <Link
                to={{ search: id ? `?${new URLSearchParams({ scheme: id })}` : '' }}
                aria-current={(chosen?.id ?? null) === id ? 'page' : undefined}
                className="inline-block rounded-pill border border-hairline px-4 py-2 font-bold aria-[current=page]:bg-forest-soft"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {shown.map((scheme) => (
          <ProgrammeReadiness key={scheme.id} scheme={scheme} student={student} applications={applications} />
        ))}
      </div>
    </div>
  )
}

/** The readiness page: the student's documents checked against each programme's own rules, including accepted alternatives. */
export function Component() {
  return (
    <StudentOnly
      title="Readiness"
      purpose="Check your documents against each programme's own rules, including accepted alternatives."
    >
      {(student) => <Readiness student={student} />}
    </StudentOnly>
  )
}
