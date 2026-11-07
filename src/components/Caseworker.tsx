import { MessageSquareText } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { schemeById } from '../data/schemes'
import {
  NOTICE_MAX_LENGTH,
  planResponse,
  sampleNotices,
  type CaseworkerPlan,
  type ProposedAction,
} from '../domain/caseworker'
import { todayIso } from '../domain/dates'
import type { Application, Student } from '../domain/types'
import { useGrantlyStore } from '../store/useGrantlyStore'
import { Button } from './Button'
import { SourceLink } from './SourceLink'

const STEP_DELAY_MS = 300

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true

interface CaseworkerProps {
  student: Student
  applications: [Application, ...Application[]]
}

function ConfirmBar({ action, onDone, onCancel }: { action: ProposedAction; onDone: (message: string) => void; onCancel: () => void }) {
  const confirm = useGrantlyStore((state) => state.confirmCaseworkerAction)
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          confirm(action, todayIso())
          onDone(action.type === 'attach-document' ? 'Correction resubmitted.' : `Task created: ${action.task.title}.`)
        }}
      >
        Confirm
      </Button>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export function Caseworker({ student, applications }: CaseworkerProps) {
  const [applicationId, setApplicationId] = useState(applications[0].id)
  const [notice, setNotice] = useState('')
  const [plan, setPlan] = useState<CaseworkerPlan | null>(null)
  const [shown, setShown] = useState(0)
  const [message, setMessage] = useState('')
  const ids = { notice: useId(), application: useId(), hint: useId() }

  useEffect(() => {
    if (!plan || shown >= plan.steps.length) return
    const timer = setTimeout(() => setShown((count) => count + 1), STEP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [plan, shown])

  const read = (event: FormEvent) => {
    event.preventDefault()
    const application = applications.find((candidate) => candidate.id === applicationId) ?? applications[0]
    const next = planResponse(notice, student, application)
    setMessage('')
    setPlan(next)
    setShown(prefersReducedMotion() ? next.steps.length : 1)
  }

  const finished = plan !== null && shown >= plan.steps.length

  return (
    <section
      aria-labelledby="caseworker-heading"
      className="self-start rounded-card border-2 border-forest/80 bg-surface p-5 shadow-soft sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[1.1rem] bg-forest text-white shadow-soft">
          <MessageSquareText size={24} strokeWidth={2.2} />
        </span>
        <h2 id="caseworker-heading" className="text-title font-extrabold">
          Caseworker
        </h2>
      </div>
      <p className="mt-3 rounded-control bg-muted-soft px-3 py-2 text-small font-semibold text-muted">
        Reads a notice from a portal, email or letter and turns it into one task, using fixed rules.
      </p>

      <form onSubmit={read} className="mt-5 space-y-5">
        <div>
          <label htmlFor={ids.application} className="block font-bold">
            Application
          </label>
          <select
            id={ids.application}
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
            className="mt-1.5 min-h-12 w-full rounded-control border-2 border-border bg-paper px-3 font-semibold"
          >
            {applications.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {schemeById(candidate.schemeId).shortName}, {candidate.academicYear}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="font-bold">Try a sample notice</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sampleNotices.map((sample) => (
              <Button key={sample.label} variant="secondary" onClick={() => setNotice(sample.text)}>
                {sample.label}
              </Button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={ids.notice} className="block font-bold">
            Notice text
          </label>
          <textarea
            id={ids.notice}
            value={notice}
            maxLength={NOTICE_MAX_LENGTH}
            aria-describedby={ids.hint}
            onChange={(event) => setNotice(event.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-control border-2 border-border bg-paper p-3"
          />
          <p id={ids.hint} className="mt-1 text-small text-muted">
            Paste the message from the portal, email or letter. {notice.length} of {NOTICE_MAX_LENGTH} characters.
          </p>
        </div>

        <Button type="submit" disabled={notice.trim() === ''} className="w-full sm:w-auto">
          Read notice
        </Button>
      </form>

      {plan && (
        <div className="mt-6 rounded-[1.25rem] bg-forest-soft/60 p-4">
          <h3 className="font-extrabold">What the caseworker did</h3>
          <ol aria-live="polite" className="mt-2 list-decimal space-y-1.5 pl-6 marker:font-extrabold marker:text-forest-deep">
            {plan.steps.slice(0, shown).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {finished && (
            <div className="mt-4 space-y-3">
              <p className="font-extrabold">{plan.summary}</p>
              {plan.source && <SourceLink source={plan.source} />}
              {plan.action && (
                <ConfirmBar
                  action={plan.action}
                  onDone={(text) => {
                    setMessage(text)
                    setPlan(null)
                    setNotice('')
                  }}
                  onCancel={() => setPlan(null)}
                />
              )}
            </div>
          )}
        </div>
      )}

      <p role="status" className="mt-4 font-bold text-forest-deep">
        {message}
      </p>
    </section>
  )
}
