import { Construction } from 'lucide-react'
import { Card } from './Card'

export function NotBuilt({ items }: { items: string[] }) {
  return (
    <Card aria-labelledby="not-built-heading" className="max-w-3xl">
      <h2 id="not-built-heading" className="flex items-center gap-3 text-title font-extrabold">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-control bg-marigold-soft text-ink">
          <Construction size={26} strokeWidth={2.2} />
        </span>
        Not built yet
      </h2>
      <p className="mt-2 text-muted">This area has no data yet. It is coming next, and will let you:</p>
      <ul className="mt-4 space-y-2 pl-1 marker:text-forest [&>li]:ml-5 [&>li]:list-disc [&>li]:pl-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
