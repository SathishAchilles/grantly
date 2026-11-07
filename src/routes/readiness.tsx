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
      <h2 id={headingId} className="text-title font-semibold">
        {scheme.shortName}
      </h2>
      <p className="font-medium">
        {ready} of {results.length} documents ready
      </p>
      <ul className="mt-4 space-y-3">
        {results.map(({ requirement, result, guidance }) => (
          <li key={requirement.id} className="border-l-2 border-hairline pl-3">
            <p className="font-medium">{requirement.label}</p>
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
    <div className="space-y-8">
      <section aria-labelledby="documents-heading">
        <h2 id="documents-heading" className="text-title font-semibold">
          Your documents
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {student.documents.map((doc) => (
            <li key={doc.id} className="rounded-control border border-hairline bg-surface p-3">
              <p className="font-medium">
                {doc.label}
                {doc.academicYear && `, ${doc.academicYear}`}
              </p>
              <p className="text-small text-muted">Issued by {doc.issuer}</p>
              <StatusBadge basis={doc.basis} />
            </li>
          ))}
        </ul>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
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
