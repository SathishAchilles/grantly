import { CircleCheck, Clock, Footprints, PartyPopper, type LucideIcon } from 'lucide-react'
import { Card } from '../components/Card'
import { Fact } from '../components/Fact'
import { Money } from '../components/Money'
import { StudentOnly } from '../components/StudentOnly'
import { TaskCard } from '../components/TaskCard'
import { fundingSummary, supportKindLabel } from '../domain/funding'
import { byDeadline } from '../domain/dates'
import type { Student, SupportItem } from '../domain/types'
import { useGrantlyStore } from '../store/useGrantlyStore'

interface SupportListProps {
  items: SupportItem[]
  icon: LucideIcon
  tone: string
}

function SupportList({ items, icon: Icon, tone }: SupportListProps) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 rounded-control bg-paper p-3">
          <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-pill ${tone}`}>
            <Icon size={18} strokeWidth={2.4} />
          </span>
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="min-w-0 font-semibold">
              {item.label} <span className="block text-small font-normal text-muted">({supportKindLabel[item.kind]})</span>
            </span>
            <span className="font-extrabold">
              <Money amount={item.amount} />
            </span>
          </span>
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
  const covered = Math.min(100, Math.round(((summary.costs - summary.gap) / summary.costs) * 100))

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="flex items-center gap-2 text-title font-extrabold">
          <Footprints aria-hidden="true" size={24} strokeWidth={2.2} className="text-forest" />
          Next actions
        </h2>
        {open.length === 0 ? (
          <p className="mt-3 flex items-center gap-3 rounded-card border border-hairline bg-surface p-5 text-muted shadow-soft">
            <PartyPopper aria-hidden="true" size={26} className="shrink-0 text-forest" />
            Nothing needs you right now.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {open.map((task, index) => (
              <TaskCard key={task.id} task={task} viewer="student" featured={index === 0} />
            ))}
          </div>
        )}
      </section>

      <Card aria-labelledby="position-heading">
        <h2 id="position-heading" className="text-title font-extrabold">
          Your funding position, 2026-27
        </h2>
        <div aria-hidden="true" className="mt-4">
          <div className="h-3 overflow-hidden rounded-pill bg-rust-soft">
            <div className="h-full rounded-pill bg-forest" style={{ width: `${covered}%` }} />
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1">
          <Fact label="Costs this year" termClassName="px-3 py-1.5" valueClassName="px-3 py-1.5 text-right font-bold">
            <Money amount={summary.costs} />
          </Fact>
          <Fact label="Family contribution" termClassName="px-3 py-1.5" valueClassName="px-3 py-1.5 text-right font-bold">
            <Money amount={summary.familyContribution} />
          </Fact>
          <Fact label="Confirmed support" termClassName="px-3 py-1.5" valueClassName="px-3 py-1.5 text-right font-bold text-forest-deep">
            <Money amount={summary.confirmedTotal} />
          </Fact>
          <Fact
            label="Still to find"
            termClassName="mt-2 rounded-l-control bg-rust-soft px-3 py-3 text-lg font-extrabold"
            valueClassName="mt-2 rounded-r-control bg-rust-soft px-3 py-3 text-right text-xl font-extrabold text-rust"
          >
            <Money amount={summary.gap} />
          </Fact>
        </dl>

        {summary.confirmed.length > 0 && (
          <>
            <h3 className="mt-6 font-extrabold">Confirmed support</h3>
            <SupportList items={summary.confirmed} icon={CircleCheck} tone="bg-forest-soft text-forest-deep" />
          </>
        )}

        {summary.pending.length > 0 ? (
          <>
            <h3 className="mt-6 font-extrabold">Pending, not counted in your gap</h3>
            <SupportList items={summary.pending} icon={Clock} tone="bg-marigold-soft text-ink" />
          </>
        ) : (
          summary.confirmed.length === 0 && (
            <p className="mt-6 rounded-control bg-paper p-3 text-muted">No scholarship support yet. See Opportunities.</p>
          )
        )}
      </Card>
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
