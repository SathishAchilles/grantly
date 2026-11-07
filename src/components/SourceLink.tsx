import { ExternalLink } from 'lucide-react'
import type { Source } from '@/domain/types'

/** A link to the official source behind a claim, opening in a new tab and announcing that to assistive technology. */
export function SourceLink({ source, label = 'Source' }: { source: Pick<Source, 'title' | 'url'>; label?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-6 items-center gap-1 text-small font-semibold break-words text-blue underline decoration-blue/40 decoration-2 underline-offset-4 hover:decoration-blue"
    >
      {label}: {source.title}
      <ExternalLink aria-hidden="true" size={14} className="shrink-0" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
