import { CircleCheck, CircleMinus, Mail, RefreshCw, ShieldAlert, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { mailbox } from '@/data/emails'
import { formatDate, todayIso } from '@/domain/dates'
import { readEmail, type EmailOutcome } from '@/domain/email'
import type { Student } from '@/domain/types'
import { useGrantlyStore } from '@/store/useGrantlyStore'
import { Button } from './Button'

const outcomeBadges: Record<EmailOutcome['kind'], { label: string; icon: LucideIcon; className: string }> = {
  update: { label: 'Will update', icon: RefreshCw, className: 'text-forest' },
  'up-to-date': { label: 'Already up to date', icon: CircleCheck, className: 'text-blue' },
  ignored: { label: 'Ignored', icon: CircleMinus, className: 'text-muted' },
  suspicious: { label: 'Suspected scam', icon: ShieldAlert, className: 'text-rust' },
}

function OutcomeItem({ outcome }: { outcome: EmailOutcome }) {
  const { label, icon: Icon, className } = outcomeBadges[outcome.kind]
  return (
    <li className="rounded-control border border-hairline bg-paper p-3">
      <p className="font-medium">{outcome.email.subject}</p>
      <p className="text-small text-muted">
        {outcome.email.from} · {formatDate(outcome.email.receivedOn)}
      </p>
      <p className={`mt-1 inline-flex items-center gap-1.5 text-small font-semibold ${className}`}>
        <Icon aria-hidden="true" size={16} />
        {label}
      </p>
      <p className="text-small">{outcome.summary}</p>
    </li>
  )
}

/** Reads the student's mailbox and shows what each email would change, so application statuses are updated only after the student agrees and suspected scams are flagged instead of acted on. */
export function EmailSync({ student }: { student: Student }) {
  const applications = useGrantlyStore((state) => state.applications)
  const tasks = useGrantlyStore((state) => state.tasks)
  const processed = useGrantlyStore((state) => state.processedEmailIds)
  const applyEmailUpdates = useGrantlyStore((state) => state.applyEmailUpdates)
  const [outcomes, setOutcomes] = useState<EmailOutcome[] | null>(null)
  const [message, setMessage] = useState('')

  const fetchEmails = () => {
    setMessage('')
    setOutcomes(
      mailbox
        .filter((email) => email.studentId === student.id && !processed.includes(email.id))
        .map((email) => readEmail(email, student, applications, tasks)),
    )
  }

  const updates = outcomes?.filter((outcome) => outcome.kind === 'update').length ?? 0

  return (
    <section aria-labelledby="emails-heading" className="rounded-card border border-hairline bg-surface p-6">
      <h2 id="emails-heading" className="flex items-center gap-2 text-title font-semibold">
        <Mail aria-hidden="true" size={22} className="text-forest" />
        Application emails
      </h2>
      <p className="mt-1 text-small text-muted">
        From Gmail. Bring in the latest emails about your applications and funding.
      </p>

      <Button variant="secondary" className="mt-4" onClick={fetchEmails}>
        Fetch application emails
      </Button>

      {outcomes && (
        <div className="mt-4">
          {outcomes.length === 0 ? (
            <p>No new application emails.</p>
          ) : (
            <>
              <ul className="space-y-2" aria-label="Fetched emails">
                {outcomes.map((outcome) => (
                  <OutcomeItem key={outcome.email.id} outcome={outcome} />
                ))}
              </ul>
              {updates > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      applyEmailUpdates(outcomes, todayIso())
                      setOutcomes(null)
                      setMessage(`Applied ${updates} ${updates === 1 ? 'update' : 'updates'}.`)
                    }}
                  >
                    Apply updates
                  </Button>
                  <Button variant="secondary" onClick={() => setOutcomes(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p role="status" className="mt-3 font-medium text-forest">
        {message}
      </p>
    </section>
  )
}
