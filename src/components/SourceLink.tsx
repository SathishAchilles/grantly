import { ExternalLink } from 'lucide-react'
import type { Source } from '../domain/types'

export function SourceLink({ source, label = 'Source' }: { source: Pick<Source, 'title' | 'url'>; label?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-small text-blue underline underline-offset-2"
    >
      {label}: {source.title}
      <ExternalLink aria-hidden="true" size={12} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
