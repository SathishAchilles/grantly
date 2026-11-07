import type { Overall, SchemeEvaluation } from './eligibility'
import type { Scheme } from './types'

/** Which schemes to show: all, only those still possible for the student, or only those that meet every condition. */
export type FitFilter = 'all' | 'possible' | 'meets'

/** A scheme paired with its evaluation for the active student. */
export interface ScoredScheme {
  scheme: Scheme
  evaluation: SchemeEvaluation
}

const possible: ReadonlySet<Overall> = new Set(['meets-listed-conditions', 'more-information-needed'])

/** Reads a fit filter from untrusted input such as a URL parameter, falling back to "all". */
export function parseFitFilter(value: string | null): FitFilter {
  return value === 'possible' || value === 'meets' ? value : 'all'
}

/**
 * Narrows the scheme list by a free-text search and an eligibility filter.
 *
 * @param items - Every scheme with its evaluation for the active student.
 * @param query - Text matched, case-insensitively, against the scheme name, provider and who it is for.
 * @param fit - Which eligibility outcomes to keep. Schemes closed to the student are never "possible".
 * @returns The matching schemes in their original order.
 */
export function filterSchemes(items: readonly ScoredScheme[], query: string, fit: FitFilter): ScoredScheme[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return items.filter(({ scheme, evaluation }) => {
    const text = [scheme.name, scheme.shortName, scheme.owner, scheme.applicantGroup, scheme.geography]
      .join(' ')
      .toLocaleLowerCase()
    if (!terms.every((term) => text.includes(term))) return false
    if (fit === 'meets') return evaluation.open && evaluation.overall === 'meets-listed-conditions'
    if (fit === 'possible') return evaluation.open && possible.has(evaluation.overall)
    return true
  })
}
