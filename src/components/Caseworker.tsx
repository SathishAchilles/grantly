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
    <section aria-labelledby="caseworker-heading" className="rounded-card border border-forest bg-surface p-6">
      <h2 id="caseworker-heading" className="text-title font-semibold">
        Caseworker
      </h2>
      <p className="mt-1 text-small font-medium text-muted">
        Reads a notice from a portal, email or letter and turns it into one task, using fixed rules.
      </p>

      <form onSubmit={read} className="mt-4 space-y-4">
        <div>
          <label htmlFor={ids.application} className="block font-medium">
            Application
          </label>
          <select
            id={ids.application}
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-control border border-border bg-paper px-3"
          >
            {applications.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {schemeById(candidate.schemeId).shortName}, {candidate.academicYear}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="font-medium">Try a sample notice</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {sampleNotices.map((sample) => (
              <Button key={sample.label} variant="secondary" onClick={() => setNotice(sample.text)}>
                {sample.label}
              </Button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={ids.notice} className="block font-medium">
            Notice text
          </label>
          <textarea
            id={ids.notice}
            value={notice}
            maxLength={NOTICE_MAX_LENGTH}
            aria-describedby={ids.hint}
            onChange={(event) => setNotice(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-control border border-border bg-paper p-3"
          />
          <p id={ids.hint} className="text-small text-muted">
            Paste the message from the portal, email or letter. {notice.length} of {NOTICE_MAX_LENGTH} characters.
          </p>
        </div>

        <Button type="submit" disabled={notice.trim() === ''}>
          Read notice
        </Button>
      </form>

      {plan && (
        <div className="mt-6">
          <h3 className="font-semibold">What the caseworker did</h3>
          <ol aria-live="polite" className="mt-2 list-decimal space-y-1 pl-5">
            {plan.steps.slice(0, shown).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {finished && (
            <div className="mt-4 space-y-3">
              <p className="font-semibold">{plan.summary}</p>
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

      <p role="status" className="mt-4 font-medium text-forest">
        {message}
      </p>
    </section>
  )
}
