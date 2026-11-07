import { useId } from 'react'
import type { FundingSummary } from '../domain/funding'

type Part = 'family' | 'confirmed' | 'pending' | 'gap'

const BAR_HEIGHT = 20
const BRACKET_Y = BAR_HEIGHT + 10

const percent = (value: number, total: number) => `${(Math.max(0, value) / total) * 100}%`

const swatchClasses: Record<Part, string> = {
  family: 'bg-muted',
  confirmed: 'bg-forest',
  pending: 'bg-marigold ring-1 ring-ink/30 ring-inset',
  gap: 'bg-rust-soft ring-1 ring-rust ring-inset',
}

/** A small colour key that ties a term in the funding breakdown to its part of the gap bar. */
export function Swatch({ part }: { part: Part }) {
  return <span aria-hidden="true" className={`inline-block size-3 shrink-0 rounded-[3px] ${swatchClasses[part]}`} />
}

/**
 * Decorative bar that splits the year's costs into family contribution, confirmed support,
 * pending support and what is left. The bracket under it spans pending plus remaining,
 * because pending support is not counted in the gap. The numbers are in the text beside it.
 */
export function GapBar({ summary }: { summary: FundingSummary }) {
  const ids = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const total = Math.max(summary.costs, 1)
  const family = Math.min(summary.familyContribution, summary.costs)
  const confirmed = Math.min(summary.confirmedTotal, summary.costs - family)
  const pending = Math.min(summary.pendingTotal, summary.gap)
  const remaining = summary.gap - pending
  const gapStart = family + confirmed
  const segment = 'transition-[x,width] duration-700 ease-out'

  return (
    <svg aria-hidden="true" width="100%" height={BRACKET_Y + 4} className="block overflow-visible">
      <defs>
        <clipPath id={`${ids}-clip`}>
          <rect width="100%" height={BAR_HEIGHT} rx={BAR_HEIGHT / 2} />
        </clipPath>
        <pattern id={`${ids}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" className="fill-rust-soft" />
          <line x1="0" y1="0" x2="0" y2="6" strokeWidth="2" className="stroke-rust/45" />
        </pattern>
      </defs>
      <g clipPath={`url(#${ids}-clip)`}>
        <rect width="100%" height={BAR_HEIGHT} className="fill-muted-soft" />
        <rect x="0" width={percent(family, total)} height={BAR_HEIGHT} strokeWidth="2" className={`fill-muted stroke-surface ${segment}`} />
        <rect x={percent(family, total)} width={percent(confirmed, total)} height={BAR_HEIGHT} strokeWidth="2" className={`fill-forest stroke-surface ${segment}`} />
        <rect x={percent(gapStart, total)} width={percent(pending, total)} height={BAR_HEIGHT} strokeWidth="2" className={`fill-marigold stroke-surface ${segment}`} />
        <rect x={percent(gapStart + pending, total)} width={percent(remaining, total)} height={BAR_HEIGHT} fill={`url(#${ids}-hatch)`} className={segment} />
        <rect width="100%" height={BAR_HEIGHT} rx={BAR_HEIGHT / 2} fill="none" strokeWidth="2" className="stroke-ink/10" />
      </g>
      <rect x={percent(gapStart, total)} y={BRACKET_Y} width={percent(summary.gap, total)} height="2" rx="1" className={`fill-rust ${segment}`} />
    </svg>
  )
}
