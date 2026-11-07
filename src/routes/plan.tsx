import { Card } from '../components/Card'
import { EmailSync } from '../components/EmailSync'
import { Fact } from '../components/Fact'
import { Money } from '../components/Money'
import { StudentOnly } from '../components/StudentOnly'
import { TaskCard } from '../components/TaskCard'
import { fundingSummary, supportKindLabel } from '../domain/funding'
import { byDeadline } from '../domain/dates'
import type { Student, SupportItem } from '../domain/types'
import { useGrantlyStore } from '../store/useGrantlyStore'

function SupportList({ items }: { items: SupportItem[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap justify-between gap-x-4">
          <span>
            {item.label} <span className="text-small text-muted">({supportKindLabel[item.kind]})</span>
          </span>
          <Money amount={item.amount} />
        </li>
      ))}
    </ul>
  )
}

function FundingPlan({ student }: { student: Student }) {
  const summary = fundingSummary(student)
  const tasks = useGrantlyStore((state) => state.tasks)
  const open = tasks
    .filter((task) => task.studentId === student.id && task.status !== 'completed')
    .sort(byDeadline)

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card aria-labelledby="position-heading">
          <h2 id="position-heading" className="text-title font-semibold">
            Your funding position, 2026-27
          </h2>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2">
            <Fact label="Costs this year" termClassName="" valueClassName="text-right">
              <Money amount={summary.costs} />
            </Fact>
            <Fact label="Family contribution" termClassName="" valueClassName="text-right">
              <Money amount={summary.familyContribution} />
            </Fact>
            <Fact label="Confirmed support" termClassName="" valueClassName="text-right">
              <Money amount={summary.confirmedTotal} />
            </Fact>
            <Fact
              label="Still to find"
              termClassName="border-t border-hairline pt-2 text-lg font-semibold"
              valueClassName="border-t border-hairline pt-2 text-right text-lg font-semibold text-rust"
            >
              <Money amount={summary.gap} />
            </Fact>
          </dl>

          {summary.confirmed.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold">Confirmed support</h3>
              <SupportList items={summary.confirmed} />
            </>
          )}

          {summary.pending.length > 0 ? (
            <>
              <h3 className="mt-6 font-semibold">Pending, not counted in your gap</h3>
              <SupportList items={summary.pending} />
            </>
          ) : (
            summary.confirmed.length === 0 && <p className="mt-6 text-muted">No scholarship support yet. See Opportunities.</p>
          )}
        </Card>

        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-title font-semibold">
            Next actions
          </h2>
          {open.length === 0 ? (
            <p className="mt-3 text-muted">Nothing needs you right now.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {open.map((task) => (
                <TaskCard key={task.id} task={task} viewer="student" />
              ))}
            </div>
          )}
        </section>
      </div>
      <EmailSync key={student.id} student={student} />
    </div>
  )
}

export function Component() {
  return (
    <StudentOnly title="My funding plan" purpose="See what is confirmed, what is still missing, and who has to act next.">
      {(student) => <FundingPlan student={student} />}
    </StudentOnly>
  )
}
