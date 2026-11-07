import { ButtonLink } from '../components/Button'
import { Card } from '../components/Card'
import { DeadlineView } from '../components/DeadlineView'
import { Money } from '../components/Money'
import { OutcomeBadge } from '../components/OutcomeBadge'
import { SourceLink } from '../components/SourceLink'
import { StudentOnly } from '../components/StudentOnly'
import { schemes } from '../data/schemes'
import { todayIso } from '../domain/dates'
import { evaluateScheme, type Overall } from '../domain/eligibility'
import type { Scheme, Student } from '../domain/types'

const overallLabel: Record<Overall, string> = {
  'meets-listed-conditions': 'Meets every listed condition we can check.',
  'does-not-meet': 'Does not meet at least one listed condition.',
  'more-information-needed': 'More information is needed before we can say.',
}

function Amount({ scheme, student }: { scheme: Scheme; student: Student }) {
  const amount = scheme.amountFor(student)
  if (amount.value === null || amount.source === null) {
    return (
      <p className="flex flex-wrap items-center gap-x-3">
        <span>Amount: Not published by the provider</span>
        <SourceLink source={{ title: scheme.shortName, url: scheme.providerUrl }} label="Provider" />
      </p>
    )
  }
  return (
    <p className="flex flex-wrap items-center gap-x-3">
      <span>
        Amount: <strong><Money amount={amount.value} /></strong> {amount.basis}
      </span>
      <SourceLink source={amount.source} />
    </p>
  )
}

function SchemeCard({ scheme, student }: { scheme: Scheme; student: Student }) {
  const evaluation = evaluateScheme(scheme, student, todayIso())
  const headingId = `scheme-${scheme.id}`
  return (
    <Card aria-labelledby={headingId}>
      <h2 id={headingId} className="text-title font-semibold">
        {scheme.shortName}
      </h2>
      <p className="text-small text-muted">{scheme.name}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-1 text-small sm:grid-cols-[auto_1fr]">
        <dt className="font-semibold">Run by</dt>
        <dd>{scheme.owner}</dd>
        <dt className="font-semibold">Funded by</dt>
        <dd>{scheme.fundingAuthority}</dd>
        <dt className="font-semibold">For</dt>
        <dd>{scheme.applicantGroup}</dd>
        <dt className="font-semibold">Where</dt>
        <dd>{scheme.geography}</dd>
        <dt className="font-semibold">Apply on</dt>
        <dd>{scheme.portal}</dd>
        <dt className="font-semibold">Verified by</dt>
        <dd>{scheme.verificationAuthority}</dd>
        <dt className="font-semibold">Paid by</dt>
        <dd>{scheme.paymentRoute}</dd>
      </dl>

      <div className="mt-4 space-y-2">
        <p className={evaluation.open ? '' : 'font-semibold text-rust'}>{evaluation.availability}</p>
        <Amount scheme={scheme} student={student} />
        <DeadlineView deadline={evaluation.deadline} confirmWith={scheme.confirmWith ?? scheme.owner} />
      </div>

      <h3 className="mt-6 font-semibold">Conditions for {student.applicantType} applicants</h3>
      <ul className="mt-2 space-y-3">
        {evaluation.results.map(({ rule, outcome }) => (
          <li key={rule.id} className="border-l-2 border-hairline pl-3">
            <p className="font-medium">{rule.label}</p>
            <OutcomeBadge kind={outcome.result} />
            <p className="text-small">{outcome.reason}</p>
            {outcome.ask && <p className="text-small font-medium">Next: {outcome.ask}</p>}
            {rule.source && <SourceLink source={rule.source} />}
          </li>
        ))}
      </ul>

      <p className="mt-4 font-semibold">{overallLabel[evaluation.overall]}</p>
      <p className="text-small text-muted">
        Meeting these conditions does not guarantee an award. {scheme.owner} makes the decision.
      </p>
      {evaluation.open && (
        <ButtonLink to="/readiness" variant="secondary" className="mt-4">
          Check documents for {scheme.shortName}
        </ButtonLink>
      )}
    </Card>
  )
}

function Opportunities({ student }: { student: Student }) {
  return (
    <>
      <p className="mb-6 max-w-3xl">
        Showing {student.name}: {student.course}, year {student.studyYear}, {student.applicantType} applicant. Domicile{' '}
        {student.domicile.state}; studying in {student.institution.place.city}, {student.institution.place.state}.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {schemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} student={student} />
        ))}
      </div>
    </>
  )
}

export function Component() {
  return (
    <StudentOnly title="Opportunities" purpose="See which schemes fit, condition by condition, with the official source for each.">
      {(student) => <Opportunities student={student} />}
    </StudentOnly>
  )
}
