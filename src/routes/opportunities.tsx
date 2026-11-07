import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  CircleCheckBig,
  CircleHelp,
  CircleOff,
  FileSearch,
  GraduationCap,
  Search,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { ButtonLink } from '@/components/Button'
import { Card } from '@/components/Card'
import { DeadlineView } from '@/components/DeadlineView'
import { Money } from '@/components/Money'
import { OutcomeBadge } from '@/components/OutcomeBadge'
import { SourceLink } from '@/components/SourceLink'
import { StudentOnly } from '@/components/StudentOnly'
import { schemes } from '@/data/schemes'
import { todayIso } from '@/domain/dates'
import { filterSchemes, parseFitFilter, type FitFilter, type ScoredScheme } from '@/domain/discovery'
import { evaluateScheme, type Overall, type SchemeEvaluation } from '@/domain/eligibility'
import type { Scheme, Student } from '@/domain/types'
import { useGrantlyStore } from '@/store/useGrantlyStore'

const overallLabel: Record<Overall, string> = {
  'meets-listed-conditions': 'Meets every listed condition we can check.',
  'does-not-meet': 'Does not meet at least one listed condition.',
  'more-information-needed': 'More information is needed before we can say.',
}

const overallStyle: Record<Overall, { icon: LucideIcon; className: string }> = {
  'meets-listed-conditions': { icon: CircleCheckBig, className: 'bg-forest-soft text-forest-deep' },
  'does-not-meet': { icon: CircleOff, className: 'bg-rust-soft text-rust' },
  'more-information-needed': { icon: CircleHelp, className: 'bg-blue-soft text-blue' },
}

function Amount({ scheme, student }: { scheme: Scheme; student: Student }) {
  const amount = scheme.amountFor(student)
  if (amount.value === null || amount.source === null) {
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Wallet aria-hidden="true" size={18} className="shrink-0 text-forest" />
        <span>Amount: Not published by the provider</span>
        <SourceLink source={{ title: scheme.shortName, url: scheme.providerUrl }} label="Provider" />
      </p>
    )
  }
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Wallet aria-hidden="true" size={18} className="shrink-0 text-forest" />
      <span>
        Amount:{' '}
        <strong>
          <Money amount={amount.value} />
        </strong>{' '}
        {amount.basis}
      </span>
      <SourceLink source={amount.source} />
    </p>
  )
}

function SchemeCard({
  scheme,
  student,
  evaluation,
}: {
  scheme: Scheme
  student: Student
  evaluation: SchemeEvaluation
}) {
  const headingId = `scheme-${scheme.id}`
  const verdict = overallStyle[evaluation.overall]
  const VerdictIcon = verdict.icon
  return (
    <Card aria-labelledby={headingId} className="flex flex-col">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-[1.1rem] bg-peach text-ink"
        >
          <GraduationCap size={26} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-title leading-tight font-extrabold">
            {scheme.shortName}
          </h2>
          <p className="mt-0.5 text-small text-muted">{scheme.name}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-5 gap-y-1 rounded-control bg-paper p-4 text-small sm:grid-cols-[auto_1fr] [&>dd]:min-w-0 [&>dd]:break-words max-sm:[&>dd]:mb-2 [&>dt]:font-bold [&>dt]:text-muted">
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

      <div className="mt-5 space-y-3">
        <p
          className={
            evaluation.open ? 'font-semibold' : 'rounded-control bg-rust-soft px-3 py-2 font-extrabold text-rust'
          }
        >
          {evaluation.availability}
        </p>
        <Amount scheme={scheme} student={student} />
        <DeadlineView deadline={evaluation.deadline} confirmWith={scheme.confirmWith ?? scheme.owner} />
      </div>

      <h3 className="mt-7 flex items-center gap-2 font-extrabold">
        <FileSearch aria-hidden="true" size={20} strokeWidth={2.4} className="shrink-0 text-forest" />
        Conditions for {evaluation.applicantType} applicants
      </h3>
      <ul className="mt-3 space-y-2.5">
        {evaluation.results.map(({ rule, outcome }) => (
          <li key={rule.id} className="rounded-control border border-hairline bg-surface p-3.5">
            <p className="font-bold">{rule.label}</p>
            <OutcomeBadge kind={outcome.result} />
            <p className="text-small">{outcome.reason}</p>
            {outcome.ask && <p className="mt-1 text-small font-bold">Next: {outcome.ask}</p>}
            {rule.source && <SourceLink source={rule.source} />}
          </li>
        ))}
      </ul>

      <p className={`mt-5 flex items-start gap-2.5 rounded-control px-4 py-3 font-extrabold ${verdict.className}`}>
        <VerdictIcon aria-hidden="true" size={22} strokeWidth={2.4} className="mt-0.5 shrink-0" />
        {overallLabel[evaluation.overall]}
      </p>
      <p className="mt-2 text-small text-muted">
        Meeting these conditions does not guarantee an award. {scheme.owner} makes the decision.
      </p>
      {evaluation.open && (
        <ButtonLink to={`/readiness?scheme=${scheme.id}`} variant="secondary" className="mt-5 self-start">
          Check documents for {scheme.shortName}
        </ButtonLink>
      )}
    </Card>
  )
}

