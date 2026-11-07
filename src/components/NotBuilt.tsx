import { Construction } from 'lucide-react'
import { Card } from './Card'

export function NotBuilt({ items }: { items: string[] }) {
  return (
    <Card aria-labelledby="not-built-heading" className="max-w-3xl">
      <h2 id="not-built-heading" className="flex items-center gap-2 text-title font-semibold">
        <Construction aria-hidden="true" size={22} className="text-forest" />
        Not built yet
      </h2>
      <p className="mt-2 text-muted">This area has no data yet. It is coming next, and will let you:</p>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