const fitOptions: { value: FitFilter; label: string }[] = [
  { value: 'all', label: 'All schemes' },
  { value: 'possible', label: 'Open to me and not ruled out' },
  { value: 'meets', label: 'Meets every listed condition' },
]

const SEARCH_MAX_LENGTH = 80

function Opportunities({ student }: { student: Student }) {
  const applications = useGrantlyStore((state) => state.applications)
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH)
  const fit = parseFitFilter(params.get('show'))

  const scored = useMemo<ScoredScheme[]>(
    () => schemes.map((scheme) => ({ scheme, evaluation: evaluateScheme(scheme, student, todayIso(), applications) })),
    [student, applications],
  )
  const visible = useMemo(() => filterSchemes(scored, query, fit), [scored, query, fit])

  const update = (key: 'q' | 'show', value: string) => {
    const next = new URLSearchParams(params)
    if (value === '' || (key === 'show' && value === 'all')) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  return (
    <>
      <p className="mb-6 max-w-3xl rounded-card border border-hairline bg-surface px-5 py-4 shadow-soft">
        Showing {student.name}: {student.course}, year {student.studyYear}. Domicile {student.domicile.state}; studying
        in {student.institution.place.city}, {student.institution.place.state}.
      </p>
      <search className="mb-6 grid gap-4 rounded-card border border-hairline bg-surface p-5 shadow-soft sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="scheme-search" className="font-bold">
            Search schemes
          </label>
          <div className="relative mt-1.5">
            <Search aria-hidden="true" size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              id="scheme-search"
              type="search"
              value={query}
              maxLength={SEARCH_MAX_LENGTH}
              onChange={(event) => update('q', event.target.value)}
              placeholder="Name, provider or who it is for"
              className="min-h-12 w-full rounded-control border-2 border-border bg-paper py-2 pr-3 pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="scheme-fit" className="font-bold">
            Show
          </label>
          <select
            id="scheme-fit"
            value={fit}
            onChange={(event) => update('show', event.target.value)}
            className="mt-1.5 min-h-12 w-full rounded-control border-2 border-border bg-paper px-3"
          >
            {fitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <p role="status" className="text-small font-semibold text-muted sm:col-span-2">
          {visible.length} of {scored.length} schemes shown
        </p>
      </search>
      {visible.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface px-5 py-6 text-center">
          No schemes match. Try a different search or choose All schemes.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {visible.map(({ scheme, evaluation }) => (
            <SchemeCard key={scheme.id} scheme={scheme} student={student} evaluation={evaluation} />
          ))}
        </div>
      )}
    </>
  )
}

/** The opportunities page: which schemes fit the student, condition by condition, with the official source for each. */
export function Component() {
  return (
    <StudentOnly
      title="Opportunities"
      purpose="See which schemes fit, condition by condition, with the official source for each."
    >
      {(student) => <Opportunities student={student} />}
    </StudentOnly>
  )
}
